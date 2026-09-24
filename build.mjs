import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
html=html.replace('<link rel="stylesheet" href="motion.css">','<style>\n'+fs.readFileSync(path.join(root,'motion.css'),'utf8')+'\n</style>');
html=html.replace('<script src="motion.js"></script>','<script>\n'+fs.readFileSync(path.join(root,'motion.js'),'utf8')+'\n</script>');
const refs=[...new Set(html.match(/assets\/[a-z-]+\.png/g)||[])];
const assets={};
for(const ref of refs){const data=fs.readFileSync(path.join(root,ref));assets[ref]='data:image/png;base64,'+data.toString('base64');}
html=html.replace(/src="(assets\/[a-z-]+\.png)"/g,'data-asset="$1"');
html=html.replace(/srcset="(assets\/[a-z-]+\.png)"/g,'data-asset-srcset="$1"');
const bootstrap=`<script>const embeddedAssets=${JSON.stringify(assets)};document.querySelectorAll('[data-asset]').forEach(e=>e.src=embeddedAssets[e.dataset.asset]);document.querySelectorAll('[data-asset-srcset]').forEach(e=>e.srcset=embeddedAssets[e.dataset.assetSrcset]);</script>`;
html=html.replace('<script>',bootstrap+'\n<script>');
html=html.replace('src="${c.image}"','src="${typeof embeddedAssets!==\'undefined\'?embeddedAssets[c.image]:c.image}"');
fs.writeFileSync(path.join(root,'督柏林Dublin官网.html'),html);
console.log(JSON.stringify({output:path.join(root,'督柏林Dublin官网.html'),assets:refs.length,bytes:Buffer.byteLength(html)}));
