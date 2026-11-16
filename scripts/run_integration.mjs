import { spawnSync } from 'node:child_process';
import { mkdtempSync,writeFileSync,rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
const dir=mkdtempSync(join(tmpdir(),'jjti-integration-'));
const password=randomBytes(32).toString('hex');
const envfile=join(dir,'database.env');writeFileSync(envfile,`POSTGRES_PASSWORD=${password}\n`,{mode:0o600});
const name=`jjti-test-${randomBytes(5).toString('hex')}`;
const docker=(args,extra={})=>spawnSync('docker',args,{encoding:'utf8',...extra});
try{
 const started=docker(['run','--rm','-d','--name',name,'--env-file',envfile,'-p','127.0.0.1::5432','postgres:17-alpine']);
 if(started.status!==0)throw new Error('PostgreSQL test container could not start');
 const port=docker(['port',name,'5432']).stdout.trim().split(':').at(-1);
 for(let i=0;i<60;i++){if(docker(['exec',name,'pg_isready','-U','postgres']).status===0)break;await new Promise(r=>setTimeout(r,500));}
 const env={...process.env,DATABASE_URL:`postgresql://postgres:${password}@127.0.0.1:${port}/postgres`,TEST_DATABASE_CONTAINER:name,NODE_ENV:'test',SITE_ORIGIN:'http://localhost:8080',DATA_KEY:randomBytes(32).toString('hex'),ANALYTICS_KEY:randomBytes(32).toString('hex'),IP_RATE_KEY:randomBytes(32).toString('hex')};
 const result=spawnSync(process.execPath,['--test','--test-concurrency=1','--test-timeout=120000','server/integration.test.mjs'],{env,stdio:'inherit'});
 process.exitCode=result.status===0?0:1;
}catch(e){console.error(e.message);process.exitCode=1;}
finally{docker(['rm','-f','-v',name]);rmSync(dir,{recursive:true,force:true});}
