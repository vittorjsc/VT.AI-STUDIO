import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {createCreativeEngine,safeImage} from '../lib/creative-engine.mjs';
import {briefSchema,reviewSchema,normalizeBrief,normalizeReview,selectKnowledge,renderPrompt,inside} from '../lib/creative-policy.mjs';

const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aizsAAAAASUVORK5CYII=';
const image=(kind='logo')=>({name:'marca-ficticia.png',kind,data:'data:image/png;base64,'+png});
const plan=()=>({...Object.fromEntries(Object.entries(briefSchema.properties).filter(([,schema])=>schema.type==='string').map(([name])=>[name,''])),objective:'Relacionamento com clientes',concept:'Acolhimento com foco no café',visual_direction:'Fotografia natural com luz lateral',headline:'Feliz Dia do Cliente',copy_origin:{headline:'tematica',support:'vazio',cta:'vazio'},facts:[],alerts:[]});
const review=()=>({score:9,decision:'publicavel',problems:[],criteria:['conteudo','hierarquia','marca_produto','legibilidade','acabamento'].map(name=>({name,score:4,evidence:'Elemento visível e coerente.',uncertain:false})),strengths:['Mensagem dominante'],suggested_fix:''});
function fixture(t,options={}){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'vt-ai-test-'));fs.mkdirSync(path.join(dir,'assets'));
  const db=new DatabaseSync(':memory:');
  db.exec(`CREATE TABLE clients(id TEXT,name TEXT,niche TEXT,status TEXT,profile TEXT);
    CREATE TABLE docs(title TEXT,heading TEXT,source TEXT,body TEXT);
    CREATE TABLE generations(id TEXT,prompt TEXT,assets_json TEXT,output_path TEXT,status TEXT,created_at TEXT,format TEXT,brief_json TEXT,review_json TEXT DEFAULT '{}',refs_json TEXT DEFAULT '[]',client_id TEXT,parent_id TEXT,operation TEXT,edit_request TEXT,feedback_json TEXT DEFAULT '{}');`);
  db.prepare('INSERT INTO clients VALUES(?,?,?,?,?)').run('cafe','Café Teste','Gastronomia','active',JSON.stringify({color:'#557722',tone:'Acolhedor',preferences:'Sem dourado',confirmed_details:'Rua Teste, 10'}));
  db.prepare('INSERT INTO clients VALUES(?,?,?,?,?)').run('outro','Outro Cliente','Automotivo','active',JSON.stringify({confirmed_details:'SEGREDO_OUTRA_MARCA'}));
  db.prepare('INSERT INTO docs VALUES(?,?,?,?)').run('Intuição','Pedido curto','conhecimento/14_intuicao_e_producao.md','Uma mensagem dominante para Dia do Cliente.');
  db.prepare('INSERT INTO docs VALUES(?,?,?,?)').run('Arquitetura','Interno','conhecimento/12_especificacao_sistema_local.md','INSTRUCAO_INAPLICAVEL');
  const calls=[];
  const fetchImpl=async(url,config)=>{
    calls.push({url,config});
    if(options.failure)throw Object.assign(Error('mock'),{cause:{code:'ECONNRESET'}});
    if(url.endsWith('/responses')){
      const body=JSON.parse(config.body),isReview=body.text.format.name==='vt_quality_gate';
      return Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(isReview?(options.review||review()):(options.plan||plan()))}]}]});
    }
    return Response.json({data:[{b64_json:png}]});
  };
  const engine=createCreativeEngine({db,dataDir:dir,fetchImpl,apiKey:()=>options.noKey?null:'mock-not-a-real-key'});
  t.after(()=>{db.close();assert.equal(path.dirname(dir),path.resolve(os.tmpdir()));assert.ok(path.basename(dir).startsWith('vt-ai-test-'));fs.rmSync(dir,{recursive:true,force:true})});
  return {engine,calls,db,dir};
}
const body=()=>({prompt:'Uma arte de Dia do Cliente para minha cafeteria.',format:'feed',client_id:'cafe',images:[image()]});

