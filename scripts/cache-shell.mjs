import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const files=await readdir('dist/assets');
const paths=['./','./index.html','./icon.svg','./manifest.webmanifest','./icon-192.png','./icon-512.png',...files.map(f=>'./assets/'+f)];
const version=createHash('sha256').update(await readFile('dist/index.html')).digest('hex').slice(0,12);
let sw=await readFile('public/sw.js','utf8');
sw=sw.replace("multi-khata-shell-v1",'multi-khata-'+version).replace("['./','./index.html','./icon.svg','./manifest.webmanifest']",JSON.stringify(paths));
await writeFile('dist/sw.js',sw);console.log('Offline shell precached:',paths.length,'files');
