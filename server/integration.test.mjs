import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createServer} from 'node:http';
import {spawnSync} from 'node:child_process';
import {SMTPServer} from 'smtp-server';
import {makeStore} from './store.mjs';
import {makeApp} from './app.mjs';
import {readConfig} from './config.mjs';
import {startTelemetry,makeTelemetry} from './telemetry.mjs';
import {makeMailer} from './mail.mjs';
import {decrypt} from './crypto.mjs';
let store,app,mailer,smtp,sdk,config,collector,telemetry;const otlp=[];const records=[],mails=[];
const headers={origin:'http://localhost:8080','content-type':'application/json'};
const payload=()=>({idempotency_key:randomUUID(),name:'Persona Prueba',company:'Empresa Prueba',phone:'+503 7000 0000',email:'synthetic@example.com',plan:'Proyecto puntual',needs:['Diseño de software'],message:'Consulta sintética privada',privacy_consent:true});
const post=(url,body,extra={})=>app.inject({method:'POST',url,headers:{...headers,...extra},payload:body});
before(async()=>{
 collector=createServer((req,res)=>{const chunks=[];req.on('data',chunk=>chunks.push(chunk));req.on('end',()=>{otlp.push({path:req.url,body:Buffer.concat(chunks)});res.writeHead(200,{'content-type':'application/json'});res.end('{}');});});
 await new Promise(r=>collector.listen(0,'127.0.0.1',r));
 process.env.OTEL_EXPORTER_OTLP_ENDPOINT=`http://127.0.0.1:${collector.address().port}`;
 smtp=new SMTPServer({authOptional:true,disabledCommands:['STARTTLS'],onData(stream,session,callback){let body='';stream.on('data',chunk=>{body+=chunk;});stream.on('end',()=>{mails.push(body);callback();});}});
 await new Promise(r=>smtp.listen(0,'127.0.0.1',r));
 config=readConfig({...process.env,SMTP_HOST:'127.0.0.1',SMTP_PORT:String(smtp.server.address().port),SMTP_FROM:'web@example.com',SMTP_TO:'test@example.com',SMTP_ALLOW_PLAIN:'true',METRICS_PORT:'19464'});
 store=makeStore(config.databaseUrl);await store.pool.query('CREATE ROLE jjti_reader');await store.migrate();sdk=startTelemetry(config);
 telemetry=makeTelemetry(config,store,line=>records.push(JSON.parse(line)));mailer=makeMailer(config,store,telemetry);
 app=await makeApp({config,store,telemetry,mailer});await app.ready();
});
after(async()=>{
 try {
  await app?.close();mailer?.close();await store?.close();await sdk?.shutdown();
  assert.ok(otlp.some(x=>x.path==='/v1/traces'),'Missing trace export: '+JSON.stringify(otlp.map(x=>x.path)));
  assert.ok(otlp.some(x=>x.path==='/v1/logs'),'Missing log export: '+JSON.stringify(otlp.map(x=>x.path)));
  for(const record of otlp)assert.ok(!record.body.includes(Buffer.from('synthetic@example.com')));
 } finally {await new Promise(r=>smtp?.close(r));collector?.closeAllConnections();await new Promise(r=>collector?.close(r));}
});

