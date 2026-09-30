import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';

test('modo hospedado exige origem HTTPS e cookie Secure',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'vt-ai-hosted-'));
 const previous={dir:process.env.VT_AI_DATA_DIR,origin:process.env.VT_AI_PUBLIC_ORIGIN,setup:process.env.VT_AI_SETUP_CODE};
 process.env.VT_AI_DATA_DIR=dir;process.env.VT_AI_PUBLIC_ORIGIN='https://vtai.example.test';process.env.VT_AI_SETUP_CODE='hosted-setup-code-for-tests-123456789';
 let server,closeStudio;
 try{
  ({server,closeStudio}=await import('../server.mjs'));
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  const request=(route,headers={},body)=>new Promise((resolve,reject)=>{const req=http.request(base+route,{method:body?'POST':'GET',headers:{Host:'vtai.example.test',Origin:'https://vtai.example.test',...(body?{'Content-Type':'application/json'}:{}),...headers}},res=>{const chunks=[];res.on('data',chunk=>chunks.push(chunk));res.on('end',()=>resolve({status:res.statusCode,headers:{get:name=>res.headers[name.toLowerCase()]},json:async()=>JSON.parse(Buffer.concat(chunks).toString())}))});req.on('error',reject);req.end(body?JSON.stringify(body):undefined)});
  assert.equal((await fetch(base+'/api/health')).status,403);
  assert.equal((await request('/api/health',{Origin:'https://evil.example.test'})).status,403);
  const health=await (await request('/api/health')).json();assert.equal(health.ok,true,JSON.stringify(health));assert.equal(health.dataDir,undefined);
  const railway=await request('/api/health',{Host:'healthcheck.railway.app',Origin:''});assert.equal(railway.status,200);
  const created=await request('/api/auth/setup',{}, {email:'owner@example.test',name:'Admin',password:'a-long-test-password',setup_code:process.env.VT_AI_SETUP_CODE});
  assert.equal(created.status,200);assert.match(String(created.headers.get('set-cookie')),/; Secure;/);
  assert.equal((await request('/api/clients',{'Content-Type':'text/plain'})).status,401);
 }finally{
  if(closeStudio)await closeStudio();
  for(const [key,value] of Object.entries(previous)){const name={dir:'VT_AI_DATA_DIR',origin:'VT_AI_PUBLIC_ORIGIN',setup:'VT_AI_SETUP_CODE'}[key];if(value===undefined)delete process.env[name];else process.env[name]=value}
  assert.equal(path.dirname(dir),path.resolve(os.tmpdir()));assert.ok(path.basename(dir).startsWith('vt-ai-hosted-'));fs.rmSync(dir,{recursive:true,force:true});
 }
});
