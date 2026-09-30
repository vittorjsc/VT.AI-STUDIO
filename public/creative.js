function creativeActiveArt(){
  return state.generations.find(art=>art.id===state.activeGenerationId)||state.generations[0];
}
function creativeAttachmentView(){
  return state.attachments.map((item,index)=>`<div class="attachment creative-attachment">
    <img src="${item.data}" alt="${esc(item.name)}">
    <div class="attachment-info"><strong>${esc(item.name)}</strong><label>Função da imagem
      <select aria-label="Função de ${esc(item.name)}" onchange="creativeSetAttachmentKind(${index},this.value)">
        ${['referência','logo','produto'].map(kind=>`<option value="${kind}" ${item.kind===kind?'selected':''}>${kind==='referência'?'Referência':kind==='logo'?'Logo':'Produto / pessoa'}</option>`).join('')}
      </select></label></div><button type="button" class="ghost" aria-label="Remover ${esc(item.name)}" onclick="creativeRemoveAttachment(${index})">Remover</button>
  </div>`).join('');
}
function creativeSuggestion(field,label){
  const suggestion=state.briefing?.[`suggested_${field}`];
  return suggestion&&suggestion!==state.briefing[field]?`<div class="suggestion"><span><strong>Alternativa de ${label}:</strong> ${esc(suggestion)}</span><button class="ghost" onclick="creativeUseSuggestion('${field}')">Usar alternativa</button></div>`:'';
}
function creativeBriefView(){
  const brief=state.briefing;if(!brief)return '';
  const field=(name,label,tag='input')=>`<label>${label}${tag==='textarea'?`<textarea maxlength="800" data-brief="${name}">${esc(brief[name]||'')}</textarea>`:`<input maxlength="500" data-brief="${name}" value="${esc(brief[name]||'')}">`}</label>`;
  return `<div class="brief-card" id="briefCard">
    <div class="section-heading"><div><p class="kicker">Direção criativa · opcional</p><h2>Seu plano, com controle</h2></div><span class="pill ok">EDITÁVEL</span></div>
    ${brief.alerts?.length?`<div class="brief-alerts"><strong>Pontos de atenção</strong><ul>${brief.alerts.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:''}
    <p class="muted">Este planejamento também acontece no modo automático. Aqui você pode ajustar as decisões e os textos antes de gerar.</p>
    <details class="brief-details"><summary>Objetivo, conceito e composição</summary>
      ${field('objective','Objetivo')}${field('audience','Público')}${field('positioning','Posicionamento')}
      ${field('concept','Conceito','textarea')}${field('visual_direction','Direção visual','textarea')}${field('layout','Composição','textarea')}${field('palette','Paleta')}
      ${field('main_subject','Imagem ou elemento principal','textarea')}${field('background','Fundo e cenário','textarea')}${field('typography','Tipografia')}${field('density','Densidade visual')}${field('reference_strategy','Como usar a referência','textarea')}${field('visual_rationale','Intenção da ideia visual','textarea')}
      ${brief.visual_elements?.length?`<div class="visual-plan"><strong>Elementos propostos pela VT.AI</strong>${brief.visual_elements.map(item=>`<p><strong>${esc(item.element)}</strong> · ${esc(item.purpose)}<br><span class="muted">${esc(item.treatment)} · ${esc(item.placement)}</span></p>`).join('')}</div>`:''}
    </details>
    <h3>Textos finais da arte</h3><p class="muted">Campos vazios ficam sem texto. Um título temático pode ser preparado automaticamente; preços e dados comerciais precisam estar confirmados.</p>
    ${field('headline','Título principal')}${creativeSuggestion('headline','título')}
    ${field('support','Apoio — só se necessário')}${creativeSuggestion('support','apoio')}
    ${field('cta','Chamada para ação — opcional')}${creativeSuggestion('cta','CTA')}
    <button class="ghost" onclick="creativeDiscardBrief()">Rever pedido</button>
  </div>`;
}
function creativeReviewView(art){
  if(state.reviewLoadingIds?.has(art.id))return '<div class="review-card"><p class="kicker">Revisão visual</p><p>Comparando conteúdo, marca, produto e margens com os ativos originais…</p></div>';
  const review=art.review;
  if(review?.status){
    const label={publicavel:'Sem bloqueadores apontados',corrigir:'Precisa de correção',conferir:'Conferência necessária'}[review.decision]||review.status;
    return `<div class="review-card ${review.status==='aprovada'?'review-ok':'review-warn'}">
      <div class="section-heading"><p class="kicker">Revisão visual por IA</p><strong>${esc(label)}</strong></div>
      ${review.problems?.length?`<ul>${review.problems.map(item=>`<li><strong>${esc(item.severity)} · ${esc(item.region)}</strong>: ${esc(item.evidence)}<p class="muted">${esc(item.fix)}</p></li>`).join('')}</ul>`:review.issues?.length?`<ul>${review.issues.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p>Nenhum problema relevante apontado.</p>'}
      ${review.criteria?.length?`<details class="brief-details"><summary>Evidências por critério</summary>${review.criteria.map(item=>`<p><strong>${esc(item.name)} · ${item.score}/5${item.uncertain?' · incerto':''}</strong><br>${esc(item.evidence)}</p>`).join('')}</details>`:''}
      ${review.suggested_fix?`<p class="muted"><strong>Ajuste sugerido:</strong> ${esc(review.suggested_fix)}</p>${review.decision!=='publicavel'?`<button class="ghost" onclick="creativeFix('${art.id}')">Revisar pedido de correção</button>`:''}`:''}
      <p class="muted">Confira antes de publicar. A revisão e suas notas são orientações subjetivas, não garantia de perfeição.</p>
    </div>`;
  }
  return `<div class="review-card"><p class="kicker">Revisão visual</p><p class="muted">${esc(state.reviewErrors?.[art.id]||'Confira legibilidade, logo e margens antes de publicar.')}</p><button class="ghost" onclick="creativeReview('${art.id}')">Revisar qualidade</button></div>`;
}
function creativeEditView(art){
  return `<div class="section-heading result-heading"><div><p class="kicker">AJUSTE FINO</p><h2>Editar versão</h2></div><span class="pill">${art.format==='story'?'STORY':'FEED'}</span></div><div class="edit-stage"><img id="editImage" class="result-image" src="${art.url}" alt="Arte selecionada para edição"><canvas id="editMaskCanvas" aria-label="Área de edição"></canvas></div>
    <p class="muted edit-help">Arraste para marcar uma área. A máscara orienta a IA; não garante preservação pixel a pixel. Original e contexto da marca são mantidos no histórico.</p>
    <button type="button" class="ghost" onclick="creativeClearMask()">Limpar seleção</button>
    <label for="editRequest">O que deve mudar?</label><textarea class="prompt" maxlength="4000" id="editRequest" placeholder="Ex.: Troque somente o título por 'Feliz Dia do Cliente'.">${esc(state.editDraft||'')}</textarea>
    <div class="edit-actions"><button type="button" class="primary generate" id="editBtn" onclick="creativeSubmitEdit()">Gerar nova versão</button><button type="button" class="ghost" onclick="creativeCancelEdit()">Cancelar</button></div>
    <p class="muted creative-cost">A edição gera outra imagem e consome créditos. A original não será apagada.</p>`;
}
function creativeResultView(art){
  if(!art)return `<div class="section-heading result-heading"><div><p class="kicker">SEU ESPAÇO VISUAL</p><h2>Prévia da arte</h2></div><span class="pill">AGUARDANDO PEDIDO</span></div><div class="result-placeholder"><div class="placeholder-canvas" aria-hidden="true"><div class="placeholder-orbit"></div><span>VT.<b>AI</b></span><small>IDEIA → ARTE</small></div><div class="placeholder-copy"><strong>Sua ideia ganha forma aqui.</strong><p>Escreva o pedido, escolha o formato e gere a primeira versão. Depois você pode editar ou adaptar para o outro formato.</p></div></div>`;
  const target=art.format==='story'?'feed':'story';
  return `<div class="section-heading result-heading"><div><p class="kicker">RESULTADO ATUAL</p><h2>Arte para ${art.format==='story'?'Story':'Feed'}</h2></div><span class="pill ok">${art.format==='story'?'1080 × 1920':'1080 × 1350'}</span></div>
    <div class="result-stage"><img class="result-image" src="${art.url}" alt="Arte gerada para ${art.format==='story'?'Story':'Feed'}"></div>
    <div class="actions creative-actions result-actions"><button type="button" class="primary" onclick="creativeAdapt('${art.id}','${target}')">Adaptar para ${target==='story'?'Story':'Feed'}</button><button type="button" class="ghost" onclick="creativeStartEdit('${art.id}')">Editar arte</button><button type="button" class="ghost" onclick="downloadArt('${art.url}','${art.format||'feed'}','${art.file||'arte-vt-ai.png'}')">Baixar PNG</button></div>
    <p class="muted creative-cost">Adaptação e edição geram novas imagens e consomem créditos.</p>
    ${art.brief?.concept?`<details class="brief-details"><summary>Direção usada nesta arte</summary><p>${esc(art.brief.concept)}</p><p>${esc(art.brief.visual_direction)}</p><p>Marca: ${esc(art.brief.brand?.name||'Sem perfil selecionado')}</p><p>Base consultada: ${esc((art.brief.knowledge_sources||[]).map(item=>item.heading).join(' · ')||'Regras operacionais VT.AI')}</p>${art.brief.edits?.map(item=>`<p>Edição: ${esc(item)}</p>`).join('')||''}</details>`:''}
    ${creativeReviewView(art)}
    <div class="feedback-card"><label>O resultado atendeu ao pedido?</label><div class="actions"><button class="ghost" onclick="creativeFeedback('${art.id}','aprovada')">Gostei</button><button class="ghost" onclick="creativeFeedback('${art.id}','rejeitada')">Precisa melhorar</button></div><textarea id="feedbackReason" maxlength="800" placeholder="Opcional: o que funcionou ou precisa mudar?">${esc(state.feedbackDrafts?.[art.id]??art.feedback?.reason??'')}</textarea>${art.feedback?.verdict?`<p class="muted">Feedback salvo: ${esc(art.feedback.verdict)}. Registro local; não treina o modelo automaticamente.</p>`:''}</div>`;
}
function creativeView(){
  const active=creativeActiveArt(),question=state.briefing?.clarification;
  return `<div class="create-grid studio-workspace"><div class="panel composer-panel" id="creativeComposer">
    <div class="section-heading composer-heading"><div><p class="kicker">01 / SEU BRIEFING</p><h2>O que você quer criar?</h2></div><span class="pill ok">MODO SIMPLES</span></div>
    <p class="muted composer-intro">Pode escrever como falaria com um designer. A VT.AI pensa no conceito, na composição e nos elementos visuais.</p>
    <label for="creativePrompt">Seu pedido <span class="field-optional">· comece aqui</span></label><textarea class="prompt" maxlength="6000" id="creativePrompt" placeholder="Ex.: Faça uma arte de Dia do Cliente para minha cafeteria, usando as cores da marca.">${esc(state.draft||'')}</textarea>
    <div class="field-group"><div class="field-title"><span>Imagens de apoio <small>OPCIONAL</small></span><span class="field-count">${state.attachments.length}/4</span></div>
      <div class="paste-zone" contenteditable="true" role="textbox" aria-label="Cole uma imagem de referência, logo ou produto" tabindex="0" onbeforeinput="event.preventDefault()" onpaste="creativePasteImage(event)" ondragover="event.preventDefault()" ondrop="creativeDropFiles(event)">
        <div class="paste-symbol" aria-hidden="true">+</div><strong>Cole ou arraste uma imagem</strong><span>Referência, logo ou produto · PNG, JPG e WebP</span><button type="button" class="upload-plus" contenteditable="false" title="Selecionar imagens" aria-label="Selecionar imagens para anexar" onclick="document.getElementById('quickImageUpload').click()">Escolher arquivo</button><input id="quickImageUpload" contenteditable="false" type="file" multiple accept="image/png,image/jpeg,image/webp" onchange="creativeAttachFiles(this.files);this.value=''">
      </div><div id="attachments">${creativeAttachmentView()}</div>${state.pendingUploads?'<p class="muted" role="status">Carregando anexos…</p>':''}</div>
    <div class="composer-options"><div><label for="creativeClient">Marca <span class="field-optional">· opcional</span></label><select id="creativeClient"><option value="">Sem marca cadastrada</option>${state.clients.map(client=>`<option value="${client.id}" ${state.clientId===client.id?'selected':''}>${esc(client.name)}</option>`).join('')}</select></div>
      <div><label for="creativeFormat">Formato inicial</label><select id="creativeFormat"><option value="feed">Feed · 1080 × 1350</option><option value="story">Story · 1080 × 1920</option></select></div></div>
    <p class="muted format-hint">Depois da geração, você pode adaptar a composição para o outro formato — sem esticar a arte.</p>
    ${state.creativeError?`<p class="creative-error" role="alert">${esc(state.creativeError)}</p>`:''}
    ${question?`<div class="brief-alerts clarification"><strong>Só falta uma informação</strong><p>${esc(question)}</p><textarea id="clarificationAnswer" maxlength="1500" placeholder="Responda aqui…">${esc(state.clarificationDraft||'')}</textarea><button class="primary" onclick="creativeAnswer()">Continuar</button></div>`:''}
    ${!question?creativeBriefView():''}
    <button type="button" class="primary generate" id="generateBtn" onclick="creativeGenerate()">${state.briefing?'Gerar com esta direção':'Gerar minha arte'} <span aria-hidden="true">↗</span></button>
    <details class="advanced-card" ${state.advanced?'open':''}><summary>Direção criativa avançada <span>Opcional</span></summary><p class="muted">Veja o plano e ajuste textos, conceito, cores ou composição antes da geração.</p><button type="button" class="ghost" id="prepareBtn" onclick="creativePrepare()">Preparar direção para editar</button></details>
    <details class="privacy-details"><summary>Como funciona o uso de créditos e dados</summary><p class="muted">Ao preparar ou gerar, pedido, anexos, contexto da marca e trechos relevantes da base são enviados à OpenAI. Planejamento, imagem e revisão consomem créditos. Não fazemos novas gerações automáticas para correção.</p></details>
  </div><div class="panel result-panel" id="creativeResult">${state.creativeBusy?`<div class="creative-progress" role="status"><span class="progress-spark" aria-hidden="true"></span><div><strong>${esc(state.creativeBusy)}</strong><span>Pode levar alguns minutos. Mantenha esta página aberta.</span></div></div>`:''}${state.editing?creativeEditView(state.editing):creativeResultView(active)}</div></div>
  ${state.generations.length?`<div class="panel history-panel"><div class="section-heading"><div><p class="kicker">SUAS VERSÕES</p><h2>Histórico de criações</h2></div><span class="pill">${state.generations.length} ${state.generations.length===1?'ARTE':'ARTES'}</span></div><div class="generated-list">${state.generations.map(art=>`<button type="button" class="ghost ${active?.id===art.id?'selected':''}" aria-pressed="${active?.id===art.id}" title="Abrir arte para ${art.format==='story'?'Story':'Feed'}" onclick="creativeSelectArt('${art.id}')"><img src="${art.url}" alt="Arte ${art.format||'feed'} gerada em ${esc(art.created_at)}"><span>${art.format==='story'?'Story':'Feed'}</span></button>`).join('')}</div></div>`:''}`;
}
function creativeAfter(){
  const prompt=$('#creativePrompt');if(prompt)prompt.oninput=event=>{state.draft=event.target.value;creativeSaveDraft();creativeInvalidateBrief(false)};
  const format=$('#creativeFormat');if(format){format.value=state.format;format.onchange=event=>{state.format=event.target.value;creativeSaveDraft();creativeInvalidateBrief(true)}}
  const client=$('#creativeClient');if(client)client.onchange=event=>{state.clientId=event.target.value;creativeSaveDraft();creativeInvalidateBrief(true)};
  document.querySelectorAll('[data-brief]').forEach(field=>field.oninput=event=>{state.briefing[event.target.dataset.brief]=event.target.value});
  const edit=$('#editRequest');if(edit)edit.oninput=event=>state.editDraft=event.target.value;
  const answer=$('#clarificationAnswer');if(answer)answer.oninput=event=>state.clarificationDraft=event.target.value;
  const feedback=$('#feedbackReason');if(feedback)feedback.oninput=event=>{state.feedbackDrafts||={};state.feedbackDrafts[creativeActiveArt().id]=event.target.value};
  const advanced=$('.advanced-card');if(advanced)advanced.ontoggle=()=>state.advanced=advanced.open;
  if(state.creativeBusy){document.querySelectorAll('#creativeComposer button,#creativeComposer input,#creativeComposer select,#creativeComposer textarea,#creativeResult button,#creativeResult textarea').forEach(element=>element.disabled=true);$('.paste-zone')?.setAttribute('contenteditable','false')}
  if(questionPresent())$('#generateBtn').disabled=true;
  if(state.pendingUploads){$('#generateBtn').disabled=true;$('#prepareBtn').disabled=true}
  if(state.editing)creativeInitMask();
}
function questionPresent(){return !!state.briefing?.clarification}
function creativeDraftKey(){return state.user?.id?`vt-creative-draft:${state.user.id}`:'vt-creative-draft'}
function creativeSaveDraft(){try{localStorage.setItem(creativeDraftKey(),JSON.stringify({prompt:state.draft,format:state.format,clientId:state.clientId||''}))}catch{}}
function creativeRestoreDraft(){try{let raw=localStorage.getItem(creativeDraftKey());if(!raw&&state.user?.role==='admin'){raw=localStorage.getItem('vt-creative-draft');if(raw){localStorage.setItem(creativeDraftKey(),raw);localStorage.removeItem('vt-creative-draft')}}const draft=JSON.parse(raw||'{}');state.draft=String(draft.prompt||'').slice(0,6000);state.format=draft.format==='story'?'story':'feed';state.clientId=state.clients.some(client=>client.id===draft.clientId)?draft.clientId:''}catch{}}
function creativeInvalidateBrief(rerender){
  state.briefing=null;state.creativeError='';state.clarificationDraft='';
  if(rerender)render();else{$('#briefCard')?.remove();$('.clarification')?.remove();const button=$('#generateBtn');if(button){button.innerHTML='Gerar minha arte <span aria-hidden="true">↗</span>';button.disabled=!!state.creativeBusy||!!state.pendingUploads}}
}
function creativeSetAttachmentKind(index,kind){if(state.creativeBusy||!state.attachments[index])return;state.attachments[index].kind=kind;creativeInvalidateBrief(false)}
function creativeRemoveAttachment(index){if(state.creativeBusy)return;state.attachments.splice(index,1);creativeInvalidateBrief(true)}
async function creativeAttachFiles(files){
  if(state.creativeBusy)return;
  state.draft=$('#creativePrompt')?.value??state.draft;
  const available=Math.max(0,4-state.attachments.length-(state.pendingUploads||0));
  if(files.length>available)toast('Use no máximo 4 imagens por arte.');
  const accepted=[...files].slice(0,available).filter(file=>{if(!/^image\/(png|jpeg|webp)$/.test(file.type)){toast('Use PNG, JPG ou WebP.');return false}if(file.size>10*1024*1024){toast('Cada imagem deve ter no máximo 10 MB.');return false}return true});
  state.pendingUploads=(state.pendingUploads||0)+accepted.length;render();
  const results=await Promise.all(accepted.map(file=>new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve({name:file.name,data:reader.result});reader.onerror=()=>{toast('Não foi possível ler '+file.name);resolve(null)};reader.readAsDataURL(file)})));
  for(const item of results.filter(Boolean)){item.kind=state.attachments.length===1?'logo':state.attachments.length>=2?'produto':'referência';state.attachments.push(item)}
  state.pendingUploads-=accepted.length;creativeInvalidateBrief(true);creativeSaveDraft();
}
function creativePasteImage(event){event.preventDefault();if(state.creativeBusy)return;const files=[...event.clipboardData.items].filter(item=>item.type.startsWith('image/')).map(item=>item.getAsFile()).filter(Boolean);if(!files.length)return toast('Copie uma imagem e pressione Ctrl + V aqui.');creativeAttachFiles(files)}
function creativeDropFiles(event){event.preventDefault();if(state.creativeBusy)return;const files=[...(event.dataTransfer?.files||[])];if(files.length)creativeAttachFiles(files)}
function creativeInput(){
  state.draft=($('#creativePrompt')?.value??state.draft).trim();creativeSaveDraft();
  if(state.draft.length<8)throw Error('Descreva a arte que deseja criar.');
  if(state.pendingUploads)throw Error('Aguarde o carregamento dos anexos.');
  return {prompt:state.draft,format:state.format,client_id:state.clientId||null,images:state.attachments};
}
async function creativePaidApi(url,body){return api(url,'POST',{...body,request_id:crypto.randomUUID()})}
async function creativePrepare(){
  if(state.creativeBusy)return;
  try{const input=creativeInput();state.resumeAutomatic=false;state.creativeError='';state.creativeBusy='Interpretando o pedido e os ativos';render();state.briefing=await creativePaidApi('/api/briefing',input);state.advanced=true}
  catch(error){state.creativeError=error.message}
  finally{state.creativeBusy='';render()}
}
function creativeUseSuggestion(field){const value=state.briefing?.[`suggested_${field}`];if(!value)return;state.briefing[field]=value;const input=document.querySelector(`[data-brief="${field}"]`);if(input)input.value=value}
function creativeDiscardBrief(){creativeInvalidateBrief(true)}
async function creativeAnswer(){
  const answer=$('#clarificationAnswer')?.value.trim();if(!answer)return toast('Responda à informação que falta.');
  const automatic=state.resumeAutomatic;state.draft=(state.draft+'\nComplemento do usuário: '+answer).slice(0,6000);state.briefing=null;state.clarificationDraft='';creativeSaveDraft();render();
  if(automatic)await creativeGenerate();else await creativePrepare();
}
async function creativeGenerate(){
  if(state.creativeBusy||questionPresent())return;
  let art;
  try{
    const input=creativeInput();state.creativeError='';state.resumeAutomatic=true;
    if(!state.briefing){state.creativeBusy='Planejando direção, conteúdo e composição';render();state.briefing=await creativePaidApi('/api/briefing',input)}
    if(state.briefing.clarification)return;
    state.creativeBusy='Gerando a arte com o plano preparado';render();
    art=await creativePaidApi('/api/generate',{...input,briefing:state.briefing});
    if(art.needs_clarification){state.briefing=art.brief;art=null;return}
    state.generations.unshift(art);state.activeGenerationId=art.id;state.editing=null;state.attachments=[];state.draft='';state.briefing=null;creativeSaveDraft();
  }catch(error){state.creativeError=error.message}
  finally{state.creativeBusy='';render()}
  if(art)creativeReview(art.id);
}
function creativeSelectArt(id){if(state.creativeBusy)return;state.activeGenerationId=id;state.editing=null;state.editRect=null;render()}
function creativeStartEdit(id){if(state.creativeBusy)return;const art=state.generations.find(item=>item.id===id);if(!art)return toast('Arte não encontrada.');state.activeGenerationId=id;state.editing=art;state.editDraft='';state.editRect=null;render()}
function creativeCancelEdit(){if(state.creativeBusy)return;state.editing=null;state.editRect=null;state.editDraft='';render()}
function creativeFix(id){if(state.creativeBusy)return;creativeStartEdit(id);const art=state.generations.find(item=>item.id===id);state.editDraft=art?.review?.suggested_fix||'';render()}

