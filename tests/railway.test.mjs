import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';

test('Railway pode iniciar com health check antes de receber domínio público',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'vt-ai-railway-'));
 const names=['VT_AI_DATA_DIR','VT_AI_PUBLIC_ORIGIN','RAILWAY_PROJECT_ID','RAILWAY_PUBLIC_DOMAIN'];
 const previous=Object.fromEntries(names.map(name=>[name,process.env[name]]));
 process.env.VT_AI_DATA_DIR=dir;delete process.env.VT_AI_PUBLIC_ORIGIN;process.env.RAILWAY_PROJECT_ID='test-project';delete process.env.RAILWAY_PUBLIC_DOMAIN;
 let server,closeStudio;
 try{
  ({server,closeStudio}=await import('../server.mjs'));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  const get=host=>new Promise((resolve,reject)=>{const req=http.get(base+'/api/health',{headers:{Host:host}},res=>{res.resume();resolve(res.statusCode)});req.on('error',reject)});
  assert.equal(await get('healthcheck.railway.app'),200);
  assert.equal(await get('unconfigured.up.railway.app'),403);
 }finally{
  if(closeStudio)await closeStudio();
  for(const name of names){if(previous[name]===undefined)delete process.env[name];else process.env[name]=previous[name]}
  assert.equal(path.dirname(dir),path.resolve(os.tmpdir()));assert.ok(path.basename(dir).startsWith('vt-ai-railway-'));fs.rmSync(dir,{recursive:true,force:true});
 }
});
