import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

function ui(overrides={}){
  const elements={'#creativePrompt':{value:'Pedido original para minha loja.'}};
  const storage=new Map(),pendingReaders=[];
  const state={draft:'Pedido original para minha loja.',format:'feed',attachments:[],clients:[],generations:[],...overrides};
  const context={state,crypto:crypto.webcrypto,Set,FileReader:class{readAsDataURL(file){pendingReaders.push(()=>{this.result='data:image/png;base64,'+file.name;this.onload()})}},localStorage:{setItem:(key,value)=>storage.set(key,value),getItem:key=>storage.get(key)},$:selector=>elements[selector],document:{querySelectorAll:()=>[],querySelector:()=>null},render:()=>{},toast:()=>{},esc:value=>String(value||'')};
  vm.createContext(context);vm.runInContext(fs.readFileSync(new URL('../public/creative.js',import.meta.url),'utf8'),context);
  return {context,state,elements,pendingReaders,storage};
}
test('carregar anexo preserva pedido, incluindo texto digitado durante a leitura',async()=>{
  const {context,state,elements,pendingReaders}=ui();const upload=context.creativeAttachFiles([{name:'ref.png',type:'image/png',size:30}]);
  elements['#creativePrompt'].value='Pedido atualizado enquanto lê o arquivo';state.draft=elements['#creativePrompt'].value;
  pendingReaders.forEach(finish=>finish());await upload;assert.equal(state.draft,'Pedido atualizado enquanto lê o arquivo');assert.equal(state.attachments.length,1);
});
test('uploads simultâneos nunca ultrapassam quatro anexos',async()=>{
  const {context,state,pendingReaders}=ui({attachments:[{name:'existing'}]});
  const file=name=>({name,type:'image/png',size:30});
  const first=context.creativeAttachFiles([file('a'),file('b')]),second=context.creativeAttachFiles([file('c'),file('d')]);
  assert.equal(state.pendingUploads,3);pendingReaders.forEach(finish=>finish());await Promise.all([first,second]);assert.equal(state.attachments.length,4);assert.equal(state.pendingUploads,0);
});
test('um clique duplo no gerar não duplica planejamento nem imagem',async()=>{
  const {context,state}=ui();let finish,calls=0;
  context.api=async url=>{calls++;if(url==='/api/briefing')return new Promise(resolve=>{finish=()=>resolve({headline:'Cliente',clarification:'',_token:'signed'})});if(url==='/api/generate')return {id:'art-1',format:'feed',review:{status:'aprovada'}};throw Error(url)};
  const first=context.creativeGenerate();await context.creativeGenerate();assert.equal(calls,1);finish();await first;assert.equal(calls,2);assert.equal(state.generations.length,1);
});
test('revisão em segundo plano não apaga pedido de edição',async()=>{
  const art={id:'art-1',review:{}};const {context,state}=ui({generations:[art],editDraft:'Troque apenas o título',editing:art});context.api=async()=>({status:'aprovada'});
  await context.creativeReview(art.id);assert.equal(state.editDraft,'Troque apenas o título');assert.equal(art.review.status,'aprovada');
});
test('a pergunta essencial mantém pedido e não gera imagem',async()=>{
  const {context,state}=ui();let calls=0;context.api=async()=>{calls++;return {clarification:'Qual produto você quer anunciar?'}};
  await context.creativeGenerate();assert.equal(calls,1);assert.equal(state.generations.length,0);assert.equal(state.draft,'Pedido original para minha loja.');assert.equal(state.creativeBusy,'');
});
test('plano invalidado por mudança do pedido não é reutilizado',()=>{
  const {context,state}=ui({briefing:{headline:'Anterior'},creativeError:'Anterior'});context.creativeInvalidateBrief(false);assert.equal(state.briefing,null);assert.equal(state.creativeError,'');
});
