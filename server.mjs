import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {legalPages, renderLegalPage} from './legal-layout.mjs';
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.pdf':'application/pdf'};
http.createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const slug=pathname.replace(/^\//,'').replace(/\/$/,'');
    if (Object.hasOwn(legalPages,slug)) {
      res.writeHead(200,{'Content-Type':types['.html']});res.end(await renderLegalPage(slug));return;
    }
    const rel=pathname==='/'?'index.html':pathname.slice(1);
    if(rel.split('/').some(part=>part==='..'||part.startsWith('.')))throw Error('path');
    const root=rel.startsWith('assets/')||rel==='plaquette-altages.pdf'?'public':'.';
    const data=await readFile(path.join(root,rel));
    res.writeHead(200,{'Content-Type':types[path.extname(rel)]||(rel.endsWith('.ttf')?'font/ttf':'application/octet-stream')});res.end(data);
  } catch {res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Page introuvable.');}
}).listen(4173,'127.0.0.1',()=>console.log('Altages: http://localhost:4173'));
