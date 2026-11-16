import {writeFileSync} from 'node:fs';
import {leadSchema} from '../server/app.mjs';
const request=(schema)=>({required:true,content:{'application/json':{schema}}});
const response=description=>({description});
const token={type:'string',maxLength:200};
const uuid={type:'string',format:'uuid'};
const object=(properties)=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
const spec={openapi:'3.1.0',info:{title:'JJ-TI Web API',version:'1.0.0',description:'Contacto durable y analítica consentida. Requiere Origin exacto del sitio. Las operaciones analíticas requieren token de sesión, no identidad de cliente. No hay API pública de reportes.'},servers:[{url:'https://jj-ti.net'}],paths:{
 '/health/live':{get:{summary:'Proceso vivo; no acredita dependencias',responses:{200:response('Proceso disponible')}}},
 '/health/ready':{get:{summary:'DB accesible y transporte de correo configurado; no acredita entrega final',responses:{200:response('Preparado'),503:response('No preparado')}}},
 '/api/v1/leads':{post:{summary:'Registrar solicitud e idempotencia durante retención de 30 días',requestBody:request(leadSchema),responses:{202:{description:'Persistido. SMTP pendiente, aceptado o fallido; no garantiza entrega o lectura.',content:{'application/json':{schema:object({reference:uuid,status:{enum:['queued','sent','failed']},request_id:uuid})}}},303:response('Formulario nativo: redirección a confirmación con referencia'),400:response('Validación fallida'),403:response('Origin no permitido'),409:response('Clave reutilizada con datos diferentes'),413:response('Más de 16 KiB'),429:response('Límite de 5 solicitudes por 10 minutos/IP'),503:response('Receptor no disponible')}}},
 '/api/v1/analytics/session':{post:{summary:'Crear visita seudónima con consentimiento; GPC/DNT bloquean',requestBody:request(object({visitor_id:uuid,consent:{const:true}})),responses:{201:{description:'Token firmado con vigencia máxima de 24 h; sesión expira tras 30 min sin heartbeat',content:{'application/json':{schema:object({token})}}},403:response('Origin o señal de privacidad'),429:response('20 sesiones por 10 minutos/IP')}}},
 '/api/v1/analytics/heartbeat':{post:{summary:'Actualizar tiempo visible acotado por reloj servidor; activo significa visto en 90 s',requestBody:request(object({token,visible_ms:{type:'integer',minimum:0,maximum:45000},ended:{type:'boolean'}})),responses:{204:response('Actualizado'),401:response('Token inválido'),410:response('Sesión inactiva o finalizada')}}},
 '/api/v1/analytics/events':{post:{summary:'Hasta 20 eventos por lote; solo taxonomía permitida, sin URLs, texto ni PII',requestBody:request(object({token,events:{type:'array',minItems:1,maxItems:20,items:object({id:uuid,kind:{enum:['page','section','click','error']},target:{type:'string',maxLength:80}})}})),responses:{204:response('Insertados o ya existentes (idempotencia por UUID)'),400:response('Evento no permitido'),401:response('Token inválido'),410:response('Sesión caducada')}}},
 '/api/v1/analytics/forget':{post:{summary:'Eliminar sesiones y eventos del navegador asociado al token; no elimina solicitudes comerciales',requestBody:request(object({token})),responses:{204:response('Datos eliminados o inexistentes'),401:response('Token inválido')}}}
}};
spec.paths['/api/v1/leads'].post.requestBody.content['application/x-www-form-urlencoded']={schema:{type:'object',description:'Formulario nativo: needs puede repetirse; privacy_consent=Acceptado no es válido, debe ser Aceptado. Clave idempotente opcional en modo nativo; se genera una referencia por envío.'}};
writeFileSync('docs/api/openapi.json',JSON.stringify(spec,null,2)+'\n');
console.log('Contrato OpenAPI generado');
