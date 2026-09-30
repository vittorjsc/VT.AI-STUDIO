import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import {createCreativeEngine,networkCode} from './lib/creative-engine.mjs';
import {inside} from './lib/creative-policy.mjs';
import {createAuth} from './lib/auth.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(process.env.VT_AI_DATA_DIR || path.join(root, 'dados-vt-ai'));
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
try { db.exec("ALTER TABLE generations ADD COLUMN brief_json TEXT NOT NULL DEFAULT '{}'"); } catch {}
try { db.exec("ALTER TABLE generations ADD COLUMN review_json TEXT NOT NULL DEFAULT '{}'"); } catch {}
for(const [name,type] of Object.entries({refs_json:"TEXT NOT NULL DEFAULT '[]'",client_id:'TEXT',parent_id:'TEXT',operation:"TEXT NOT NULL DEFAULT 'generate'",edit_request:"TEXT NOT NULL DEFAULT ''",feedback_json:"TEXT NOT NULL DEFAULT '{}'"})){
  const columns=q('PRAGMA table_info(generations)');
  if(!columns.some(column=>column.name===name))db.exec(`ALTER TABLE generations ADD COLUMN ${name} ${type}`);
}
for(const table of ['clients','generations']){
 if(!q(`PRAGMA table_info(${table})`).some(column=>column.name==='user_id'))db.exec(`ALTER TABLE ${table} ADD COLUMN user_id TEXT`);
}
db.exec('CREATE INDEX IF NOT EXISTS clients_user ON clients(user_id); CREATE INDEX IF NOT EXISTS generations_user ON generations(user_id);');
const publicOrigin=process.env.VT_AI_PUBLIC_ORIGIN?.replace(/\/$/,'');
let publicUrl;
if(publicOrigin){
 try{publicUrl=new URL(publicOrigin)}catch{throw Error('VT_AI_PUBLIC_ORIGIN deve ser uma origem HTTPS válida.')}
 if(publicUrl.protocol!=='https:'||publicUrl.origin!==publicOrigin||publicUrl.username||publicUrl.password)throw Error('VT_AI_PUBLIC_ORIGIN deve ser uma origem HTTPS, sem caminho ou credenciais.');
}
const auth=createAuth(db,{secure:!!publicOrigin});

