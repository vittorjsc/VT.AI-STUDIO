function creativeActiveArt(){
  return state.generations.find(art=>art.id===state.activeGenerationId)||state.generations[0];
}

function creativeAttachmentView(){
  return state.attachments.map((item,index)=>`<div class="attachment creative-attachment">
    <img src="${item.data}" alt="${esc(item.name)}">
    <div class="attachment-info"><strong>${esc(item.name)}</strong><label>Função da imagem
      <select aria-label="Função de ${esc(item.name)}" onchange="creativeSetAttachmentKind(${index},this.value)">
        ${['referência','logo','produto'].map(kind=>`<option value="${kind}" ${item.kind===kind?'selected':''}>${kind==='referência'?'Referência':kind==='logo'?'Logo':'Produto / pessoa'}</option>`).join('')}
      </select></label></div>
    <button class="ghost" onclick="creativeRemoveAttachment(${index})">Remover</button>
  </div>`).join('');
}

function creativeSuggestion(field,label){
  const suggestion=state.briefing?.[`suggested_${field}`];
  return suggestion?`<div class="suggestion"><span><strong>Sugestão de ${label}:</strong> ${esc(suggestion)}</span><button class="ghost" onclick="creativeUseSuggestion('${field}')">Usar sugestão</button></div>`:'';
}

