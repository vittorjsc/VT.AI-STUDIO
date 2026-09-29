import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {briefSchema} from '../lib/creative-policy.mjs';

test('HTTP, migrações, conhecimento, proteção local e idempotência',async t=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'vt-ai-http-'));
  const previousDir=process.env.VT_AI_DATA_DIR,previousKey=process.env.OPENAI_API_KEY,nativeFetch=globalThis.fetch;
  process.env.VT_AI_DATA_DIR=dir;process.env.OPENAI_API_KEY='mock-key-for-isolated-test';
  const plan={...Object.fromEntries(Object.entries(briefSchema.properties).filter(([,item])=>item.type==='string').map(([name])=>[name,''])),headline:'Feliz Dia do Cliente',copy_origin:{headline:'tematica',support:'vazio',cta:'vazio'},facts:[],alerts:[]};
  let paidCalls=0;
  globalThis.fetch=async()=>{paidCalls++;return Response.json({output:[{content:[{type:'output_text',text:JSON.stringify(plan)}]}]})};
  let closeStudio,server;
  try{
    ({server,closeStudio}=await import('../server.mjs'));
    globalThis.fetch=nativeFetch;
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    const address=`http://127.0.0.1:${server.address().port}`;
    const health=await (await nativeFetch(address+'/api/health')).json();assert.equal(health.version,'1.1.1');assert.equal(health.dataDir,dir);
    const knowledge=await (await nativeFetch(address+'/api/knowledge?q=Pedido%20curto')).json();assert.ok(knowledge.some(item=>item.source==='conhecimento/14_intuicao_e_producao.md'&&item.heading==='Pedido curto, plano completo'));
    assert.equal((await nativeFetch(address+'/')).status,200);
    assert.match(await (await nativeFetch(address+'/creative.js')).text(),/Gerar arte · automático/);
    const input={prompt:'Dia do Cliente para uma cafeteria.',images:[],request_id:'repeated-request-123'};
    const post=body=>nativeFetch(address+'/api/briefing',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const first=await (await post(input)).json(),second=await (await post(input)).json();assert.equal(first._token,second._token);assert.equal(paidCalls,1);
    assert.equal((await post({...input,prompt:'Outro pedido totalmente diferente.'})).status,400);assert.equal(paidCalls,1);
    const cross=await nativeFetch(address+'/api/briefing',{method:'POST',headers:{Origin:'https://external.test','Content-Type':'application/json'},body:JSON.stringify(input)});assert.equal(cross.status,403);assert.equal(paidCalls,1);
    const hostStatus=await new Promise(resolve=>{const request=http.get(address+'/api/health',{headers:{Host:'evil.test'}},response=>{response.resume();resolve(response.statusCode)});request.on('error',()=>resolve(0))});assert.equal(hostStatus,403);
    assert.equal((await nativeFetch(address+'/files/..%2Fstudio.sqlite')).status,404);
    assert.equal((await nativeFetch(address+'/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:'{'})).status,400);
    assert.deepEqual(await (await nativeFetch(address+'/api/generations')).json(),[]);
    assert.ok(!JSON.stringify(first).includes('mock-key-for-isolated-test'));
  }finally{
    globalThis.fetch=nativeFetch;
    if(closeStudio)await closeStudio();
    if(previousDir===undefined)delete process.env.VT_AI_DATA_DIR;else process.env.VT_AI_DATA_DIR=previousDir;
    if(previousKey===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=previousKey;
    assert.equal(path.dirname(dir),path.resolve(os.tmpdir()));assert.ok(path.basename(dir).startsWith('vt-ai-http-'));fs.rmSync(dir,{recursive:true,force:true});
  }
});