function q(sql, ...args) { return db.prepare(sql).all(...args); }
function one(sql, ...args) { return db.prepare(sql).get(...args); }
function run(sql, ...args) { return db.prepare(sql).run(...args); }
function json(v, fallback={}) { try { return JSON.parse(v || JSON.stringify(fallback)); } catch { return fallback; } }
function reply(res, status, body, type='application/json') { res.writeHead(status, {'Content-Type': type, 'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer'}); res.end(type==='application/json'?JSON.stringify(body):body); }
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
function seed(){ if(one('SELECT id FROM clients LIMIT 1')) return; const t=now(), c=id(), p=id(); run('INSERT INTO clients(id,name,niche,status,profile,created_at,updated_at) VALUES(?,?,?,?,?,?,?)',c,'Café Aurora (exemplo)','Gastronomia','active',JSON.stringify({name:'CAFÉ AURORA',color:'#D6A147',dark:'#20201D'}),t,t); run('INSERT INTO projects VALUES(?,?,?,?,?,?,?,?,?)',p,c,'Primavera no Café','Promover bebidas sazonais','direction_approved',JSON.stringify({offer:'Menu de primavera'}),JSON.stringify({concept:'Acolhedor, artesanal e contemporâneo',approved:true}),t,t); const vars={brand:'CAFÉ AURORA',headline:'Primavera em cada xícara',detail:'Bebidas especiais e sabores da estação.',price:'A partir de R$ 12',cta:'Conheça o menu'}; const s=sceneFor('oferta',vars,{name:'CAFÉ AURORA',color:'#D6A147',dark:'#20201D'}); const x=id(); run('INSERT INTO pieces VALUES(?,?,?,?,?,?,?,?,?,?,?)',x,p,'Oferta Primavera','oferta','feed',JSON.stringify(vars),JSON.stringify(s),'planned',0,t,t); }
function importKnowledge(){
 const dir=path.join(root,'conhecimento');if(!fs.existsSync(dir))return {count:0};
 let count=0;
 for(const file of fs.readdirSync(dir).filter(name=>name.endsWith('.md'))){
  const raw=fs.readFileSync(path.join(dir,file),'utf8'),source=`conhecimento/${file}`,hash=crypto.createHash('sha256').update(raw).digest('hex');
  const existing=one('SELECT hash FROM docs WHERE source=? LIMIT 1',source);
  if(existing?.hash===hash){count+=one('SELECT COUNT(*) count FROM docs WHERE source=?',source).count;continue}
  db.exec('BEGIN');
  try{
   run('DELETE FROM docs WHERE source=?',source);
   let heading='Introdução',buffer=[];
   const save=()=>{const body=buffer.join('\n').trim();if(body.length>35){run('INSERT INTO docs VALUES(?,?,?,?,?,?,?)',id(),file.replace(/^\d+_/,'').replace('.md',''),source,heading,body,hash,now());count++}buffer=[]};
   for(const line of raw.replace(/^---[\s\S]*?---\s*/,'').split(/\r?\n/)){if(/^#{1,3}\s+/.test(line)){save();heading=line.replace(/^#+\s+/,'')}else buffer.push(line)}
   save();db.exec('COMMIT');
  }catch(error){db.exec('ROLLBACK');throw error}
 }
 return {count};
}
const creative = createCreativeEngine({db,dataDir});
async function openaiStatus(){
  const key=process.env.OPENAI_API_KEY;
  if(!key)return {configured:false,connected:false};
  try{const response=await fetch('https://api.openai.com/v1/models',{headers:{Authorization:`Bearer ${key}`},signal:AbortSignal.timeout(10000)});return {configured:true,connected:true,authorized:response.ok,httpStatus:response.status}}
  catch(error){return {configured:true,connected:false,code:networkCode(error)}}
}
seed();
// Reimport a document only when its hash changed; keep stable rows across launches.
importKnowledge();
const handlers={
 'GET /api/health':()=>({ok:true,version:'1.2.0',...(!publicOrigin?{dataDir}:{})}),
 'GET /api/auth/status':()=>({setup_required:auth.setupRequired(),setup_configured:auth.setupConfigured()}),
 'GET /api/auth/me':(_,__,user)=>({user:auth.publicUser(user)}),
 'POST /api/auth/setup':(b,_,__,res)=>({user:auth.setup(b,res)}),
 'POST /api/auth/register':(b,_,__,res)=>({user:auth.register(b,res)}),
 'POST /api/auth/login':(b,_,__,res)=>({user:auth.login(b,res)}),
 'POST /api/auth/logout':(_,__,___,res,req)=>auth.logout(req,res),
 'POST /api/auth/invites':(_,__,user)=>auth.invite(user),
 'GET /api/openai/status':()=>openaiStatus(),
 'GET /api/generations':(_,__,user)=>q('SELECT * FROM generations WHERE user_id=? ORDER BY created_at DESC LIMIT 100',user.id).map(creative.serialized),
 'GET /api/clients':(_,__,user)=>q("SELECT * FROM clients WHERE user_id=? AND status!='archived' ORDER BY name",user.id).map(client),
 'GET /api/projects':(_,__,user)=>q('SELECT p.*,c.name client_name FROM projects p JOIN clients c ON c.id=p.client_id WHERE c.user_id=? ORDER BY p.updated_at DESC',user.id).map(project),
 'GET /api/pieces':(_,__,user)=>q('SELECT x.*,p.name project_name,p.client_id FROM pieces x JOIN projects p ON p.id=x.project_id JOIN clients c ON c.id=p.client_id WHERE c.user_id=? ORDER BY x.updated_at DESC',user.id).map(piece),
 'GET /api/knowledge':(_,url)=>{const term=(url.searchParams.get('q')||'').trim(); if(!term)return []; const like=`%${term}%`; return q('SELECT title,source,heading,substr(body,1,330) snippet FROM docs WHERE title LIKE ? OR heading LIKE ? OR body LIKE ? LIMIT 30',like,like,like)},
 'POST /api/clients':(b,_,user)=>{const t=now(),x={id:id(),name:b.name?.trim(),niche:b.niche||'',status:'active',profile:JSON.stringify(b.profile||{}),created_at:t,updated_at:t,user_id:user.id}; if(!x.name)throw Error('Informe o nome do cliente.');run('INSERT INTO clients(id,name,niche,status,profile,created_at,updated_at,user_id) VALUES(@id,@name,@niche,@status,@profile,@created_at,@updated_at,@user_id)',x);return client(x)},
 'PATCH /api/clients':(b,_,user)=>{if(!b.id)throw Error('Cliente inválido.');const old=one('SELECT * FROM clients WHERE id=? AND user_id=?',b.id,user.id);if(!old)throw Error('Cliente não encontrado.');run('UPDATE clients SET name=?,niche=?,profile=?,updated_at=? WHERE id=? AND user_id=?',b.name||old.name,b.niche??old.niche,JSON.stringify(b.profile??json(old.profile)),now(),b.id,user.id);return client(one('SELECT * FROM clients WHERE id=?',b.id))},
 'POST /api/projects':(b,_,user)=>{const t=now(),x={id:id(),client_id:b.client_id,name:b.name?.trim(),objective:b.objective||'',status:'idea',briefing:JSON.stringify(b.briefing||{}),direction:JSON.stringify({approved:false}),created_at:t,updated_at:t};if(!x.client_id||!x.name)throw Error('Selecione cliente e nomeie a campanha.');if(!one('SELECT id FROM clients WHERE id=? AND user_id=?',x.client_id,user.id))throw Error('Cliente inválido.');run('INSERT INTO projects VALUES(@id,@client_id,@name,@objective,@status,@briefing,@direction,@created_at,@updated_at)',x);return project(x)},
 'PATCH /api/projects':(b,_,user)=>{const old=one('SELECT p.* FROM projects p JOIN clients c ON c.id=p.client_id WHERE p.id=? AND c.user_id=?',b.id,user.id);if(!old)throw Error('Campanha não encontrada.');const direction=b.direction??json(old.direction);run('UPDATE projects SET name=?,objective=?,status=?,briefing=?,direction=?,updated_at=? WHERE id=?',b.name??old.name,b.objective??old.objective,b.status??old.status,JSON.stringify(b.briefing??json(old.briefing)),JSON.stringify(direction),now(),b.id);return project(one('SELECT * FROM projects WHERE id=?',b.id))},
 'POST /api/pieces':(b,_,user)=>{const p=one('SELECT p.*,c.profile FROM projects p JOIN clients c ON c.id=p.client_id WHERE p.id=? AND c.user_id=?',b.project_id,user.id);if(!p)throw Error('Campanha inválida.');const t=now(), vars=b.vars||{}, format=b.format||'feed', s=b.scene||sceneFor(b.template||'oferta',vars,json(p.profile),format); const x={id:id(),project_id:b.project_id,name:b.name||'Nova peça',template:b.template||'oferta',format,vars:JSON.stringify(vars),scene:JSON.stringify(s),status:'planned',approved:0,created_at:t,updated_at:t};run('INSERT INTO pieces VALUES(@id,@project_id,@name,@template,@format,@vars,@scene,@status,@approved,@created_at,@updated_at)',x);return piece(x)},
 'PATCH /api/pieces':(b,_,user)=>{const old=one('SELECT x.* FROM pieces x JOIN projects p ON p.id=x.project_id JOIN clients c ON c.id=p.client_id WHERE x.id=? AND c.user_id=?',b.id,user.id);if(!old)throw Error('Peça não encontrada.'); const scene=b.scene??json(old.scene);run('UPDATE pieces SET name=?,vars=?,scene=?,status=?,approved=?,updated_at=? WHERE id=?',b.name??old.name,JSON.stringify(b.vars??json(old.vars)),JSON.stringify(scene),b.status??old.status,b.approved===undefined?old.approved:(b.approved?1:0),now(),b.id);return piece(one('SELECT * FROM pieces WHERE id=?',b.id))},
 'POST /api/revisions':(b,_,user)=>{const p=one('SELECT x.* FROM pieces x JOIN projects p ON p.id=x.project_id JOIN clients c ON c.id=p.client_id WHERE x.id=? AND c.user_id=?',b.piece_id,user.id);if(!p)throw Error('Peça inválida.');const n=one('SELECT COALESCE(MAX(version),0)+1 v FROM revisions WHERE piece_id=?',p.id).v;const x={id:id(),piece_id:p.id,version:n,scene:JSON.stringify(b.scene||json(p.scene)),summary:b.summary||'Revisão manual',approved:b.approved?1:0,created_at:now()};run('INSERT INTO revisions VALUES(@id,@piece_id,@version,@scene,@summary,@approved,@created_at)',x);run('UPDATE pieces SET approved=?,status=?,updated_at=? WHERE id=?',x.approved,x.approved?'approved':'review',now(),p.id);return x},
 'POST /api/knowledge/import':(_,__,user)=>{if(user.role!=='admin')throw Object.assign(Error('Apenas o administrador pode importar a base.'),{status:403});return importKnowledge()},
 'POST /api/briefing':b=>creative.prepare(b),
 'POST /api/generate':b=>creative.generate(b),
 'POST /api/generate/review':b=>creative.review(b),
 'POST /api/generate/edit':b=>creative.edit(b),
 'POST /api/generate/adapt':b=>creative.adapt(b),
 'POST /api/generate/feedback':b=>creative.feedback(b),
 'POST /api/backup':(_,__,user)=>{if(user.role!=='admin')throw Object.assign(Error('Apenas o administrador pode fazer backup.'),{status:403});const out=path.join(dataDir,'backups',`backup-${now().replace(/[:.]/g,'-')}.sqlite`); db.exec('PRAGMA wal_checkpoint(TRUNCATE)'); fs.copyFileSync(path.join(dataDir,'studio.sqlite'),out); return {file:path.basename(out)}},
 'POST /api/restore':()=>{throw Error('Para restaurar com segurança, feche o VT.AI e substitua o banco manualmente por seu backup.');},
};
const paidRoutes=new Set(['POST /api/briefing','POST /api/generate','POST /api/generate/review','POST /api/generate/edit','POST /api/generate/adapt']);
const requests=new Map();
const loginAttempts=new Map();
let imageBusy=false;
async function invoke(handler,body,url,route,user,res,req){
 if(route.startsWith('POST /api/generate')||route==='POST /api/briefing'){
  if(body.client_id&&!one('SELECT id FROM clients WHERE id=? AND user_id=?',body.client_id,user.id))throw Object.assign(Error('Marca não encontrada.'),{status:404});
  if(body.generation_id&&!one('SELECT id FROM generations WHERE id=? AND user_id=?',body.generation_id,user.id))throw Object.assign(Error('Arte não encontrada.'),{status:404});
 }
 if(!paidRoutes.has(route))return handler(body,url,user,res,req);
 const requestId=body.request_id;
 if(requestId!==undefined&&!/^[a-zA-Z0-9_-]{8,100}$/.test(requestId))throw Object.assign(Error('Identificador de solicitação inválido.'),{status:400});
 const digest=crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
 const cacheKey=requestId?`${user.id}:${route}:${requestId}`:null;
 if(cacheKey&&requests.has(cacheKey)){
  const previous=requests.get(cacheKey);if(previous.digest!==digest)throw Error('Solicitação já usada com outro conteúdo.');
  return previous.promise;
 }
 const isImage=['POST /api/generate','POST /api/generate/edit','POST /api/generate/adapt'].includes(route);
 if(isImage&&imageBusy)throw Object.assign(Error('Uma arte já está sendo processada. Aguarde para evitar gerações duplicadas.'),{status:409});
 const dailyLimit=Number(process.env.VT_AI_DAILY_IMAGE_LIMIT||3);
 if(isImage&&user.role!=='admin'&&Number.isFinite(dailyLimit)&&dailyLimit>0&&one('SELECT COUNT(*) count FROM generations WHERE user_id=? AND created_at>=?',user.id,new Date(Date.now()-24*60*60*1000).toISOString()).count>=dailyLimit)throw Object.assign(Error('Seu limite diário de artes do beta foi atingido. Tente novamente amanhã.'),{status:429});
 if(isImage)imageBusy=true;
 const promise=(async()=>{try{const result=await handler(body,url,user,res,req);if(isImage&&result?.id)run('UPDATE generations SET user_id=? WHERE id=?',user.id,result.id);return result}finally{if(isImage)imageBusy=false}})();
 if(cacheKey){
  for(const [key,item]of requests)if(Date.now()-item.created>20*60*1000)requests.delete(key);
  if(requests.size>=64)requests.delete(requests.keys().next().value);
  requests.set(cacheKey,{digest,promise,created:Date.now()});
  // A failed call remains cached for its request id; a deliberate retry uses a new id.
 }
 return promise;
}
export const server=http.createServer(async(req,res)=>{
 try{
  const expectedOrigin=publicOrigin||`http://${req.headers.host}`;
  const railwayHealth=!!publicOrigin&&req.method==='GET'&&req.url==='/api/health'&&req.headers.host==='healthcheck.railway.app'&&!req.headers.origin;
  if(!railwayHealth&&(publicOrigin?req.headers.host!==publicUrl.host:!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(req.headers.host||'')))return reply(res,403,{error:'Endereço não autorizado.'});
  if(req.headers.origin&&req.headers.origin!==expectedOrigin)return reply(res,403,{error:'Origem não autorizada.'});
  if(req.headers['sec-fetch-site']==='cross-site')return reply(res,403,{error:'Acesso externo não autorizado.'});
  const url=new URL(req.url,'http://127.0.0.1');
  const user=auth.current(req);
  if(req.method==='GET'&&url.pathname.startsWith('/files/')){
   if(!user)return reply(res,401,{error:'Faça login para acessar esta arte.'});
   const full=path.resolve(dataDir,decodeURIComponent(url.pathname.slice(7)));
   if(!inside(path.resolve(dataDir,'assets'),full)||!fs.existsSync(full)||!fs.statSync(full).isFile())return reply(res,404,'Não encontrado','text/plain');
   if(!one('SELECT id FROM generations WHERE user_id=? AND output_path=? LIMIT 1',user.id,path.relative(dataDir,full)))return reply(res,404,'Não encontrado','text/plain');
   const ext=path.extname(full);return reply(res,200,fs.readFileSync(full),ext==='.jpg'?'image/jpeg':ext==='.webp'?'image/webp':'image/png');
  }
  if(req.method==='GET'&&!url.pathname.startsWith('/api/')){
   const full=path.resolve(publicDir,url.pathname==='/'?'index.html':decodeURIComponent(url.pathname.slice(1)));
   if(!inside(publicDir,full)||!fs.existsSync(full)||!fs.statSync(full).isFile())return reply(res,404,'Não encontrado','text/plain');
   const ext=path.extname(full);return reply(res,200,fs.readFileSync(full),ext==='.js'?'text/javascript':ext==='.css'?'text/css':'text/html');
  }
  const route=`${req.method} ${url.pathname}`,handler=handlers[route];if(!handler)return reply(res,404,{error:'Rota não encontrada'});
  const publicRoutes=new Set(['GET /api/health','GET /api/auth/status','POST /api/auth/setup','POST /api/auth/register','POST /api/auth/login']);
  if(!user&&!publicRoutes.has(route)&&route!=='GET /api/auth/me')return reply(res,401,{error:'Faça login para continuar.'});
  if(['POST','PATCH','PUT','DELETE'].includes(req.method)&&!String(req.headers['content-type']||'').toLowerCase().startsWith('application/json'))return reply(res,415,{error:'Envie JSON.'});
  if(route==='POST /api/auth/login'){
   const key=req.socket.remoteAddress||'unknown',attempt=loginAttempts.get(key);
   if(attempt&&attempt.until>Date.now()&&attempt.count>=8)return reply(res,429,{error:'Muitas tentativas. Aguarde 15 minutos.'});
   if(!attempt||attempt.until<=Date.now())loginAttempts.set(key,{count:0,until:Date.now()+15*60*1000});
  }
  const chunks=[];let length=0;for await(const chunk of req){length+=chunk.length;if(length>60*1024*1024)throw Object.assign(Error('Solicitação muito grande. Reduza os anexos.'),{status:413});chunks.push(chunk)}
  const raw=Buffer.concat(chunks).toString('utf8');
  let body={};try{body=raw?JSON.parse(raw):{}}catch{throw Error('Solicitação JSON inválida.')}
  if(!body||typeof body!=='object'||Array.isArray(body))throw Error('Solicitação inválida.');
  const result=await invoke(handler,body,url,route,user,res,req);
  if(route==='POST /api/auth/login')loginAttempts.delete(req.socket.remoteAddress||'unknown');
  reply(res,200,result);
 }catch(error){if(req.method==='POST'&&req.url?.startsWith('/api/auth/login')){const key=req.socket.remoteAddress||'unknown',record=loginAttempts.get(key)||{count:0,until:Date.now()+15*60*1000};record.count++;loginAttempts.set(key,record)}reply(res,error.status||400,{error:error.message||'Erro interno'})}
});
export async function closeStudio(){
 if(server.listening)await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
 db.close();
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const port=Number(process.env.PORT||4173);
 server.listen(port,publicOrigin?'0.0.0.0':'127.0.0.1',()=>console.log(`VT.AI Studio: ${publicOrigin||`http://127.0.0.1:${port}`}${auth.setupRequired()?' | Crie o administrador com VT_AI_SETUP_CODE.':''}`));
 server.on('error',error=>{console.error(error.code==='EADDRINUSE'?'O VT.AI já está aberto na porta 4173.':'Não foi possível iniciar o servidor: '+error.code);process.exitCode=1});
}