test('schemas estruturados têm todos os campos obrigatórios e não aceitam extras',()=>{
  function visit(schema){if(schema.type==='object'){assert.equal(schema.additionalProperties,false);assert.deepEqual(schema.required,Object.keys(schema.properties));for(const value of Object.values(schema.properties))visit(value)}if(schema.items)visit(schema.items)}
  visit(briefSchema);visit(reviewSchema);
});
test('retrieval só utiliza conteúdo de produção e respeita orçamento',()=>{
  const rows=[{title:'Carro',heading:'Produto',source:'conhecimento/06_nichos_e_referencias.md',body:'Carro fiel, roda e reflexos.'},{title:'Carro',heading:'Banco',source:'conhecimento/12_especificacao_sistema_local.md',body:'Banco de dados'}];
  const result=selectKnowledge(rows,'carro',1);assert.equal(result.length,1);assert.match(result[0].source,/06_/);
});
test('copy temática é permitida mas fatos não confirmados são removidos',()=>{
  const raw=plan();raw.support='Só hoje R$ 999,00';raw.copy_origin.support='tematica';raw.facts=[{value:'999',origin:'usuario',evidence:'desconto'}];
  const result=normalizeBrief(raw,{prompt:'Dia do Cliente',brand:null});assert.equal(result.headline,'Feliz Dia do Cliente');assert.equal(result.support,'');assert.deepEqual(result.facts,[]);
});
test('bloqueador vence nota alta e incerteza impede aprovação',()=>{
  const raw=review();raw.problems=[{severity:'bloqueador',region:'logo',evidence:'Logo deformada',fix:'Restaurar logo original'}];
  assert.equal(normalizeReview(raw).decision,'corrigir');
  assert.equal(normalizeReview({...review(),criteria:[]}).decision,'conferir');
});
test('limite de caminho distingue assets de assets-extra',()=>{
  const base=path.resolve('assets');assert.equal(inside(base,path.join(base,'a.png')),true);assert.equal(inside(base,base+'-extra/a.png'),false);assert.equal(inside(base,path.join(base,'../secret')),false);
});
test('imagem falsa e anexos excessivos falham antes de chamadas pagas',async t=>{
  assert.throws(()=>safeImage({data:'data:image/png;base64,YWJj'}),/imagem válida/);
  const {engine,calls}=fixture(t);await assert.rejects(engine.generate({...body(),images:Array(5).fill(image())}),/máximo 4/);assert.equal(calls.length,0);
});
test('modo automático planeja antes de gerar e isola a marca selecionada',async t=>{
  const {engine,calls,db,dir}=fixture(t);const art=await engine.generate(body());
  assert.equal(calls.length,2);assert.match(calls[0].url,/responses$/);assert.match(calls[1].url,/images\/edits$/);
  const planning=JSON.parse(calls[0].config.body);assert.equal(planning.reasoning.effort,'medium');assert.equal(planning.store,false);
  assert.match(JSON.stringify(planning),/Sem dourado/);assert.doesNotMatch(JSON.stringify(planning),/SEGREDO_OUTRA_MARCA|INSTRUCAO_INAPLICAVEL/);
  assert.equal(art.brief.headline,'Feliz Dia do Cliente');assert.equal(art.brief.knowledge_sources.length,1);assert.equal(art.client_id,'cafe');
  const source=db.prepare('SELECT * FROM generations').get(),refs=JSON.parse(source.refs_json);assert.equal(refs[0].kind,'logo');assert.ok(fs.existsSync(path.join(dir,refs[0].path)));assert.equal(art.brief._token,undefined);
});
test('sem anexos usa geração de imagens e não inventa logo',async t=>{
  const {engine,calls}=fixture(t);await engine.generate({...body(),images:[]});assert.match(calls[1].url,/images\/generations$/);const request=JSON.parse(calls[1].config.body);assert.equal(request.quality,'high');assert.match(request.prompt,/não inventar logo/);
});
test('pergunta essencial interrompe antes de imagem e não exige anexos',async t=>{
  const raw=plan();raw.clarification='Qual produto e oferta você quer divulgar?';const {engine,calls,db}=fixture(t,{plan:raw});
  const result=await engine.generate({prompt:'Faça uma promoção para minha loja.',images:[]});assert.equal(result.needs_clarification,true);assert.equal(calls.length,1);assert.equal(db.prepare('SELECT COUNT(*) count FROM generations').get().count,0);
});
test('direção aprovada pode mudar copy sem repetir planejamento nem regra conflitante',async t=>{
  const {engine,calls}=fixture(t);const input=body(),briefing=await engine.prepare(input);briefing.headline='Um obrigado especial';const art=await engine.generate({...input,briefing});
  assert.equal(calls.length,2);assert.equal(art.brief.headline,'Um obrigado especial');assert.equal(art.brief.copy_origin.headline,'usuario');
  const prompt=calls[1].config.body.get('prompt');assert.match(prompt,/Um obrigado especial/);assert.doesNotMatch(prompt,/Use somente o texto fornecido no pedido/);
});
test('plano não pode ser reutilizado com outro pedido, ativo, marca ou perfil atualizado',async t=>{
  const {engine,calls,db}=fixture(t);const input=body(),briefing=await engine.prepare(input);
  await assert.rejects(engine.generate({...input,briefing,prompt:'Outro tema agora'}),/mudaram/);
  await assert.rejects(engine.generate({...input,briefing,images:[]}),/mudaram/);
  await assert.rejects(engine.generate({...input,briefing,client_id:'outro'}),/mudaram/);
  db.prepare('UPDATE clients SET profile=? WHERE id=?').run('{"preferences":"Nova cor"}','cafe');
  await assert.rejects(engine.generate({...input,briefing}),/mudaram/);assert.equal(calls.length,1);
});
test('assinatura inválida não gera imagem',async t=>{
  const {engine,calls}=fixture(t);await assert.rejects(engine.generate({...body(),briefing:{...plan(),_token:'falso.token'}}),/desatualizada/);assert.equal(calls.length,0);
});
test('edição e adaptação preservam refs, copy, versão e contexto de marca',async t=>{
  const {engine,calls,db}=fixture(t);const initial=await engine.generate(body());
  const edited=await engine.edit({generation_id:initial.id,request:'Troque só o título por Obrigado!'});assert.equal(edited.parent_id,initial.id);assert.equal(edited.brief.brand.id,'cafe');assert.deepEqual(edited.brief.edits,['Troque só o título por Obrigado!']);
  assert.equal(calls[2].config.body.getAll('image[]').length,2);
  const adapted=await engine.adapt({generation_id:edited.id,target_format:'story'});assert.equal(adapted.format,'story');assert.equal(adapted.parent_id,edited.id);assert.equal(calls[3].config.body.get('size'),'1088x1936');assert.match(calls[3].config.body.get('prompt'),/Não estique/);assert.deepEqual(adapted.brief.edits,edited.brief.edits);
  assert.equal(db.prepare('SELECT COUNT(*) count FROM generations').get().count,3);
});
test('máscara incorreta falha sem geração e mantém original',async t=>{
  const {engine,calls}=fixture(t);const initial=await engine.generate(body());const wrong=Buffer.from(png,'base64');wrong.writeUInt32BE(2,16);
  await assert.rejects(engine.edit({generation_id:initial.id,request:'Troque título',mask:'data:image/png;base64,'+wrong.toString('base64')}),/mesmo tamanho/);assert.equal(calls.length,2);
});
test('revisão compara arte, versão anterior e ativos; cache evita segunda cobrança',async t=>{
  const raw=review();raw.score=10;raw.problems=[{severity:'bloqueador',region:'Título',evidence:'Texto incorreto',fix:'Corrigir só o título'}];
  const {engine,calls}=fixture(t,{review:raw});const initial=await engine.generate(body()),edited=await engine.edit({generation_id:initial.id,request:'Troque título por Obrigado'});
  const [result,parallel]=await Promise.all([engine.review({generation_id:edited.id}),engine.review({generation_id:edited.id})]);assert.equal(result.decision,'corrigir');assert.equal(result.score,10);assert.deepEqual(result,parallel);
  const content=JSON.parse(calls[3].config.body).input[0].content;assert.equal(content.filter(item=>item.type==='input_image').length,3);assert.match(JSON.stringify(content),/VERSÃO ANTERIOR|ATIVO ORIGINAL/);
  await engine.review({generation_id:edited.id});assert.equal(calls.length,4);
});
test('feedback é local e não altera automaticamente preferências nem chama API',async t=>{
  const {engine,calls,db}=fixture(t);const art=await engine.generate(body()),old=db.prepare('SELECT profile FROM clients WHERE id=?').get('cafe').profile;
  assert.equal(engine.feedback({generation_id:art.id,verdict:'rejeitada',reason:'Muito brilho'}).reason,'Muito brilho');assert.equal(calls.length,2);assert.equal(db.prepare('SELECT profile FROM clients WHERE id=?').get('cafe').profile,old);
});
test('chave ausente e falha de rede são claras e nunca repetem cobrança automaticamente',async t=>{
  const f=fixture(t,{noKey:true});await assert.rejects(f.engine.generate(body()),/OPENAI_API_KEY/);assert.equal(f.calls.length,0);
  const g=fixture(t,{failure:true});await assert.rejects(g.engine.generate(body()),/ECONNRESET/);assert.equal(g.calls.length,1);
});
test('prompt final tem proporção, área segura e copy aprovada',()=>{
  const output=renderPrompt('Dia do Cliente',plan(),[image()],'story');assert.match(output,/y=250/);assert.match(output,/Feliz Dia do Cliente/);assert.match(output,/não exigir que estejam no pedido original/);
});
