import {mkdirSync,existsSync,readdirSync,cpSync,copyFileSync} from 'node:fs';
import {resolve} from 'node:path';
const out=resolve('public');
if(existsSync(out)&&readdirSync(out).length)throw new Error('public must be empty');
mkdirSync(out,{recursive:true});
for(const folder of ['assets','css','js','servicios'])cpSync(folder,`${out}/${folder}`,{recursive:true});
for(const name of ['index.html','privacidad.html','gracias.html','favicon.svg','robots.txt','sitemap.xml','llms.txt'])copyFileSync(name,`${out}/${name}`);
console.log('Public artifact built');