function creativeInitMask(){
  const image=$('#editImage'),canvas=$('#editMaskCanvas');if(!image||!canvas)return;
  const setup=()=>{canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;creativeDrawMask();};
  if(image.complete&&image.naturalWidth)setup();else image.onload=setup;
  const point=event=>{const box=canvas.getBoundingClientRect();return {x:Math.round((event.clientX-box.left)*canvas.width/box.width),y:Math.round((event.clientY-box.top)*canvas.height/box.height)}};
  canvas.onpointerdown=event=>{if(!canvas.width)return;canvas.setPointerCapture(event.pointerId);const start=point(event);state.editRect={x1:start.x,y1:start.y,x2:start.x,y2:start.y};creativeDrawMask()};
  canvas.onpointermove=event=>{if(!state.editRect||!canvas.hasPointerCapture(event.pointerId))return;const end=point(event);state.editRect.x2=end.x;state.editRect.y2=end.y;creativeDrawMask()};
  canvas.onpointerup=event=>{if(canvas.hasPointerCapture(event.pointerId)){const end=point(event);state.editRect.x2=end.x;state.editRect.y2=end.y;canvas.releasePointerCapture(event.pointerId)}creativeDrawMask()};
}

function creativeDrawMask(){
  const canvas=$('#editMaskCanvas');if(!canvas||!canvas.width)return;
  const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);
  const rect=state.editRect;if(!rect)return;
  const x=Math.min(rect.x1,rect.x2),y=Math.min(rect.y1,rect.y2),width=Math.abs(rect.x2-rect.x1),height=Math.abs(rect.y2-rect.y1);
  ctx.fillStyle='rgba(112,241,89,.25)';ctx.fillRect(x,y,width,height);ctx.strokeStyle='#70f159';ctx.lineWidth=Math.max(3,canvas.width/300);ctx.strokeRect(x,y,width,height);
}