test('durable, cifrado e idempotente, con envío SMTP real de laboratorio',async()=>{
 const p=payload();const first=await post('/api/v1/leads',p);assert.equal(first.statusCode,202);const ref=first.json().reference;
 assert.equal((await post('/api/v1/leads',p)).json().reference,ref);
 const conflict=await post('/api/v1/leads',{...p,message:'Otro contenido'});assert.equal(conflict.statusCode,409);
 const {rows}=await store.pool.query('SELECT * FROM leads WHERE id=$1',[ref]);assert.ok(!rows[0].payload_cipher.includes(p.email));assert.equal(decrypt(config.dataKey,rows[0].payload_cipher).email,p.email);
 assert.equal(await mailer.deliverOne(),true);assert.equal(mails.length,1);assert.match(mails[0],/Referencia:/);
 assert.equal((await store.pool.query('SELECT status FROM leads WHERE id=$1',[ref])).rows[0].status,'sent');
});
test('validación, origen, privacidad y tamaños se comprueban en servidor',async()=>{
 assert.equal((await post('/api/v1/leads',{...payload(),privacy_consent:false})).statusCode,400);
 assert.equal((await post('/api/v1/leads',{...payload(),email:'invalid'})).statusCode,400);
 assert.equal((await post('/api/v1/leads',{...payload(),needs:[]})).statusCode,400);
 assert.equal((await post('/api/v1/leads',payload(),{origin:'https://attacker.example'})).statusCode,403);
 assert.equal((await post('/api/v1/leads',{...payload(),message:'x'.repeat(18000)})).statusCode,413);
});
test('sesiones seudónimas, eventos deduplicados, TTL y borrado',async()=>{
 const visitor=randomUUID();const started=await post('/api/v1/analytics/session',{visitor_id:visitor,consent:true});assert.equal(started.statusCode,201);const token=started.json().token;
 const e={id:randomUUID(),kind:'click',target:'service-software'};
 for(let i=0;i<2;i++)assert.equal((await post('/api/v1/analytics/events',{token,events:[e]})).statusCode,204);
 assert.equal(Number((await store.pool.query('SELECT count(*) FROM analytics_events')).rows[0].count),1);
 const {rows}=await store.pool.query('SELECT * FROM analytics_sessions');assert.ok(!rows[0].visitor_hash.includes(visitor));
 await store.pool.query("UPDATE analytics_sessions SET last_seen=now()-interval '10 seconds'");
 assert.equal((await post('/api/v1/analytics/heartbeat',{token,visible_ms:40000,ended:false})).statusCode,204);
 assert.ok(Number((await store.pool.query('SELECT visible_ms FROM analytics_sessions')).rows[0].visible_ms)<12000);
 assert.equal((await post('/api/v1/analytics/events',{token,events:[{...e,id:randomUUID(),target:'email@example.com'}]})).statusCode,400);
 assert.equal((await post('/api/v1/analytics/heartbeat',{token:'forged',visible_ms:1,ended:false})).statusCode,401);
 assert.equal((await post('/api/v1/analytics/session',{visitor_id:visitor,consent:true},{'sec-gpc':'1'})).statusCode,403);
 assert.equal((await post('/api/v1/analytics/session',{visitor_id:visitor,consent:true},{dnt:'1'})).statusCode,403);
 await store.pool.query("UPDATE analytics_sessions SET last_seen=now()-interval '31 minutes'");
 assert.equal((await post('/api/v1/analytics/heartbeat',{token,visible_ms:10,ended:false})).statusCode,410);
 assert.equal((await post('/api/v1/analytics/forget',{token})).statusCode,204);
 assert.equal(Number((await store.pool.query('SELECT count(*) FROM analytics_events')).rows[0].count),0);
});
test('métricas nativas no contienen identificadores de navegador ni PII',async()=>{
 const response=await fetch('http://127.0.0.1:19464/metrics');const body=await response.text();assert.equal(response.status,200);
 assert.match(body,/jjti_http_requests_total/);assert.match(body,/^jjti_http_request_duration_seconds_bucket/m);assert.match(body,/jjti_active_sessions/);
 for(const value of ['synthetic@example.com','Persona Prueba','Consulta sintética privada','visitor_hash'])assert.ok(!body.includes(value));
});
test('logs correlacionados y mínimos, sin payload ni query',async()=>{
 await app.inject({url:'/health/live?secret=do-not-log'});
 assert.ok(records.some(r=>r.event==='http.request'&&r.trace_id));
 const all=JSON.stringify(records);for(const value of ['synthetic@example.com','Persona Prueba','Consulta sintética privada','do-not-log'])assert.ok(!all.includes(value));
 assert.equal((await app.inject({url:'/metrics'})).statusCode,404);
 assert.equal((await app.inject({url:'/health/ready'})).statusCode,200);
});
test('formulario nativo confirma con referencia sin depender de JavaScript',async()=>{
 const p=payload(),form=new URLSearchParams();
 for(const [key,value] of Object.entries(p))if(key==='needs')for(const need of value)form.append('needs',need);else form.set(key,key==='privacy_consent'?'Aceptado':value);
 const response=await app.inject({method:'POST',url:'/api/v1/leads',headers:{origin:config.siteOrigin,'content-type':'application/x-www-form-urlencoded'},payload:form.toString()});
 assert.equal(response.statusCode,303);assert.match(response.headers.location,/^\/gracias.html\?ref=[a-f0-9-]{36}$/);
});
test('rate limit bloquea abuso de contacto',async()=>{
 const p=payload();const responses=[];for(let i=0;i<6;i++)responses.push((await post('/api/v1/leads',p)).statusCode);
 assert.ok(responses.includes(429));
});
test('fallo SMTP queda reintentable y quinto intento termina en cola fallida',async()=>{
 const id=randomUUID();const p=payload();
 const {encrypt,hash}=await import('./crypto.mjs');
 await store.pool.query("UPDATE leads SET next_attempt_at=now()+interval '1 day' WHERE status='queued'");
 const row=await store.lead({idempotencyKey:id,payloadHash:hash(config.dataKey,JSON.stringify(p)),payloadCipher:encrypt(config.dataKey,p),traceId:'1'.repeat(32),spanId:'2'.repeat(16)});
 const broken=makeMailer({...config,smtpPort:1},store,telemetry);
 await broken.deliverOne();let result=(await store.pool.query('SELECT * FROM leads WHERE id=$1',[row.id])).rows[0];assert.equal(result.status,'queued');assert.equal(result.attempts,1);assert.ok(result.next_attempt_at>new Date());
 await store.pool.query('UPDATE leads SET attempts=4,next_attempt_at=now() WHERE id=$1',[row.id]);await broken.deliverOne();result=(await store.pool.query('SELECT * FROM leads WHERE id=$1',[row.id])).rows[0];assert.equal(result.status,'failed');broken.close();
});

