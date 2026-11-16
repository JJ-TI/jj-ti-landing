import { readFile } from 'node:fs/promises';
import { readConfig } from './config.mjs';
import { makeStore } from './store.mjs';
import { startTelemetry, makeTelemetry } from './telemetry.mjs';
import { makeMailer } from './mail.mjs';
import { makeApp } from './app.mjs';
const config=readConfig();
if(config.environment==='production'){const html=await readFile('public/index.html','utf8');const canonical=html.match(/rel="canonical" href="([^"]+)"/);if(!canonical||new URL(canonical[1]).origin!==config.siteOrigin)throw new Error('Rebuild canonical metadata for SITE_ORIGIN before production');}
const store=makeStore(config.databaseUrl);
const sdk=startTelemetry(config);
await store.migrate();
const telemetry=makeTelemetry(config,store);
const mailer=makeMailer(config,store,telemetry);
const app=await makeApp({config,store,telemetry,mailer,staticRoot:'public'});
const timer=setInterval(()=>mailer.deliverOne().catch(()=>telemetry.log('mail.failed',{code:'store_unavailable'})),5000);
const cleanup=setInterval(()=>store.prune().catch(()=>telemetry.log('retention.failed',{code:'store_unavailable'})),3600000);
await store.prune();
await app.listen({host:'0.0.0.0',port:config.port});
for(const signal of ['SIGTERM','SIGINT'])process.once(signal,async()=>{
  clearInterval(timer);clearInterval(cleanup);
  await app.close();mailer.close();await store.close();await sdk.shutdown();
});
