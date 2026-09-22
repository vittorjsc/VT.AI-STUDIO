import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const root = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(root, 'dados-vt-ai');
const publicDir = path.join(root, 'public');
const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();
fs.mkdirSync(dataDir, { recursive: true });
for (const d of ['exports', 'backups', 'assets']) fs.mkdirSync(path.join(dataDir, d), { recursive: true });
const db = new DatabaseSync(path.join(dataDir, 'studio.sqlite'));
db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS clients(id TEXT PRIMARY KEY,name TEXT NOT NULL,niche TEXT,status TEXT NOT NULL DEFAULT 'active',profile TEXT NOT NULL DEFAULT '{}',created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS projects(id TEXT PRIMARY KEY,client_id TEXT NOT NULL REFERENCES clients(id),name TEXT NOT NULL,objective TEXT,status TEXT NOT NULL DEFAULT 'idea',briefing TEXT NOT NULL DEFAULT '{}',direction TEXT NOT NULL DEFAULT '{}',created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS pieces(id TEXT PRIMARY KEY,project_id TEXT NOT NULL REFERENCES projects(id),name TEXT NOT NULL,template TEXT NOT NULL,format TEXT NOT NULL,vars TEXT NOT NULL DEFAULT '{}',scene TEXT NOT NULL DEFAULT '{}',status TEXT NOT NULL DEFAULT 'planned',approved INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS revisions(id TEXT PRIMARY KEY,piece_id TEXT NOT NULL REFERENCES pieces(id),version INTEGER NOT NULL,scene TEXT NOT NULL,summary TEXT,approved INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS notes(id TEXT PRIMARY KEY,project_id TEXT NOT NULL REFERENCES projects(id),body TEXT NOT NULL,next_action TEXT,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS docs(id TEXT PRIMARY KEY,title TEXT NOT NULL,source TEXT NOT NULL,heading TEXT,body TEXT NOT NULL,hash TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY,piece_id TEXT,kind TEXT,status TEXT NOT NULL,error TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS generations(id TEXT PRIMARY KEY,prompt TEXT NOT NULL,assets_json TEXT NOT NULL DEFAULT '[]',output_path TEXT,status TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS docs_text ON docs(title,heading);`);
try { db.exec("ALTER TABLE generations ADD COLUMN format TEXT NOT NULL DEFAULT 'feed'"); } catch {}

function q(sql, ...args) { return db.prepare(sql).all(...args); }
function one(sql, ...args) { return db.prepare(sql).get(...args); }
function run(sql, ...args) { return db.prepare(sql).run(...args); }
function json(v, fallback={}) { try { return JSON.parse(v || JSON.stringify(fallback)); } catch { return fallback; } }
function reply(res, status, body, type='application/json') { res.writeHead(status, {'Content-Type': type, 'Cache-Control':'no-store'}); res.end(type==='application/json'?JSON.stringify(body):body); }
function sceneFor(template, vars={}, profile={}, format='feed') {
 const accent=profile.color || '#E3B23C', dark=profile.dark || '#101218', name=vars.brand || profile.name || 'SUA MARCA';
 const title=vars.headline || 'Uma mensagem que merece atenção'; const cta=vars.cta || 'Saiba mais'; const price=vars.price || '';
 const base={width:1080,height:format==='story'?1920:1350,background:dark,layers:[
  {id:'background',type:'background',color:dark},{id:'accent',type:'shape',x:70,y:110,w:18,h:230,color:accent},{id:'brand',type:'text',x:80,y:80,w:780,text:name,size:30,color:'#ffffff',weight:700},
  {id:'headline',type:'text',x:80,y:390,w:850,text:title,size:86,color:'#ffffff',weight:800},{id:'detail',type:'text',x:80,y:720,w:760,text:vars.detail || 'Qualidade, clareza e identidade para a sua campanha.',size:34,color:'#DDE1E8',weight:400},
  {id:'price',type:'text',x:80,y:920,w:600,text:price,size:64,color:accent,weight:800},{id:'cta',type:'shape',x:80,y:1110,w:340,h:100,color:accent,radius:12},{id:'cta-text',type:'text',x:115,y:1138,w:280,text:cta,size:30,color:'#101218',weight:800}
 ]};
 if(template==='servico'){base.layers.find(x=>x.id==='headline').text=vars.headline||'Serviço feito para avançar';base.layers.find(x=>x.id==='detail').text=vars.detail||'Estratégia e execução com foco no que importa.';}
 if(template==='institucional'){base.layers.find(x=>x.id==='headline').text=vars.headline||'Conteúdo que fortalece a marca';base.layers.find(x=>x.id==='detail').text=vars.detail||'Conhecimento útil, com uma presença consistente.';}
 return base;
}
function client(row){ return {...row, profile:json(row.profile)}; }
function project(row){ return {...row, briefing:json(row.briefing),direction:json(row.direction)}; }
function piece(row){ return {...row, vars:json(row.vars),scene:json(row.scene)}; }
function seed(){ if(one('SELECT id FROM clients LIMIT 1')) return; const t=now(), c=id(), p=id(); run('INSERT INTO clients VALUES(?,?,?,?,?,?,?)',c,'Café Aurora (exemplo)','Gastronomia','active',JSON.stringify({name:'CAFÉ AURORA',color:'#D6A147',dark:'#20201D'}),t,t); run('INSERT INTO projects VALUES(?,?,?,?,?,?,?,?,?)',p,c,'Primavera no Café','Promover bebidas sazonais','direction_approved',JSON.stringify({offer:'Menu de primavera'}),JSON.stringify({concept:'Acolhedor, artesanal e contemporâneo',approved:true}),t,t); const vars={brand:'CAFÉ AURORA',headline:'Primavera em cada xícara',detail:'Bebidas especiais e sabores da estação.',price:'A partir de R$ 12',cta:'Conheça o menu'}; const s=sceneFor('oferta',vars,{name:'CAFÉ AURORA',color:'#D6A147',dark:'#20201D'}); const x=id(); run('INSERT INTO pieces VALUES(?,?,?,?,?,?,?,?,?,?,?)',x,p,'Oferta Primavera','oferta','feed',JSON.stringify(vars),JSON.stringify(s),'planned',0,t,t); }
function importKnowledge(){ const dir=path.join(root,'conhecimento'); if(!fs.existsSync(dir)) return {count:0}; let count=0; for(const f of fs.readdirSync(dir).filter(x=>x.endsWith('.md'))){ const raw=fs.readFileSync(path.join(dir,f),'utf8'); const hash=crypto.createHash('sha256').update(raw).digest('hex'); run('DELETE FROM docs WHERE source=?',`conhecimento/${f}`); let heading='Introdução', buf=[]; const save=()=>{const b=buf.join('\n').trim(); if(b.length>35){run('INSERT INTO docs VALUES(?,?,?,?,?,?,?)',id(),f.replace(/^\d+_/,'').replace('.md',''),`conhecimento/${f}`,heading,b,hash,now());count++;}buf=[]}; for(const line of raw.split(/\r?\n/)){if(/^#{1,3}\s+/.test(line)){save();heading=line.replace(/^#+\s+/,'')}else buf.push(line)} save(); } return {count}; }
function safeImage(data, index){
  if(typeof data?.data!=='string'||!data.data.startsWith('data:image/')) throw Error('Envie imagens válidas para referência e logo.');
  const hit=data.data.match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/);
  if(!hit) throw Error('Use PNG, JPG ou WebP.'); const bytes=Buffer.from(hit[2],'base64');
  if(bytes.length>10*1024*1024) throw Error('Cada imagem deve ter no máximo 10 MB.');
  return {blob:new Blob([bytes],{type:hit[1]}),name:(data.name||`imagem-${index}.png`).replace(/[^\w. -]/g,'_'),type:hit[1]};
}
async function generateArt(body){
  const key=process.env.OPENAI_API_KEY;
  if(!key) throw Error('OPENAI_API_KEY não foi encontrada. Feche e reabra o VT.AI Studio após definir a variável.');
  const prompt=String(body.prompt||'').trim(); if(prompt.length<8) throw Error('Descreva a arte que deseja criar.');
  const raw=Array.isArray(body.images)?body.images:[]; if(!raw.length) throw Error('Adicione ao menos uma referência visual ou uma logo.');
  const images=raw.slice(0,4).map(safeImage); const format=body.format==='story'?'story':'feed'; const size=format==='story'?'1088x1936':'1088x1360';
  const target=format==='story'?'Story do Instagram 1080×1920':'Feed vertical do Instagram 1080×1350';
  const safeRule=format==='story'?'Use zonas de respiro no topo e rodapé para a interface do Story; mantenha logo, texto e CTA afastados das extremidades.':'Organize a composição para a proporção 4:5 do Feed, com margens confortáveis nos quatro lados.';
  const brief=`Você é VT.AI Studio, diretor de arte brasileiro especializado em artes de redes sociais. Crie uma arte final para ${target}. Analise as imagens anexadas: a primeira é referência de composição/estilo e as demais são logos ou recursos de marca. Preserve a logo visualmente reconhecível e use paleta coerente com a marca. ${safeRule}

POLÍTICA ANTI-ARTE-GENÉRICA: a peça deve comunicar um único objetivo. Use somente o texto fornecido no pedido; não invente slogan, preço, telefone, endereço, prazo, benefício, selo, depoimento ou serviço. Não inclua frases de preenchimento nem chamadas genéricas. Limite padrão: uma headline principal, um apoio opcional e um CTA apenas quando solicitado. Não use ícones decorativos; só use um ícone quando tiver função explícita no pedido. Priorize um único elemento visual principal, espaço negativo, hierarquia clara e poucos elementos intencionais. Evite excesso de brilho, gradientes aleatórios, 3D sem propósito, elementos flutuantes, molduras, selos, listas, interfaces falsas, logos deformadas, texto ilegível e mistura excessiva de fontes. Use no máximo duas famílias tipográficas visualmente coerentes. A arte deve parecer uma peça criada por um designer para uma marca real, não um template automático. Não inclua marcas d'água, mockups ou molduras de celular.

Pedido do usuário: ${prompt}`;
  const form=new FormData(); form.set('model','gpt-image-2'); form.set('prompt',brief); form.set('size',size); form.set('quality','high'); form.set('output_format','png');
  for(const image of images) form.append('image[]',image.blob,image.name);
  const apiResponse=await fetch('https://api.openai.com/v1/images/edits',{method:'POST',headers:{Authorization:`Bearer ${key}`},body:form});
  const result=await apiResponse.json(); if(!apiResponse.ok) throw Error(result?.error?.message||'A geração de imagem falhou.');
  const b64=result?.data?.[0]?.b64_json; if(!b64) throw Error('A API não retornou uma imagem.');
  const gid=id(), file=`gerada-${gid}.png`, relative=path.join('assets',file); fs.writeFileSync(path.join(dataDir,relative),Buffer.from(b64,'base64'));
  run('INSERT INTO generations(id,prompt,assets_json,output_path,status,created_at,format) VALUES(?,?,?,?,?,?,?)',gid,prompt,JSON.stringify(images.map(x=>x.name)),relative,'done',now(),format);
  return {id:gid,url:`/files/${encodeURIComponent(relative.replace(/\\/g,'/'))}`,file,created_at:now(),format};
}
async function editGeneratedArt(body){
  const key=process.env.OPENAI_API_KEY;if(!key)throw Error('OPENAI_API_KEY não foi encontrada. Feche e reabra o VT.AI Studio após definir a variável.');
  const source=one('SELECT * FROM generations WHERE id=?',body.generation_id);if(!source?.output_path)throw Error('Arte original não encontrada.');
  const request=String(body.request||'').trim();if(request.length<4)throw Error('Descreva a alteração que deseja fazer.');
  const full=path.resolve(dataDir,source.output_path);if(!full.startsWith(path.resolve(dataDir,'assets'))||!fs.existsSync(full))throw Error('O arquivo da arte original não está disponível.');
  const format=source.format==='story'?'story':'feed',size=format==='story'?'1088x1936':'1088x1360';
  const form=new FormData();form.set('model','gpt-image-2');form.set('prompt',`Edite a arte fornecida conforme o pedido abaixo. Preserve todos os elementos, composição, identidade visual e textos que não foram citados. Aplique somente a alteração solicitada, mantendo a arte final vertical, legível e sem marca d'água. Não invente textos, contatos, ícones ou frases promocionais. Mantenha a proporção e a área segura próprias do formato ${format==='story'?'Story 1080×1920':'Feed 1080×1350'}. Pedido de edição: ${request}`);form.set('size',size);form.set('quality','high');form.set('output_format','png');form.append('image[]',new Blob([fs.readFileSync(full)],{type:'image/png'}),'arte-original.png');
  const apiResponse=await fetch('https://api.openai.com/v1/images/edits',{method:'POST',headers:{Authorization:`Bearer ${key}`},body:form});const result=await apiResponse.json();if(!apiResponse.ok)throw Error(result?.error?.message||'A edição da arte falhou.');const b64=result?.data?.[0]?.b64_json;if(!b64)throw Error('A API não retornou uma imagem editada.');
  const gid=id(),file=`editada-${gid}.png`,relative=path.join('assets',file);fs.writeFileSync(path.join(dataDir,relative),Buffer.from(b64,'base64'));run('INSERT INTO generations(id,prompt,assets_json,output_path,status,created_at,format) VALUES(?,?,?,?,?,?,?)',gid,`Edição de ${source.id}: ${request}`,JSON.stringify([path.basename(source.output_path)]),relative,'done',now(),format);return {id:gid,url:`/files/${encodeURIComponent(relative.replace(/\\/g,'/'))}`,file,created_at:now(),parent_id:source.id,format};
}
async function adaptGeneratedArt(body){
  const key=process.env.OPENAI_API_KEY;if(!key)throw Error('OPENAI_API_KEY não foi encontrada. Feche e reabra o VT.AI Studio após definir a variável.');
  const source=one('SELECT * FROM generations WHERE id=?',body.generation_id);if(!source?.output_path)throw Error('Arte original não encontrada.');
  const sourceFormat=source.format==='story'?'story':'feed',targetFormat=body.target_format==='story'?'story':'feed';if(sourceFormat===targetFormat)throw Error('A arte já está nesse formato.');
  const full=path.resolve(dataDir,source.output_path);if(!full.startsWith(path.resolve(dataDir,'assets'))||!fs.existsSync(full))throw Error('O arquivo da arte original não está disponível.');
  const target=targetFormat==='story'?'Story 1080×1920':'Feed vertical 1080×1350',size=targetFormat==='story'?'1088x1936':'1088x1360';
  const instruction=targetFormat==='story'?'Expanda verticalmente apenas o fundo, cenário, textura e elementos secundários. Mantenha a composição principal, logo, textos, produto e CTA em escala e posição coerentes, com respiro superior e inferior para a interface do Story.':'Recomponha para o recorte 4:5 preservando integralmente logo, headline, produto, oferta e CTA. Não comprima todos os elementos; mantenha espaço negativo e elimine somente detalhes secundários fora da área útil.';
  const form=new FormData();form.set('model','gpt-image-2');form.set('prompt',`Adapte esta arte existente para ${target}. ${instruction} Não estique, não deforme, não recrie a identidade visual e não invente novos textos, frases, ícones, ofertas, dados de contato ou elementos promocionais. Preserve apenas os textos e elementos já presentes na imagem de origem. Resultado com aparência editorial, limpa e profissional.`);form.set('size',size);form.set('quality','high');form.set('output_format','png');form.append('image[]',new Blob([fs.readFileSync(full)],{type:'image/png'}),'arte-origem.png');
  const response=await fetch('https://api.openai.com/v1/images/edits',{method:'POST',headers:{Authorization:`Bearer ${key}`},body:form});const result=await response.json();if(!response.ok)throw Error(result?.error?.message||'A adaptação de formato falhou.');const b64=result?.data?.[0]?.b64_json;if(!b64)throw Error('A API não retornou uma arte adaptada.');
  const gid=id(),file=`${targetFormat}-${gid}.png`,relative=path.join('assets',file);fs.writeFileSync(path.join(dataDir,relative),Buffer.from(b64,'base64'));run('INSERT INTO generations(id,prompt,assets_json,output_path,status,created_at,format) VALUES(?,?,?,?,?,?,?)',gid,`Adaptação ${sourceFormat} → ${targetFormat} de ${source.id}`,JSON.stringify([path.basename(source.output_path)]),relative,'done',now(),targetFormat);return {id:gid,url:`/files/${encodeURIComponent(relative.replace(/\\/g,'/'))}`,file,created_at:now(),parent_id:source.id,format:targetFormat};
}
seed();
const handlers={
 'GET /api/health':()=>({ok:true,dataDir,version:'1.0.0'}),
 'GET /api/generations':()=>q('SELECT * FROM generations ORDER BY created_at DESC LIMIT 24').map(x=>({...x,url:x.output_path?`/files/${encodeURIComponent(x.output_path.replace(/\\/g,'/'))}`:null,assets:json(x.assets_json,[])})),
 'GET /api/clients':()=>q("SELECT * FROM clients WHERE status!='archived' ORDER BY name").map(client),
 'GET /api/projects':()=>q('SELECT p.*,c.name client_name FROM projects p JOIN clients c ON c.id=p.client_id ORDER BY p.updated_at DESC').map(project),
 'GET /api/pieces':()=>q('SELECT x.*,p.name project_name,p.client_id FROM pieces x JOIN projects p ON p.id=x.project_id ORDER BY x.updated_at DESC').map(piece),
 'GET /api/knowledge':(_,url)=>{const term=(url.searchParams.get('q')||'').trim(); if(!term)return []; const like=`%${term}%`; return q('SELECT title,source,heading,substr(body,1,330) snippet FROM docs WHERE title LIKE ? OR heading LIKE ? OR body LIKE ? LIMIT 30',like,like,like)},
 'POST /api/clients':b=>{const t=now(),x={id:id(),name:b.name?.trim(),niche:b.niche||'',status:'active',profile:JSON.stringify(b.profile||{}),created_at:t,updated_at:t}; if(!x.name)throw Error('Informe o nome do cliente.');run('INSERT INTO clients VALUES(@id,@name,@niche,@status,@profile,@created_at,@updated_at)',x);return client(x)},
 'PATCH /api/clients':b=>{if(!b.id)throw Error('Cliente inválido.');const old=one('SELECT * FROM clients WHERE id=?',b.id);if(!old)throw Error('Cliente não encontrado.');run('UPDATE clients SET name=?,niche=?,profile=?,updated_at=? WHERE id=?',b.name||old.name,b.niche??old.niche,JSON.stringify(b.profile??json(old.profile)),now(),b.id);return client(one('SELECT * FROM clients WHERE id=?',b.id))},
 'POST /api/projects':b=>{const t=now(),x={id:id(),client_id:b.client_id,name:b.name?.trim(),objective:b.objective||'',status:'idea',briefing:JSON.stringify(b.briefing||{}),direction:JSON.stringify({approved:false}),created_at:t,updated_at:t};if(!x.client_id||!x.name)throw Error('Selecione cliente e nomeie a campanha.');if(!one('SELECT id FROM clients WHERE id=?',x.client_id))throw Error('Cliente inválido.');run('INSERT INTO projects VALUES(@id,@client_id,@name,@objective,@status,@briefing,@direction,@created_at,@updated_at)',x);return project(x)},
 'PATCH /api/projects':b=>{const old=one('SELECT * FROM projects WHERE id=?',b.id);if(!old)throw Error('Campanha não encontrada.');const direction=b.direction??json(old.direction);run('UPDATE projects SET name=?,objective=?,status=?,briefing=?,direction=?,updated_at=? WHERE id=?',b.name??old.name,b.objective??old.objective,b.status??old.status,JSON.stringify(b.briefing??json(old.briefing)),JSON.stringify(direction),now(),b.id);return project(one('SELECT * FROM projects WHERE id=?',b.id))},
 'POST /api/pieces':b=>{const p=one('SELECT p.*,c.profile FROM projects p JOIN clients c ON c.id=p.client_id WHERE p.id=?',b.project_id);if(!p)throw Error('Campanha inválida.');const t=now(), vars=b.vars||{}, format=b.format||'feed', s=b.scene||sceneFor(b.template||'oferta',vars,json(p.profile),format); const x={id:id(),project_id:b.project_id,name:b.name||'Nova peça',template:b.template||'oferta',format,vars:JSON.stringify(vars),scene:JSON.stringify(s),status:'planned',approved:0,created_at:t,updated_at:t};run('INSERT INTO pieces VALUES(@id,@project_id,@name,@template,@format,@vars,@scene,@status,@approved,@created_at,@updated_at)',x);return piece(x)},
 'PATCH /api/pieces':b=>{const old=one('SELECT * FROM pieces WHERE id=?',b.id);if(!old)throw Error('Peça não encontrada.'); const scene=b.scene??json(old.scene);run('UPDATE pieces SET name=?,vars=?,scene=?,status=?,approved=?,updated_at=? WHERE id=?',b.name??old.name,JSON.stringify(b.vars??json(old.vars)),JSON.stringify(scene),b.status??old.status,b.approved===undefined?old.approved:(b.approved?1:0),now(),b.id);return piece(one('SELECT * FROM pieces WHERE id=?',b.id))},
 'POST /api/revisions':b=>{const p=one('SELECT * FROM pieces WHERE id=?',b.piece_id);if(!p)throw Error('Peça inválida.');const n=one('SELECT COALESCE(MAX(version),0)+1 v FROM revisions WHERE piece_id=?',p.id).v;const x={id:id(),piece_id:p.id,version:n,scene:JSON.stringify(b.scene||json(p.scene)),summary:b.summary||'Revisão manual',approved:b.approved?1:0,created_at:now()};run('INSERT INTO revisions VALUES(@id,@piece_id,@version,@scene,@summary,@approved,@created_at)',x);run('UPDATE pieces SET approved=?,status=?,updated_at=? WHERE id=?',x.approved,x.approved?'approved':'review',now(),p.id);return x},
 'POST /api/knowledge/import':()=>importKnowledge(),
 'POST /api/generate':b=>generateArt(b),
 'POST /api/generate/edit':b=>editGeneratedArt(b),
 'POST /api/generate/adapt':b=>adaptGeneratedArt(b),
 'POST /api/backup':()=>{const out=path.join(dataDir,'backups',`backup-${now().replace(/[:.]/g,'-')}.sqlite`); db.exec('PRAGMA wal_checkpoint(TRUNCATE)'); fs.copyFileSync(path.join(dataDir,'studio.sqlite'),out); return {file:path.basename(out)}},
 'POST /api/restore':b=>{const f=path.join(dataDir,'backups',path.basename(b.file||''));if(!fs.existsSync(f))throw Error('Backup não encontrado.');db.close();fs.copyFileSync(f,path.join(dataDir,'studio.sqlite'));return {restart:true}},
};
http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://127.0.0.1');if(req.method==='GET'&&url.pathname.startsWith('/files/')){const requested=decodeURIComponent(url.pathname.slice(7));const full=path.resolve(dataDir,requested);if(!full.startsWith(path.resolve(dataDir,'assets'))||!fs.existsSync(full))return reply(res,404,'Não encontrado','text/plain');return reply(res,200,fs.readFileSync(full),'image/png')}if(req.method==='GET'&&!url.pathname.startsWith('/api/')){let file=url.pathname==='/'?'index.html':url.pathname.slice(1);file=path.normalize(file);const full=path.join(publicDir,file);if(!full.startsWith(publicDir)||!fs.existsSync(full))return reply(res,404,'Não encontrado','text/plain');const ext=path.extname(full);return reply(res,200,fs.readFileSync(full),ext==='.js'?'text/javascript':ext==='.css'?'text/css':'text/html')}const key=`${req.method} ${url.pathname}`;const h=handlers[key];if(!h)return reply(res,404,{error:'Rota não encontrada'});let raw='';for await(const c of req)raw+=c;const result=await h(raw?JSON.parse(raw):{},url);reply(res,200,result)}catch(e){reply(res,400,{error:e.message||'Erro interno'})}}).listen(4173,'127.0.0.1',()=>console.log('VT.AI Studio: http://127.0.0.1:4173'));