test('varias pestañas del mismo navegador no inflan visitas',async()=>{
 const visitor=randomUUID();
 const first=await post('/api/v1/analytics/session',{visitor_id:visitor,consent:true});
 const second=await post('/api/v1/analytics/session',{visitor_id:visitor,consent:true});
 assert.equal(first.statusCode,201);assert.equal(second.statusCode,201);
 const before=await store.pool.query('SELECT count(DISTINCT visit_id) AS visits,count(*) AS tabs FROM analytics_sessions');
 assert.equal(Number(before.rows[0].visits),1);assert.equal(Number(before.rows[0].tabs),2);
 await store.pool.query("UPDATE analytics_visits SET last_seen=now()-interval '31 minutes'");
 assert.equal((await post('/api/v1/analytics/session',{visitor_id:visitor,consent:true})).statusCode,201);
 const after=await store.pool.query('SELECT count(*) AS visits FROM analytics_visits');assert.equal(Number(after.rows[0].visits),2);
 await post('/api/v1/analytics/forget',{token:first.json().token});
});

test('rol de dashboards solo accede a vistas agregadas',async()=>{
 const {rows}=await store.pool.query("SELECT has_table_privilege('jjti_reader','analytics_daily','SELECT') AS aggregate,has_table_privilege('jjti_reader','leads','SELECT') AS leads,has_table_privilege('jjti_reader','analytics_sessions','SELECT') AS identifiers");
 assert.equal(rows[0].aggregate,true);assert.equal(rows[0].leads,false);assert.equal(rows[0].identifiers,false);
});

test('backup y restauración aislada conservan referencias y payload cifrado',async()=>{
 const dump=spawnSync('docker',['exec',process.env.TEST_DATABASE_CONTAINER,'pg_dump','-U','postgres','-d','postgres','-Fc']);assert.equal(dump.status,0);
 await store.pool.query('CREATE DATABASE jjti_restore_check');
 const restored=spawnSync('docker',['exec','-i',process.env.TEST_DATABASE_CONTAINER,'pg_restore','-U','postgres','-d','jjti_restore_check','--no-owner','--no-acl'],{input:dump.stdout});assert.equal(restored.status,0);
 const pg=await import('pg');const pool=new pg.default.Pool({connectionString:process.env.DATABASE_URL.replace(/\/postgres$/,'/jjti_restore_check')});
 try{const original=await store.pool.query('SELECT count(*) FROM leads');const copy=await pool.query('SELECT count(*) FROM leads');assert.equal(copy.rows[0].count,original.rows[0].count);const {rows}=await pool.query('SELECT payload_cipher FROM leads LIMIT 1');assert.equal(decrypt(config.dataKey,rows[0].payload_cipher).email,'synthetic@example.com');}
 finally{await pool.end();await store.pool.query('DROP DATABASE jjti_restore_check');}
});
