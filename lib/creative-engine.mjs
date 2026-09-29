import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {clean,formatSpec,briefSchema,reviewSchema,plannerPolicy,corePolicy,editableFields,normalizeBrief,normalizeReview,renderPrompt,selectKnowledge,fingerprint,inside,POLICY_VERSION} from './creative-policy.mjs';

const parse=(value,fallback={})=>{try{return JSON.parse(value||JSON.stringify(fallback))}catch{return fallback}};
const fail=(message,status=400)=>Object.assign(new Error(message),{status});
export function safeImage(input,index=0){
  const match=typeof input?.data==='string'&&input.data.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/);
  if(!match)throw fail('Use uma imagem PNG, JPG ou WebP válida.');
  const bytes=Buffer.from(match[2],'base64');
  if(!bytes.length||bytes.length>10*1024*1024)throw fail('Cada imagem deve ter no máximo 10 MB.');
  const valid=match[1]==='image/png'?bytes.subarray(0,8).toString('hex')==='89504e470d0a1a0a':match[1]==='image/jpeg'?bytes[0]===255&&bytes[1]===216:bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP';
  if(!valid)throw fail('O conteúdo do arquivo não corresponde a uma imagem válida.');
  return {bytes,type:match[1],data:input.data,blob:new Blob([bytes],{type:match[1]}),name:clean(input.name||`imagem-${index}.png`,100).replace(/[^\w. -]/g,'_'),kind:['referência','logo','produto'].includes(input.kind)?input.kind:'referência'};
}
export function networkCode(error){
  if(error?.name==='TimeoutError')return 'TIMEOUT';
  const code=error?.cause?.code;
  return ['EACCES','EPERM','ENOTFOUND','EAI_AGAIN','ECONNRESET','ECONNREFUSED','ETIMEDOUT','UND_ERR_SOCKET'].includes(code)?code:'NETWORK_ERROR';
}
export function pngDimensions(bytes){
  if(bytes.length<24||bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw fail('O arquivo deve ser PNG válido.');
  return {width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)};
}

