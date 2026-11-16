import nodemailer from 'nodemailer';
import { decrypt } from './crypto.mjs';
import { context, trace, ROOT_CONTEXT, SpanStatusCode } from '@opentelemetry/api';
export function makeMailer(config, store, telemetry) {
  const configured=!!(config.smtpHost&&config.smtpFrom);
  const transport=configured?nodemailer.createTransport({host:config.smtpHost,port:config.smtpPort,secure:config.smtpSecure,requireTLS:!config.smtpSecure&&!config.smtpAllowPlain,ignoreTLS:config.smtpAllowPlain,auth:config.smtpUser?{user:config.smtpUser,pass:config.smtpPass}:undefined,connectionTimeout:5000,greetingTimeout:5000,socketTimeout:10000,disableFileAccess:true,disableUrlAccess:true}):null;
  let running=false, checkedAt=0, healthy=false;
  let checking=null;
  return {
    configured,
    async ready() {
      if(!transport)return false;
      if(Date.now()-checkedAt<60000)return healthy;
      if(checking)return checking;
      checking=(async()=>{try{await transport.verify();healthy=true;}catch{healthy=false;}finally{checkedAt=Date.now();checking=null;}return healthy;})();
      return checking;
    },
    async deliverOne() {
      if(!transport||running)return false;
      running=true;
      const client=await store.pool.connect();
      try {
        await client.query('BEGIN');
        const {rows}=await client.query("SELECT * FROM leads WHERE status='queued' AND next_attempt_at<=now() ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1");
        if(!rows.length){await client.query('COMMIT');return false;}
        const row=rows[0];
        const parent=trace.setSpanContext(ROOT_CONTEXT,{traceId:row.trace_id,spanId:row.span_id,traceFlags:1,isRemote:true});
        const span=telemetry.tracer.startSpan('mail.dispatch',{},parent);
        const ctx=trace.setSpan(context.active(),span);
        try {
          const p=decrypt(config.dataKey,row.payload_cipher);
          const text=`Referencia: ${row.id}\nNombre: ${p.name}\nEmpresa: ${p.company}\nTeléfono: ${p.phone}\nCorreo: ${p.email}\nPlan: ${p.plan}\nNecesidades: ${p.needs.join(', ')}\n\n${p.message}`;
          const info=await transport.sendMail({from:config.smtpFrom,to:config.smtpTo,replyTo:p.email,subject:'JJ-TI — Solicitud de diagnóstico',messageId:`<${row.id}@jj-ti.net>`,text});
          if(!info.accepted?.length)throw new Error('SMTP not accepted');
          await client.query("UPDATE leads SET status='sent',attempts=attempts+1,sent_at=now() WHERE id=$1",[row.id]);
          telemetry.delivery('accepted');telemetry.log('mail.accepted',{attempt:row.attempts+1},ctx);
        } catch {
          const attempt=row.attempts+1;
          await client.query("UPDATE leads SET status=$2,attempts=$3,next_attempt_at=now()+($4::int*interval '1 second') WHERE id=$1",[row.id,attempt>=5?'failed':'queued',attempt,Math.min(3600,30*2**attempt)]);
          telemetry.delivery('failed');telemetry.log('mail.failed',{attempt,code:attempt>=5?'dead_letter':'retry_scheduled'},ctx);
          span.setStatus({code:SpanStatusCode.ERROR});
        } finally {span.end();}
        await client.query('COMMIT');return true;
      } catch(e){await client.query('ROLLBACK');throw e;}
      finally{client.release();running=false;}
    },
    close(){transport?.close();},
  };
}
