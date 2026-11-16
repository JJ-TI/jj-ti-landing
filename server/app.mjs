import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
import fastifyStatic from '@fastify/static';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { resolve } from 'node:path';
import { ROOT_CONTEXT, propagation, trace, SpanStatusCode, SpanKind } from '@opentelemetry/api';
import { encrypt, hash, token, verifyToken } from './crypto.mjs';
import { needs, plans, pages, sections, actions } from './catalog.mjs';
const uuid={type:'string',format:'uuid'};
const bodySchema=(properties,required=Object.keys(properties))=>({type:'object',additionalProperties:false,properties,required});
const text=max=>({type:'string',minLength:1,maxLength:max,pattern:'[^\\s]'});
export const leadSchema=bodySchema({idempotency_key:uuid,name:text(120),company:text(160),phone:{...text(30),pattern:'^[+0-9() .-]{6,30}$'},email:{type:'string',format:'email',maxLength:254},plan:{enum:plans},needs:{type:'array',items:{enum:needs},minItems:1,maxItems:10,uniqueItems:true},message:text(3000),privacy_consent:{const:true}});
export async function makeApp({config,store,telemetry,mailer,staticRoot}) {
  const app=Fastify({logger:false,bodyLimit:16384,requestTimeout:15000,connectionTimeout:10000,trustProxy:config.trustedProxies,genReqId:()=>randomUUID(),ajv:{customOptions:{removeAdditional:false,coerceTypes:false}}});
  await app.register(helmet,{contentSecurityPolicy:{directives:{defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'",'https://fonts.googleapis.com'],fontSrc:["'self'",'https://fonts.gstatic.com'],imgSrc:["'self'",'data:'],connectSrc:["'self'"],formAction:["'self'"],frameAncestors:["'none'"],objectSrc:["'none'"],baseUri:["'self'"]}},referrerPolicy:{policy:'strict-origin-when-cross-origin'}});
  await app.register(rateLimit,{hook:'preHandler',max:120,timeWindow:'1 minute',keyGenerator:req=>hash(config.rateKey,req.ip),errorResponseBuilder:()=>({statusCode:429,error:'rate_limited'})});
  app.addContentTypeParser('application/x-www-form-urlencoded',{parseAs:'string'},(req,body,done)=>{
    const values=new URLSearchParams(body);
    done(null,{idempotency_key:values.get('idempotency_key')||randomUUID(),name:values.get('name'),company:values.get('company'),phone:values.get('phone'),email:values.get('email'),plan:values.get('plan'),needs:values.getAll('needs'),message:values.get('message'),privacy_consent:values.get('privacy_consent')==='Aceptado'});
  });
  app.addHook('onRequest',async(req,reply)=>{
    req.started=performance.now();
    // No query strings ni identificadores de sesión en nombres/atributos de trazas.
    const route=req.routeOptions.url||'unmatched';
    req.otelSpan=telemetry.tracer.startSpan(`${req.method} ${route}`,{kind:SpanKind.SERVER,attributes:{'http.request.method':req.method,'http.route':route}},propagation.extract(ROOT_CONTEXT,req.headers));
    req.otelContext=trace.setSpan(ROOT_CONTEXT,req.otelSpan);
    reply.header('x-request-id',req.id);
    if(req.url.startsWith('/api/')||req.url.startsWith('/health/'))reply.header('cache-control','no-store');
    if(['POST','DELETE'].includes(req.method)&&req.url.startsWith('/api/')) {
      if(req.headers.origin!==config.siteOrigin)return reply.code(403).send({error:'origin_not_allowed',request_id:req.id});
      if(!req.headers['content-type']?.startsWith('application/json') && !(req.url==='/api/v1/leads'&&req.headers['content-type']?.startsWith('application/x-www-form-urlencoded')))return reply.code(415).send({error:'json_required',request_id:req.id});
    }
  });
  app.addHook('onResponse',async(req,reply)=>{
    if(!req.otelSpan)return;
    const route=req.routeOptions.url||'unmatched';
    const elapsed=(performance.now()-req.started)/1000;
    telemetry.request(route,req.method,reply.statusCode,elapsed);
    telemetry.log('http.request',{request_id:req.id,route,method:req.method,status:reply.statusCode,duration_ms:Math.round(elapsed*1000)},req.otelContext);
    req.otelSpan.setAttribute('http.response.status_code',reply.statusCode);
    if(reply.statusCode>=500)req.otelSpan.setStatus({code:SpanStatusCode.ERROR});
    req.otelSpan.end();
  });
  app.setErrorHandler((error,req,reply)=>{
    const status=error.validation?400:(error.statusCode&&error.statusCode<500?error.statusCode:503);
    reply.header('cache-control','no-store').code(status).send({error:status===400?'invalid_request':status===413?'body_too_large':status===429?'rate_limited':'temporarily_unavailable',request_id:req.id});
  });
  app.get('/health/live',async()=>({status:'alive',version:config.version}));
  app.get('/health/ready',async(req,reply)=>{
    try{await store.ping();if(!await mailer.ready())throw new Error('Mail not ready');return {status:'ready',version:config.version};}
    catch{return reply.code(503).send({status:'not_ready',request_id:req.id});}
  });
  app.post('/api/v1/leads',{schema:{body:leadSchema},config:{rateLimit:{max:5,timeWindow:'10 minutes'}}},async(req,reply)=>{
    if(!mailer.configured)return reply.code(503).send({error:'contact_unavailable',request_id:req.id});
    const {idempotency_key,...payload}=req.body;
    const normalized={...payload,name:payload.name.trim(),company:payload.company.trim(),email:payload.email.trim().toLowerCase(),message:payload.message.trim(),needs:[...payload.needs].sort()};
    const span=telemetry.tracer.startSpan('lead.persist',{},req.otelContext);
    try {
      const row=await store.lead({idempotencyKey:idempotency_key,payloadHash:hash(config.dataKey,JSON.stringify(normalized)),payloadCipher:encrypt(config.dataKey,normalized),traceId:req.otelSpan.spanContext().traceId,spanId:req.otelSpan.spanContext().spanId});
      if(!row)return reply.code(409).send({error:'idempotency_conflict',request_id:req.id});
      if(req.headers['content-type'].startsWith('application/x-www-form-urlencoded')) return reply.redirect(`/gracias.html?ref=${row.id}`,303);
      return reply.code(202).send({reference:row.id,status:row.status,request_id:req.id});
    } finally{span.end();}
  });
  const denied=req=>req.headers['sec-gpc']==='1'||req.headers.dnt==='1';
  const sessionId=req=>verifyToken(config.analyticsKey,req.body?.token);
  app.post('/api/v1/analytics/session',{schema:{body:bodySchema({visitor_id:uuid,consent:{const:true}})},config:{rateLimit:{max:20,timeWindow:'10 minutes'}}},async(req,reply)=>{
    if(denied(req))return reply.code(403).send({error:'privacy_signal'});
    const id=await store.startSession(hash(config.analyticsKey,req.body.visitor_id));
    return reply.code(201).send({token:token(config.analyticsKey,id)});
  });
  app.post('/api/v1/analytics/heartbeat',{schema:{body:bodySchema({token:text(200),visible_ms:{type:'integer',minimum:0,maximum:45000},ended:{type:'boolean'}})}},async(req,reply)=>{
    if(denied(req))return reply.code(403).send({error:'privacy_signal'});
    const id=sessionId(req);if(!id)return reply.code(401).send({error:'invalid_session'});
    if(!await store.heartbeat(id,req.body.visible_ms,req.body.ended))return reply.code(410).send({error:'session_expired'});
    return reply.code(204).send();
  });
  app.post('/api/v1/analytics/events',{schema:{body:bodySchema({token:text(200),events:{type:'array',minItems:1,maxItems:20,items:bodySchema({id:uuid,kind:{enum:['page','section','click','error']},target:text(80)})}})}},async(req,reply)=>{
    if(denied(req))return reply.code(403).send({error:'privacy_signal'});
    const id=sessionId(req);if(!id)return reply.code(401).send({error:'invalid_session'});
    for(const e of req.body.events){const allowed=e.kind==='page'?pages:e.kind==='section'?sections:e.kind==='click'?actions:['runtime','resource'];if(!allowed.includes(e.target))return reply.code(400).send({error:'invalid_event'});}
    if(!await store.events(id,req.body.events))return reply.code(410).send({error:'session_expired'});
    return reply.code(204).send();
  });
  app.post('/api/v1/analytics/forget',{schema:{body:bodySchema({token:text(200)})}},async(req,reply)=>{
    const id=sessionId(req);if(!id)return reply.code(401).send({error:'invalid_session'});
    await store.forget(id);return reply.code(204).send();
  });
  if(staticRoot)await app.register(fastifyStatic,{root:resolve(staticRoot),wildcard:false,index:['index.html'],setHeaders:res=>res.setHeader('cache-control','public, max-age=300')});
  app.setNotFoundHandler((req,reply)=>reply.header('cache-control','no-store').code(404).send({error:'not_found',request_id:req.id}));
  return app;
}