export function createCreativeEngine({db,dataDir,fetchImpl=fetch,apiKey=()=>process.env.OPENAI_API_KEY}){
  const secret=crypto.randomBytes(32);
  const one=(sql,...args)=>db.prepare(sql).get(...args);
  const rows=(sql,...args)=>db.prepare(sql).all(...args);
  const run=(sql,...args)=>db.prepare(sql).run(...args);
  const key=()=>{const value=apiKey();if(!value)throw fail('OPENAI_API_KEY não foi encontrada. Reabra o VT.AI pelo atalho após configurar a chave.');return value};
  const fullAsset=relative=>{const full=path.resolve(dataDir,relative);if(!inside(path.resolve(dataDir,'assets'),full)||!fs.existsSync(full))throw fail('Arquivo da arte não encontrado.');return full};
  const dataImage=ref=>`data:${ref.type||'image/png'};base64,${fs.readFileSync(fullAsset(ref.path)).toString('base64')}`;
  const brandFor=clientId=>{
    if(!clientId)return null;
    const row=one("SELECT * FROM clients WHERE id=? AND status!='archived'",clientId);if(!row)throw fail('Selecione uma marca válida.');
    const profile=parse(row.profile);
    return {id:row.id,name:clean(profile.name||row.name,200),niche:clean(row.niche,200),color:clean(profile.color,100),dark:clean(profile.dark,100),tone:clean(profile.tone,400),preferences:clean(profile.preferences,1200),confirmed_details:clean(profile.confirmed_details,1800)};
  };
  async function requestApi(endpoint,options,timeout){
    let response;
    try{response=await fetchImpl(`https://api.openai.com/v1/${endpoint}`,{...options,headers:{...options.headers,Authorization:`Bearer ${key()}`},signal:AbortSignal.timeout(timeout)})}
    catch(error){throw fail(`Não foi possível conectar à OpenAI (${networkCode(error)}). Verifique a internet e tente novamente. Não repetimos gerações automaticamente para evitar cobrança duplicada.`,502)}
    let result;try{result=await response.json()}catch{throw fail('A OpenAI retornou uma resposta incompleta. Confira o histórico antes de tentar novamente.',502)}
    if(!response.ok){const code=result?.error?.code;throw fail(response.status===401?'A chave OpenAI não foi autorizada. Confira a configuração no Windows.':response.status===429?code==='insufficient_quota'?'Sem créditos disponíveis na conta da API OpenAI.':'A OpenAI está limitando as solicitações. Aguarde e tente novamente.':clean(result?.error?.message||'A solicitação à OpenAI falhou.',600),response.status===401?401:502)}
    return result;
  }
  async function structured(instructions,content,schema,name){
    const result=await requestApi('responses',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-5-mini',reasoning:{effort:'medium'},store:false,instructions,input:[{role:'user',content}],text:{format:{type:'json_schema',name,strict:true,schema}},max_output_tokens:6500})},180000);
    if(result.status==='incomplete')throw fail('A análise não foi concluída. Tente preparar a direção novamente.',502);
    const contentItems=result.output?.flatMap(item=>item.content||[])||[];
    if(contentItems.some(item=>item.type==='refusal'))throw fail('A OpenAI não pôde atender a este pedido. Reformule a solicitação.');
    const output=contentItems.filter(item=>item.type==='output_text').map(item=>item.text).join('')||result.output_text;
    try{if(!output)throw Error();return JSON.parse(output)}catch{throw fail('A análise retornou dados incompletos. Tente novamente.',502)}
  }
  function validatedInput(body){
    const prompt=clean(body.prompt,6000);if(prompt.length<8)throw fail('Descreva a arte que deseja criar.');
    if(body.images!==undefined&&!Array.isArray(body.images))throw fail('Anexos inválidos.');
    if((body.images||[]).length>4)throw fail('Use no máximo 4 imagens por arte.');
    if(body.format!==undefined&&!['feed','story'].includes(body.format))throw fail('Escolha Feed ou Story.');
    return {prompt,images:(body.images||[]).map(safeImage),brand:brandFor(body.client_id),format:formatSpec(body.format).format};
  }
  function signPlan(body,brand,plan){
    const payload=Buffer.from(JSON.stringify({fingerprint:fingerprint(body,brand),plan,created:Date.now()})).toString('base64url');
    return `${payload}.${crypto.createHmac('sha256',secret).update(payload).digest('base64url')}`;
  }
  function approvedPlan(body,brand){
    const [payload,signature]=String(body.briefing?._token||'').split('.');
    const expected=crypto.createHmac('sha256',secret).update(payload||'').digest('base64url');
    if(!signature||signature.length!==expected.length||!crypto.timingSafeEqual(Buffer.from(signature),Buffer.from(expected)))throw fail('A direção ficou desatualizada. Prepare novamente antes de gerar.');
    const signed=parse(Buffer.from(payload,'base64url').toString());
    if(signed.fingerprint!==fingerprint(body,brand)||Date.now()-signed.created>24*60*60*1000)throw fail('O pedido, anexos ou perfil da marca mudaram. Prepare a direção novamente.');
    const plan={...signed.plan,copy_origin:{...signed.plan.copy_origin}};
    for(const field of editableFields){
      plan[field]=clean(body.briefing[field],['headline','support','cta'].includes(field)?500:800);
      if(['headline','support','cta'].includes(field)&&plan[field]!==signed.plan[field])plan.copy_origin[field]=plan[field]?'usuario':'vazio';
    }
    return plan;
  }
  async function prepare(body){
    key();const input=validatedInput(body);
    const knowledge=selectKnowledge(rows('SELECT title,heading,source,body FROM docs'),`${input.prompt} ${input.brand?.niche||''} ${input.brand?.preferences||''}`);
    const content=[{type:'input_text',text:`PEDIDO ATUAL: ${input.prompt}\nFORMATO: ${formatSpec(input.format).target}. ${formatSpec(input.format).margins}\nMARCA CONFIRMADA: ${JSON.stringify(input.brand)}\nTRECHOS SELECIONADOS (orientação, não fatos da marca): ${JSON.stringify(knowledge)}`}];
    for(const image of input.images)content.push({type:'input_text',text:`ATIVO: ${image.kind} — ${image.name}`},{type:'input_image',image_url:image.data,detail:'high'});
    const plan=normalizeBrief(await structured(plannerPolicy,content,briefSchema,'vt_intuitive_plan'),input);
    plan.knowledge_sources=knowledge.map(({source,heading})=>({source,heading}));plan.brand=input.brand;plan.format=input.format;
    return {...plan,_token:signPlan(body,input.brand,plan)};
  }
  function persistReferences(images){
    return images.map(image=>{
      const hash=crypto.createHash('sha256').update(image.bytes).digest('hex'),ext={'image/png':'png','image/jpeg':'jpg','image/webp':'webp'}[image.type];
      const relative=path.join('assets',`ref-${hash}.${ext}`);if(!fs.existsSync(path.join(dataDir,relative)))fs.writeFileSync(path.join(dataDir,relative),image.bytes);
      return {path:relative.replace(/\\/g,'/'),name:image.name,kind:image.kind,type:image.type};
    });
  }
  function referenceImages(source){
    return parse(source.refs_json,[]).filter(ref=>ref&&typeof ref.path==='string').map((ref,index)=>safeImage({...ref,data:dataImage(ref)},index));
  }
  function serialized(source){
    const {assets_json,brief_json,review_json,refs_json,feedback_json,...row}=source;
    return {...row,file:path.basename(source.output_path||''),url:source.output_path?`/files/${encodeURIComponent(source.output_path.replace(/\\/g,'/'))}`:null,assets:parse(assets_json,[]),brief:parse(brief_json),review:parse(review_json),feedback:parse(feedback_json)};
  }
  async function imageRequest(form){
    const hasImages=form.has('image[]');
    const result=await requestApi(hasImages?'images/edits':'images/generations',hasImages?{method:'POST',body:form}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(form))},300000);
    const b64=result?.data?.[0]?.b64_json;if(!b64)throw fail('A OpenAI não retornou uma imagem.',502);
    const bytes=Buffer.from(b64,'base64');pngDimensions(bytes);return bytes;
  }
  function formFor(prompt,format){const form=new FormData();for(const [name,value]of Object.entries({model:'gpt-image-2',prompt,size:formatSpec(format).size,quality:'high',output_format:'png'}))form.set(name,value);return form;}
  function save(bytes,{prompt,format,plan,refs,clientId,parentId=null,operation='generate',editRequest=''}){
    const gid=crypto.randomUUID(),relative=path.join('assets',`${operation}-${gid}.png`),created=new Date().toISOString();
    fs.writeFileSync(path.join(dataDir,relative),bytes);
    const brief={...plan};delete brief._token;
    run('INSERT INTO generations(id,prompt,assets_json,output_path,status,created_at,format,brief_json,refs_json,client_id,parent_id,operation,edit_request) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',gid,prompt,JSON.stringify(refs.map(ref=>ref.name)),relative,'done',created,format,JSON.stringify(brief),JSON.stringify(refs),clientId||null,parentId,operation,editRequest);
    return serialized(one('SELECT * FROM generations WHERE id=?',gid));
  }
  async function generate(body){
    key();const input=validatedInput(body);
    const plan=body.briefing?approvedPlan(body,input.brand):await prepare(body);
    if(plan.clarification)return {needs_clarification:true,question:plan.clarification,brief:plan};
    const form=formFor(renderPrompt(input.prompt,plan,input.images,input.format),input.format);
    for(const image of input.images)form.append('image[]',image.blob,image.name);
    const bytes=await imageRequest(form);
    return save(bytes,{prompt:input.prompt,format:input.format,plan,refs:persistReferences(input.images),clientId:input.brand?.id});
  }
  const sourceFor=gid=>{if(typeof gid!=='string'||gid.length>100)throw fail('Arte não encontrada.');const source=one('SELECT * FROM generations WHERE id=?',gid);if(!source?.output_path)throw fail('Arte não encontrada.');fullAsset(source.output_path);return source};
  async function edit(body){
    key();const source=sourceFor(body.generation_id),request=clean(body.request,4000);if(request.length<4)throw fail('Descreva a alteração desejada.');
    const original=fs.readFileSync(fullAsset(source.output_path)),plan=parse(source.brief_json);
    const form=formFor(`${corePolicy}\nEDIÇÃO CIRÚRGICA: ${request}\n${body.mask?'A área transparente da máscara delimita a alteração; preserve o restante.':'Mude somente os itens solicitados e preserve todo o restante.'}\nPedido original: ${source.prompt}\nPlano anterior (contexto; nova edição tem prioridade sobre copy antiga): ${JSON.stringify(plan)}\nNão redefina a marca nem mude paleta/produto/rosto fora do pedido. ${formatSpec(source.format).margins}`,source.format);
    form.append('image[]',new Blob([original],{type:'image/png'}),'arte-original.png');
    if(body.mask){
      const match=String(body.mask).match(/^data:image\/png;base64,([A-Za-z0-9+/=]+)$/);if(!match)throw fail('Máscara inválida.');
      const mask=Buffer.from(match[1],'base64');if(mask.length>4*1024*1024)throw fail('A máscara deve ter menos de 4 MB.');
      const a=pngDimensions(original),b=pngDimensions(mask);if(a.width!==b.width||a.height!==b.height)throw fail('A máscara deve ter o mesmo tamanho da arte.');
      form.append('mask',new Blob([mask],{type:'image/png'}),'area-editavel.png');
    }
    for(const image of referenceImages(source).filter(image=>image.kind!=='referência'))form.append('image[]',image.blob,image.name);
    const bytes=await imageRequest(form);
    return save(bytes,{prompt:source.prompt,format:source.format,plan:{...plan,edits:[...(plan.edits||[]),request].slice(-10)},refs:parse(source.refs_json,[]),clientId:source.client_id,parentId:source.id,operation:'edit',editRequest:request});
  }
  async function adapt(body){
    key();const source=sourceFor(body.generation_id);
    if(!['feed','story'].includes(body.target_format))throw fail('Escolha Feed ou Story.');
    const target=body.target_format;if(target===source.format)throw fail('A arte já está nesse formato.');
    const plan=parse(source.brief_json),form=formFor(`${corePolicy}\nRECOMPOSIÇÃO de ${formatSpec(source.format).target} para ${formatSpec(target).target}. ${formatSpec(target).margins}\nPreserve TODOS os textos, ativos e identidade da imagem principal, inclusive edições já realizadas. Não estique, não comprima e não simplesmente recorte. Ajuste posições/hierarquia para manter conteúdo relevante; expanda ou reduza principalmente fundo e cenário secundário. A primeira imagem é a arte atual, as seguintes são logos/produtos originais para conferir fidelidade. Plano: ${JSON.stringify(plan)}.`,target);
    form.append('image[]',new Blob([fs.readFileSync(fullAsset(source.output_path))],{type:'image/png'}),'arte-atual.png');
    for(const image of referenceImages(source).filter(image=>image.kind!=='referência'))form.append('image[]',image.blob,image.name);
    return save(await imageRequest(form),{prompt:source.prompt,format:target,plan:{...plan,format:target,layout:`Recomposição ${source.format} → ${target}. ${plan.layout||''}`},refs:parse(source.refs_json,[]),clientId:source.client_id,parentId:source.id,operation:'adapt'});
  }
  const pendingReviews=new Map();
  async function reviewOnce(body){
    const source=sourceFor(body.generation_id),cached=parse(source.review_json);if(cached.policy_version===POLICY_VERSION)return cached;
    key();const plan=parse(source.brief_json),refs=referenceImages(source);
    const content=[{type:'input_text',text:`ARTE FINAL: ${formatSpec(source.format).target}. ${formatSpec(source.format).margins}\nPedido original: ${source.prompt}\nPlano/copy e contexto confirmado: ${JSON.stringify(plan)}\nOperação: ${source.operation}; mudança autorizada nesta versão: ${source.edit_request||'nenhuma além da adaptação indicada'}. Edições acumuladas em plan.edits têm prioridade sobre a copy inicial. Avalie a imagem atual, não suponha que o plano foi obedecido. ${refs.length?'Compare com os ativos originais a seguir.':'Não há ativos originais preservados para comparar; sinalize incerteza sobre fidelidade quando relevante.'}`},{type:'input_image',image_url:dataImage({path:source.output_path}),detail:'high'}];
    if(source.parent_id){const parent=one('SELECT output_path FROM generations WHERE id=?',source.parent_id);if(parent?.output_path)content.push({type:'input_text',text:'VERSÃO ANTERIOR: compare preservação de conteúdo, produto e logo; só alterações autorizadas são aceitáveis.'},{type:'input_image',image_url:dataImage({path:parent.output_path}),detail:'high'});}
    for(const image of refs)content.push({type:'input_text',text:`ATIVO ORIGINAL (${image.kind}): ${image.name}`},{type:'input_image',image_url:image.data,detail:'high'});
    const review=normalizeReview(await structured(`${corePolicy}\nREVISÃO: examine os cinco critérios conteudo, hierarquia, marca_produto, legibilidade, acabamento. Dê evidência visual/região e ação concreta por problema. Texto ilegível, copy/dado errado, logo/produto alterado, essencial cortado ou edição fora do escopo são BLOQUEADORES, independentemente da nota estética. Não elogie fidelidade se não puder comparar. Incerteza exige conferir, não aprovação. Não invente problemas nem imponha uma estética única. Correção sugerida deve ser cirúrgica, mencionar o texto correto e preservar os demais elementos. Nota é orientação subjetiva, não medição calibrada.`,content,reviewSchema,'vt_quality_gate'));
    run('UPDATE generations SET review_json=? WHERE id=?',JSON.stringify(review),source.id);return review;
  }
  async function review(body){
    const gid=sourceFor(body.generation_id).id;
    if(pendingReviews.has(gid))return pendingReviews.get(gid);
    const promise=reviewOnce(body);pendingReviews.set(gid,promise);
    try{return await promise}finally{pendingReviews.delete(gid)}
  }
  function feedback(body){
    const source=sourceFor(body.generation_id);if(!['aprovada','rejeitada'].includes(body.verdict))throw fail('Feedback inválido.');
    const result={verdict:body.verdict,reason:clean(body.reason,800),created_at:new Date().toISOString()};run('UPDATE generations SET feedback_json=? WHERE id=?',JSON.stringify(result),source.id);return result;
  }
  return {prepare,generate,edit,adapt,review,feedback,serialized};
}