function creativeClearMask(){state.editRect=null;creativeDrawMask()}

function creativeMaskData(){
  const image=$('#editImage'),rect=state.editRect;if(!image||!rect)return null;
  const x=Math.max(0,Math.min(rect.x1,rect.x2)),y=Math.max(0,Math.min(rect.y1,rect.y2));
  const width=Math.min(image.naturalWidth-x,Math.abs(rect.x2-rect.x1)),height=Math.min(image.naturalHeight-y,Math.abs(rect.y2-rect.y1));
  if(width<12||height<12)return null;
  const mask=document.createElement('canvas');mask.width=image.naturalWidth;mask.height=image.naturalHeight;
  const ctx=mask.getContext('2d');ctx.fillStyle='#000';ctx.fillRect(0,0,mask.width,mask.height);ctx.clearRect(x,y,width,height);
  return mask.toDataURL('image/png');
}

async function creativeSubmitEdit(){
  if(state.creativeBusy)return;
  const request=$('#editRequest')?.value.trim()||'';if(request.length<4)return toast('Descreva a alteração desejada.');
  const generation_id=state.editing.id,mask=creativeMaskData();state.editDraft=request;let art;
  try{state.creativeBusy='Aplicando a alteração e preservando a versão original';render();art=await creativePaidApi('/api/generate/edit',{generation_id,request,mask});state.generations.unshift(art);state.activeGenerationId=art.id;state.editing=null;state.editRect=null;state.editDraft=''}
  catch(error){toast(error.message)}
  finally{state.creativeBusy='';render()}
  if(art)creativeReview(art.id);
}
async function creativeAdapt(id,target){
  if(state.creativeBusy)return;let art;
  try{state.creativeBusy='Recompondo a arte para '+(target==='story'?'Story':'Feed');render();art=await creativePaidApi('/api/generate/adapt',{generation_id:id,target_format:target});state.generations.unshift(art);state.activeGenerationId=art.id}
  catch(error){toast(error.message)}
  finally{state.creativeBusy='';render()}
  if(art)creativeReview(art.id);
}
async function creativeReview(id){
  const art=state.generations.find(item=>item.id===id);state.reviewLoadingIds||=new Set();state.reviewErrors||={};
  if(!art||state.reviewLoadingIds.has(id)||art.review?.status)return;
  state.reviewLoadingIds.add(id);delete state.reviewErrors[id];creativeRefreshReview(id);
  try{const review=await creativePaidApi('/api/generate/review',{generation_id:id});const current=state.generations.find(item=>item.id===id);if(current)current.review=review}
  catch(error){state.reviewErrors[id]=error.message}
  finally{state.reviewLoadingIds.delete(id);creativeRefreshReview(id)}
}
function creativeRefreshReview(id){
  if(state.page!=='create'||state.editing||creativeActiveArt()?.id!==id)return;
  const card=$('#creativeResult .review-card');if(card)card.outerHTML=creativeReviewView(creativeActiveArt());
}
async function creativeFeedback(id,verdict){
  const art=state.generations.find(item=>item.id===id);if(!art)return;
  try{art.feedback=await api('/api/generate/feedback','POST',{generation_id:id,verdict,reason:$('#feedbackReason')?.value||''});toast('Feedback salvo localmente.');render()}
  catch(error){toast(error.message)}
}
function creativeUseClient(id){if(state.creativeBusy)return;state.clientId=id;creativeInvalidateBrief(false);creativeSaveDraft();setPage('create')}