function creativeBriefView(){
  const brief=state.briefing;
  if(!brief)return '';
  const field=(name,label,tag='input')=>`<label>${label}${tag==='textarea'?`<textarea data-brief="${name}">${esc(brief[name]||'')}</textarea>`:`<input data-brief="${name}" value="${esc(brief[name]||'')}">`}</label>`;
  return `<div class="brief-card" id="briefCard">
    <div class="section-heading"><div><p class="kicker">Etapa 2 · direção criativa</p><h2>Revise antes de gerar</h2></div><span class="pill ok">EDITÁVEL</span></div>
    ${brief.alerts?.length?`<div class="brief-alerts"><strong>Pontos de atenção</strong><ul>${brief.alerts.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:''}
    <div class="brief-summary"><p><strong>Objetivo:</strong> ${esc(brief.objective||'A definir')}</p><p><strong>Público:</strong> ${esc(brief.audience||'A definir')}</p><p><strong>Posicionamento:</strong> ${esc(brief.positioning||'A definir')}</p></div>
    <details class="brief-details"><summary>Conceito e composição</summary>
      ${field('concept','Conceito','textarea')}${field('visual_direction','Direção visual','textarea')}${field('layout','Composição','textarea')}${field('palette','Paleta')}
    </details>
    <h3>Textos que entrarão na arte</h3>
    <p class="muted">Só estes campos serão enviados como copy aprovada. Sugestões abaixo só entram se você escolher.</p>
    ${field('headline','Título principal')}${creativeSuggestion('headline','título')}
    ${field('support','Texto de apoio')}${creativeSuggestion('support','apoio')}
    ${field('cta','Chamada para ação')}${creativeSuggestion('cta','CTA')}
    <div class="actions creative-actions"><button class="primary" id="generateBtn" onclick="creativeGenerate(true)">Aprovar e gerar arte</button><button class="ghost" onclick="creativeDiscardBrief()">Rever pedido</button></div>
  </div>`;
}

function creativeReviewView(art){
  if(state.reviewLoadingId===art.id)return '<div class="review-card"><p class="kicker">Revisão visual</p><p>Conferindo texto, logo, margens e excesso de elementos…</p></div>';
  if(art.review?.status)return `<div class="review-card ${art.review.status==='aprovada'?'review-ok':'review-warn'}">
    <div class="section-heading"><p class="kicker">Revisão visual por IA</p><strong>${esc(art.review.status)} · ${esc(art.review.score)}/10</strong></div>
    ${art.review.issues?.length?`<ul>${art.review.issues.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p>Nenhum problema relevante apontado na análise.</p>'}
    ${art.review.suggested_fix?`<p class="muted"><strong>Ajuste sugerido:</strong> ${esc(art.review.suggested_fix)}</p>`:''}
    <p class="muted">Confira a arte antes de publicar: esta revisão é uma ajuda, não uma garantia.</p>
  </div>`;
  return `<div class="review-card"><p class="kicker">Revisão visual</p><p class="muted">${esc(state.reviewErrorId===art.id?state.reviewError:'Confira legibilidade, logo e margens antes de publicar.')}</p><button class="ghost" onclick="creativeReview('${art.id}')">Revisar qualidade</button></div>`;
}

function creativeEditView(art){
  return `<h2>Editar versão</h2>
    <div class="edit-stage"><img id="editImage" class="result-image" src="${art.url}" alt="Arte selecionada"><canvas id="editMaskCanvas" aria-label="Área de edição"></canvas></div>
    <p class="muted edit-help">Arraste sobre a imagem para marcar uma área específica. Sem seleção, a edição considera a arte toda. A máscara orienta a IA; confira o resultado depois.</p>
    <button class="ghost" onclick="creativeClearMask()">Limpar seleção</button>
    <label>O que deve mudar?</label><textarea class="prompt" id="editRequest" placeholder="Ex.: Troque somente o título por 'Feliz Dia do Cliente'."></textarea>
    <button class="primary generate" id="editBtn" onclick="creativeSubmitEdit()">Gerar nova versão</button>
    <button class="ghost" style="margin-top:9px" onclick="creativeCancelEdit()">Cancelar</button>`;
}

function creativeResultView(art){
  if(!art)return '<h2>Resultado</h2><div class="empty">Sua arte aparecerá aqui.<br><br>Comece adicionando uma referência ou logo.</div>';
  const target=art.format==='story'?'feed':'story';
  return `<div class="section-heading"><h2>Resultado · ${art.format==='story'?'Story':'Feed'}</h2><span class="pill ok">${art.format==='story'?'1080 × 1920':'1080 × 1350'}</span></div>
    <img class="result-image" src="${art.url}" alt="Arte gerada">
    <div class="actions creative-actions">
      <button class="primary" onclick="creativeAdapt('${art.id}','${target}',this)">Gerar para ${target==='story'?'Story':'Feed'}</button>
      <button class="ghost" onclick="creativeStartEdit('${art.id}')">Editar esta arte</button>
      <button class="ghost" onclick="downloadArt('${art.url}','${art.format||'feed'}','${art.file||'arte-vt-ai.png'}')">Baixar PNG</button>
    </div>${creativeReviewView(art)}`;
}

function creativeView(){
  const active=creativeActiveArt();
  return `<div class="create-grid"><div class="panel">
    <div class="section-heading"><div><p class="kicker">Etapa 1 · pedido</p><h2>Converse com a diretora de arte</h2></div></div>
    <p class="muted">Cole ou envie referência, logo e produto. Depois descreva o objetivo da peça.</p>
    <div class="paste-zone" contenteditable="true" role="textbox" tabindex="0" onpaste="creativePasteImage(event)">
      <strong>Cole uma imagem aqui</strong><span>Copie a imagem e pressione Ctrl + V</span>
      <button class="upload-plus" contenteditable="false" title="Enviar imagem" onclick="document.getElementById('quickImageUpload').click()">+</button>
      <input id="quickImageUpload" contenteditable="false" type="file" multiple accept="image/png,image/jpeg,image/webp" onchange="creativeAttachFiles(this.files)">
    </div>
    <div id="attachments">${creativeAttachmentView()}</div>
    <label>Seu pedido</label><textarea class="prompt" id="creativePrompt" placeholder="Ex.: Arte de Dia do Cliente para minha loja, baseada na referência. Use a logo e escreva exatamente 'Feliz Dia do Cliente'.">${esc(state.draft||'')}</textarea>
    <div class="card format-card"><p class="kicker">Formato da arte</p><label>Gerar para</label><select id="creativeFormat"><option value="feed">Feed vertical · 1080 × 1350</option><option value="story">Story · 1080 × 1920</option></select><p class="muted">Depois você pode criar a versão correspondente no outro formato.</p></div>
    ${state.creativeError?`<p class="creative-error" role="alert">${esc(state.creativeError)}</p>`:''}
    ${creativeBriefView()}
    <div class="actions creative-actions" id="prepActions" ${state.briefing?'hidden':''}>
      <button class="primary" id="prepareBtn" onclick="creativePrepare()">Preparar direção criativa</button>
      <button class="ghost" id="directBtn" onclick="creativeGenerate(false)">Gerar direto</button>
    </div>
    <p class="muted creative-cost">Preparar e revisar usam análise por IA e podem consumir créditos. A imagem só é gerada quando você confirma.</p>
  </div><div class="panel">${state.editing?creativeEditView(state.editing):creativeResultView(active)}</div></div>
  <div class="panel history-panel"><h2>Histórico de criações</h2>${state.generations.length?`<div class="generated-list">${state.generations.map(art=>`<button class="ghost ${active?.id===art.id?'selected':''}" title="Abrir esta arte" onclick="creativeSelectArt('${art.id}')"><img src="${art.url}" alt="Arte ${art.format||'feed'} gerada em ${esc(art.created_at)}"></button>`).join('')}</div>`:'<p class="muted">Ainda não há artes geradas.</p>'}</div>`;
}

function creativeAfter(){
  const prompt=$('#creativePrompt');if(prompt)prompt.oninput=event=>{state.draft=event.target.value;creativeInvalidateBrief(false)};
  const format=$('#creativeFormat');if(format){format.value=state.format;format.onchange=event=>{state.format=event.target.value;creativeInvalidateBrief(true)}};
  document.querySelectorAll('[data-brief]').forEach(field=>field.oninput=event=>{state.briefing[event.target.dataset.brief]=event.target.value});
  if(state.editing)creativeInitMask();
}

function creativeInvalidateBrief(rerender){
  state.briefing=null;state.creativeError='';
  if(rerender)render();else{document.querySelector('#briefCard')?.remove();const actions=$('#prepActions');if(actions)actions.hidden=false}
}

function creativeSetAttachmentKind(index,kind){
  if(!state.attachments[index])return;
  state.attachments[index].kind=kind;creativeInvalidateBrief(false);
}

function creativeRemoveAttachment(index){state.attachments.splice(index,1);creativeInvalidateBrief(true)}

function creativeAttachFiles(files){
  state.draft=$('#creativePrompt')?.value??state.draft;
  const available=Math.max(0,4-state.attachments.length);
  if(files.length>available)toast('Use no máximo 4 imagens por arte.');
  for(const [index,file] of [...files].slice(0,available).entries()){
    if(!/^image\/(png|jpeg|webp)$/.test(file.type)){toast('Use PNG, JPG ou WebP.');continue}
    if(file.size>10*1024*1024){toast('Cada imagem deve ter no máximo 10 MB.');continue}
    const kind=state.attachments.length+index?'logo':'referência',reader=new FileReader();
    reader.onload=()=>{state.attachments.push({name:file.name,kind,data:reader.result});creativeInvalidateBrief(true)};
    reader.readAsDataURL(file);
  }
}

function creativePasteImage(event){
  event.preventDefault();
  const files=[...event.clipboardData.items].filter(item=>item.type.startsWith('image/')).map(item=>item.getAsFile()).filter(Boolean);
  if(!files.length)return toast('Copie uma imagem e pressione Ctrl + V nesta área.');
  creativeAttachFiles(files);
}

async function creativePrepare(){
  const prompt=$('#creativePrompt')?.value.trim()||'';state.draft=prompt;state.creativeError='';
  if(prompt.length<8)return toast('Descreva a arte que deseja criar.');
  if(!state.attachments.length)return toast('Adicione uma referência ou logo.');
  const button=$('#prepareBtn');button.disabled=true;button.textContent='Analisando pedido…';
  try{state.briefing=await api('/api/briefing','POST',{prompt,format:state.format,images:state.attachments});render()}
  catch(error){state.creativeError=error.message;render()}
}

function creativeUseSuggestion(field){
  const value=state.briefing?.[`suggested_${field}`];if(!value)return;
  state.briefing[field]=value;
  const input=document.querySelector(`[data-brief="${field}"]`);if(input)input.value=value;
  toast('Sugestão adicionada. Revise antes de gerar.');
}

function creativeDiscardBrief(){state.briefing=null;render()}

async function creativeGenerate(withBrief){
  const prompt=$('#creativePrompt')?.value.trim()||'';state.draft=prompt;state.creativeError='';
  if(!prompt)return toast('Escreva o pedido para a arte.');
  if(!state.attachments.length)return toast('Adicione uma referência ou logo.');
  const briefing=withBrief?state.briefing:null;if(withBrief&&!briefing)return toast('Prepare o briefing primeiro.');
  const button=withBrief?$('#generateBtn'):$('#directBtn');button.disabled=true;button.textContent='Gerando arte…';
  try{
    const art=await api('/api/generate','POST',{prompt,format:state.format,images:state.attachments,briefing});
    state.generations.unshift(art);state.activeGenerationId=art.id;state.attachments=[];state.draft='';state.briefing=null;
    render();creativeReview(art.id);
  }catch(error){state.creativeError=error.message;render()}
}

function creativeSelectArt(id){state.activeGenerationId=id;state.editing=null;state.editRect=null;render()}
function creativeStartEdit(id){const art=state.generations.find(item=>item.id===id);if(!art)return toast('Arte não encontrada.');state.activeGenerationId=id;state.editing=art;state.editRect=null;render()}
function creativeCancelEdit(){state.editing=null;state.editRect=null;render()}

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
  const request=$('#editRequest')?.value.trim()||'';if(request.length<4)return toast('Descreva a alteração desejada.');
  const button=$('#editBtn');button.disabled=true;button.textContent='Criando nova versão…';
  try{
    const art=await api('/api/generate/edit','POST',{generation_id:state.editing.id,request,mask:creativeMaskData()});
    state.generations.unshift(art);state.activeGenerationId=art.id;state.editing=null;state.editRect=null;render();creativeReview(art.id);
  }catch(error){button.disabled=false;button.textContent='Gerar nova versão';toast(error.message)}
}

async function creativeAdapt(id,target,button){
  if(button){button.disabled=true;button.textContent='Adaptando…'}
  try{const art=await api('/api/generate/adapt','POST',{generation_id:id,target_format:target});state.generations.unshift(art);state.activeGenerationId=art.id;render();creativeReview(art.id)}
  catch(error){toast(error.message);if(button){button.disabled=false;button.textContent='Tentar novamente'}}
}

async function creativeReview(id){
  const art=state.generations.find(item=>item.id===id);if(!art||art.review?.status)return;
  state.reviewLoadingId=id;state.reviewErrorId=null;render();
  try{art.review=await api('/api/generate/review','POST',{generation_id:id})}
  catch(error){state.reviewErrorId=id;state.reviewError=error.message}
  finally{state.reviewLoadingId=null;render()}
}
