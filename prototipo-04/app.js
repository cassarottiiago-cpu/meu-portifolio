(() => {
'use strict';
// Iago Cassarotti — Creative Developer. Sem dependências; os textos vêm do HTML (português ou inglês).
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const fine=matchMedia('(pointer:fine)');
const motion=()=>!reduce.matches;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
// Franjas de cor da "falha de sinal", usadas na troca dos nomes e na vinheta.
const fringe=px=>'drop-shadow('+(-px)+'px 0 0 rgba(0,190,255,.6)) drop-shadow('+px+'px 0 0 rgba(255,32,96,.5))';
// Trepidação em passos (sem interpolar): a amplitude vai de "from" a "to".
const jitterFrames=(from,to,steps=10,spread=1)=>Array.from({length:steps+1},(_,k)=>{const t=k/steps,amp=from+(to-from)*t;return {transform:'translateX('+((Math.random()*2-1)*amp*spread).toFixed(1)+'px)',offset:t,easing:'steps(1,jump-end)'};});

// Ponteiro compartilhado: olhos dos botões, olhos nos "O" e brilho do campo de caracteres.
const pointer={x:innerWidth*.5,y:innerHeight*.8,moved:0};
const pointerHooks=new Set();
addEventListener('pointermove',event=>{pointer.moved=performance.now();if(event.pointerType==='touch')return;pointer.x=event.clientX;pointer.y=event.clientY;pointer.moved=performance.now();pointerHooks.forEach(hook=>hook());},{passive:true});
document.addEventListener('mouseleave',()=>{pointer.x=innerWidth*.5;pointer.y=innerHeight*.9;pointerHooks.forEach(hook=>hook());});

// ——— Projetos selecionados: uma ficha acompanha a rolagem; o documento mantém a rolagem nativa ———
const stage=document.querySelector('.work-continuous');
if(stage){
 const panels=[...stage.querySelectorAll('.project-story')],gallery=stage.querySelector('.work-panels');
 const layout=document.createElement('div'),rail=document.createElement('aside');
 layout.className='following-layout';rail.className='following-project';
 rail.setAttribute('aria-label',stage.dataset.railLabel||'');
 gallery.before(layout);layout.append(rail,gallery);
 rail.innerHTML='<div class="following-title" aria-hidden="true"><span></span></div><p class="following-description"></p>';
 const title=rail.querySelector('span'),description=rail.querySelector('p');
 const link=panels[0].querySelector('.panel-heading a').cloneNode(true),viewLabel=link.getAttribute('aria-label');rail.append(link);
 let active=-1,displayed=-1,frame=0,positions=[],captionHeight=120,visible=true,transitionId=0,signal=null;
 const records=panels.map(panel=>({id:panel.dataset.project,name:panel.querySelector('h3').textContent,description:panel.querySelector('.panel-heading p').textContent,href:panel.querySelector('.panel-heading a').href}));
 panels.forEach(panel=>panel.querySelector('.panel-heading a').tabIndex=-1);
 stage.dataset.following='true';
 function settleTitle(){transitionId++;signal?.cancel();signal=null;title.style.removeProperty('visibility');}
 function showProject(index){
  const project=records[index];displayed=index;title.textContent=project.name;
  description.textContent=project.description;link.href=project.href;
  link.setAttribute('aria-label',viewLabel+' '+project.name);rail.dataset.active=project.id;
 }
 // Falha de sinal: o nome perde a sintonia (fatias deslocadas, franjas de cor, estática de caracteres) e volta nítido.
 const NOISE=['#','=',':','▮','+','/','■','%'];
 const scramble=text=>[...text].map(letter=>letter===' '?' ':NOISE[Math.floor(Math.random()*NOISE.length)]).join('');
 function glitchTo(index){
  const from=records[displayed].name,to=records[index].name,id=++transitionId,holder=title.parentElement;
  const timers=[],anims=[],layers=[];
  const later=(ms,fn)=>timers.push(setTimeout(()=>{if(id===transitionId)fn();},ms));
  const mount=element=>{layers.push(element);holder.append(element);return element;};
  const bands=text=>{
   const layer=document.createElement('div');layer.className='signal-layer';layer.setAttribute('aria-hidden','true');
   for(let b=0;b<5;b++){
    const band=document.createElement('div'),span=document.createElement('span');
    band.className='signal-band';band.style.clipPath='inset('+Math.max(0,b*20-.6)+'% 0 '+Math.max(0,(4-b)*20-.6)+'% 0)';span.textContent=text;band.append(span);layer.append(band);
   }
   return mount(layer);
  };
  // Cada fatia salta para uma posição nova a cada quadro, com amplitude que sobe ou desce.
  const shake=(layer,strong,weak,duration)=>[...layer.children].forEach((band,i)=>anims.push(band.animate(jitterFrames(strong,weak,9,.45+i%3*.4),{duration,fill:'both'})));
  const split=(layer,a,b,duration)=>anims.push(layer.animate([{filter:fringe(a)},{filter:fringe(b)}],{duration,fill:'both'}));
  signal={cancel(){timers.forEach(clearTimeout);anims.forEach(animation=>animation.cancel());layers.forEach(layer=>layer.remove());}};
  title.style.visibility='hidden';
  if(!fine.matches)navigator.vibrate?.([14,40,10]); // no celular a troca também dá um tranco na mão
  // 0–200 ms: o nome antigo perde o sinal.
  const before=bands(from);shake(before,0,15,210);split(before,0,4,210);
  // 200–290 ms: estática de caracteres do próprio portfólio e troca do texto por trás dela.
  const noise=document.createElement('div');noise.className='signal-noise';noise.setAttribute('aria-hidden','true');
  [200,232,262].forEach((ms,k)=>later(ms,()=>{
   if(k===0){before.remove();mount(noise);showProject(index);}
   noise.textContent=scramble(k<2?from:to);
  }));
  // 290–620 ms: o novo nome entra fora de sintonia e assenta.
  later(290,()=>{noise.remove();const after=bands(to);shake(after,14,0,320);split(after,4,0,320);});
  anims.push(description.animate([{opacity:.08,offset:0,easing:'steps(1,jump-end)'},{opacity:.85,offset:.25,easing:'steps(1,jump-end)'},{opacity:.2,offset:.45,easing:'steps(1,jump-end)'},{opacity:1,offset:.6},{opacity:1,offset:1}],{duration:320,delay:190}));
  later(630,()=>{settleTitle();if(active!==displayed)transitionTo(active);});
 }
 function transitionTo(index){
  if(signal||index===displayed)return; // termina a falha atual e só então segue para o último alvo da rolagem
  if(!motion()||displayed<0||!visible||document.hidden){settleTitle();showProject(index);return;}
  glitchTo(index);
 }
 function update(){
  frame=0;
  const readingLine=scrollY+(innerWidth<=700?captionHeight+32:innerHeight*.38);
  let next=0;
  positions.forEach((top,index)=>{if(top<=readingLine)next=index;});
  if(next===active)return;
  active=next;transitionTo(next);
 }
 function schedule(){if(visible&&!frame)frame=requestAnimationFrame(update);}
 function measure(){if(signal){settleTitle();showProject(active);}positions=panels.map(panel=>panel.getBoundingClientRect().top+scrollY);captionHeight=rail.offsetHeight;update();}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',measure);
 addEventListener('pageshow',measure);reduce.addEventListener('change',()=>{settleTitle();if(active>=0)showProject(active);schedule();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){settleTitle();if(active>=0)showProject(active);}});
 new ResizeObserver(measure).observe(gallery);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)schedule();},{rootMargin:'120px'}).observe(stage);
 document.fonts.ready.then(measure);measure();
}

// ——— Abertura: entrada das palavras e campo de caracteres do monograma IC ———
const intro=document.querySelector('.intro'),canvas=document.querySelector('#brand-canvas');
if(intro){
 let entry=[];
 const finishEntry=()=>{entry.forEach(animation=>animation.cancel());entry=[];};
 document.fonts.ready.then(()=>{
  if(!motion()||scrollY>100||new URLSearchParams(location.search).has('replay'))return; // vindo da vinheta, as palavras já estão no lugar
  intro.querySelectorAll('.type-full>span').forEach((line,index)=>{
   entry.push(line.animate([{transform:'translateX('+(index?105:-105)+'%)'},{transform:'translateX(0)'}],{duration:1050,delay:180+index*180,easing:'cubic-bezier(.76,0,.24,1)',fill:'backwards'}));
  });
  intro.querySelectorAll('.type-echo,.type-fragment').forEach((strip,index)=>{
   const offset=innerWidth*(index%2?-.65:.65);
   entry.push(strip.animate([{transform:'translateX('+offset+'px)',clipPath:'inset(0 50% 0 50%)'},{transform:'translateX(0)',clipPath:'inset(0)'}],{duration:1100,delay:index*85,easing:'cubic-bezier(.76,0,.24,1)',fill:'backwards'}));
  });
 });
 addEventListener('scroll',()=>{if(scrollY>100)finishEntry();},{passive:true});
 reduce.addEventListener('change',finishEntry);
}
if(intro&&canvas){
 const ctx=canvas.getContext('2d',{alpha:true});
 if(ctx){
  const source=document.createElement('canvas'),mask=source.getContext('2d',{willReadFrequently:true});
  source.width=300;source.height=220;
  let samples=[],bounds={cx:150,cy:110,w:300,h:220},typeBottom=0,width=1,height=1,introTop=0,frame=0,visible=true,px=0,py=0,targetX=0,targetY=0,scroll=0,targetScroll=0,previous=0;
  let assembly=1,assemblyStart=null,assembling=false,heat=0,inside=false,stampTime=0;
  const atlases=new Map();
  function build(){
   mask.clearRect(0,0,300,220);mask.fillStyle='#000';mask.textBaseline='alphabetic';mask.font='800 220px DM,Arial';mask.fillText('IC',12,183);
   const pixels=mask.getImageData(0,0,300,220).data;samples=[];
   for(let y=0;y<220;y+=5)for(let x=0;x<300;x+=4){const alpha=pixels[(y*300+x)*4+3]/255;if(alpha>.2){const seed=((x*17+y*29)%101)/101;samples.push({x,y,seed,wave:Math.sin(y*.15),glyph:seed<.26?0:seed<.52?1:seed<.76?2:3});}}
   const xs=samples.map(p=>p.x),ys=samples.map(p=>p.y),x0=Math.min(...xs),x1=Math.max(...xs)+5,y0=Math.min(...ys),y1=Math.max(...ys)+5;
   bounds={cx:(x0+x1)/2,cy:(y0+y1)/2,w:x1-x0,h:y1-y0};
  }
  function size(){
   const rect=intro.getBoundingClientRect();width=rect.width;height=rect.height;typeBottom=(intro.querySelector('.intro-type')?.getBoundingClientRect().bottom??0)-rect.top;introTop=rect.top+scrollY;const dpr=Math.min(2,devicePixelRatio||1);atlases.clear();
   canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);schedule();
  }
  // Os quatro caracteres (bloco, =, #, :) em duas cores são desenhados uma vez numa folha e copiados.
  function atlasFor(scale){
   if(atlases.has(scale))return atlases.get(scale);
   const dpr=Math.min(2,devicePixelRatio||1),side=Math.ceil(Math.max(5,5.6*scale)*2),tile=Math.ceil(side*dpr),sheet=document.createElement('canvas');
   sheet.width=tile*8;sheet.height=tile;
   const pen=sheet.getContext('2d');pen.scale(dpr,dpr);pen.textBaseline='top';pen.font=Math.max(5,5.6*scale)+'px monospace';
   for(let color=0;color<2;color++)for(let glyph=0;glyph<4;glyph++){
    pen.fillStyle=color?'#bd291f':'#25231f';const x=(color*4+glyph)*tile/dpr;
    if(glyph===0)pen.fillRect(x,0,4*scale*.86,scale*3.9);else pen.fillText(['','=','#',':'][glyph],x,0);
   }
   const atlas={sheet,tile,side:tile/dpr};atlases.set(scale,atlas);return atlas;
  }
  function stamp(cx,cy,scale,tone){
   const atlas=atlasFor(scale);
   for(const p of samples){
    if(scroll>p.seed*.9+.1)continue;
    const x=cx+(p.x-150)*scale,y=cy+(p.y-110)*scale;
    const distance=Math.abs(y-(py*.5+.5)*height),influence=Math.max(0,1-distance/(height*.2));
    const shift=px*influence*60+p.wave*scroll*35,color=tone!==0&&p.seed>.58?1:0;
    let glyph=p.glyph;
    if(heat>.02){const gx=x+shift-(px*.5+.5)*width,gy=y-(py*.5+.5)*height,radius=height*.19*heat;if(gx*gx+gy*gy<radius*radius)glyph=(p.glyph+1+Math.floor(stampTime/85+p.seed*11))%4;}
    const formation=1-Math.pow(1-clamp((assembly-p.seed*.18)/.82),3),spread=1-formation;
    ctx.globalAlpha=formation;
    ctx.drawImage(atlas.sheet,(color*4+glyph)*atlas.tile,0,atlas.tile,atlas.tile,x+shift+spread*(p.wave*width*.45),y+spread*(p.seed-.5)*height*.65,atlas.side,atlas.side);
   }
   ctx.globalAlpha=1;
  }
  function draw(time){
   frame=0;if(!visible||document.hidden)return;
   stampTime=time;
   if(assembling){if(assemblyStart===null)assemblyStart=time;assembly=clamp((time-assemblyStart)/1450);if(assembly===1)assembling=false;}
   const dt=previous?Math.min(45,time-previous):16;previous=time;
   const ease=motion()?1-Math.exp(-dt/75):1;
   px+=(targetX-px)*ease;py+=(targetY-py)*ease;scroll+=(targetScroll-scroll)*ease;
   ctx.clearRect(0,0,width,height);
   const compact=width<700,scale=compact?width/330:Math.min(width/460,height/250);
   // Celular: um monograma IC inteiro sob o título; computador: dois, sangrando pelas bordas.
   // Celular: o IC centralizado no espaço entre o título e o fim da tela, do maior tamanho que couber.
   if(compact){const room=Math.max(120,height-typeBottom-20),s=Math.min((width-36)/bounds.w,(room-24)/bounds.h);stamp(width*.5+(150-bounds.cx)*s,typeBottom+10+room/2+(110-bounds.cy)*s,s,1);}
   else{stamp(width*.83,height*.33,scale,0);stamp(width*.08,height*.78,scale*.85,1);}
   // Perto do ponteiro os caracteres trocam de forma enquanto ele se mexe.
   const awake=inside&&motion()&&performance.now()-pointer.moved<520;
   heat+=((awake?1:0)-heat)*Math.min(1,dt/110);if(heat<.015&&!awake)heat=0;
   intro.style.setProperty('--intro-scroll',(motion()?scroll:0).toFixed(3));
   if(assembling||heat>0||awake||Math.abs(targetX-px)+Math.abs(targetY-py)+Math.abs(targetScroll-scroll)>.001)frame=requestAnimationFrame(draw);else previous=0;
  }
  function schedule(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(draw);}
  function onScroll(){if(scrollY>100||!motion()){assembling=false;assembly=1;}if(!visible)return;targetScroll=motion()?clamp((scrollY-introTop)/Math.max(1,height)):0;schedule();}
  intro.addEventListener('pointermove',e=>{if(!motion())return;inside=true;targetX=e.clientX/width*2-1;targetY=(e.clientY-introTop+scrollY)/height*2-1;schedule();},{passive:true});
  intro.addEventListener('pointerleave',()=>{inside=false;targetX=0;targetY=0;schedule();});
  new ResizeObserver(size).observe(intro);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){onScroll();schedule();}else{cancelAnimationFrame(frame);frame=0;previous=0;}},{rootMargin:'40px'}).observe(intro);
  addEventListener('scroll',onScroll,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;assembling=false;assembly=1;}else schedule();});
  reduce.addEventListener('change',()=>{targetX=targetY=0;onScroll();});
  document.fonts.ready.then(()=>{build();assembling=motion()&&scrollY<100;assembly=assembling?0:1;size();});
 }
}

// ——— Olhos nos "O": a pupila segue o ponteiro, como nos olhos do botão do WhatsApp ———
function letterEyes(line,host){
 if(!line)return;
 const texts=[],walker=document.createTreeWalker(line,NodeFilter.SHOW_TEXT);while(walker.nextNode())texts.push(walker.currentNode);
 const letters=texts.flatMap(node=>[...node.textContent].map((letter,index)=>letter==='O'?{node,index}:null).filter(Boolean));
 if(!letters.length)return;
 const holder=document.createElement('span');holder.className='o-eyes';holder.setAttribute('aria-hidden','true');line.append(holder);
 const eyes=letters.map(({node,index})=>{const eye=document.createElement('span'),pupil=document.createElement('i');eye.className='o-eye';pupil.className='o-pupil';eye.append(pupil);holder.append(eye);return {node,index,eye,pupil,geo:null,lx:0,ly:0};});
 let hole=null,visible=true,frame=0,idleX=0,idleY=.35;
 // Proporções do vazado do "O" na fonte carregada, medidas uma vez em canvas.
 function holeRatios(style){
  const size=240,sheet=document.createElement('canvas');sheet.width=sheet.height=420;
  const g=sheet.getContext('2d',{willReadFrequently:true});
  g.font=style.fontWeight+' '+size+'px '+style.fontFamily;g.textBaseline='alphabetic';g.fillStyle='#000';g.fillText('O',90,310);
  const {data}=g.getImageData(0,0,420,420),ink=(x,y)=>data[(y*420+x)*4+3]>128;
  let x0=420,x1=0,y0=420,y1=0;
  for(let y=0;y<420;y++)for(let x=0;x<420;x++)if(ink(x,y)){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
  if(x1<=x0)return null;
  const cx=(x0+x1)>>1,cy=(y0+y1)>>1;let l=cx,r=cx,t=cy,bt=cy;
  while(l>0&&!ink(l,cy))l--;while(r<419&&!ink(r,cy))r++;while(t>0&&!ink(cx,t))t--;while(bt<419&&!ink(cx,bt))bt++;
  return {cx:((l+r)/2-x0)/(x1-x0),cy:((t+bt)/2-y0)/(y1-y0),w:(r-l)/(x1-x0),h:(bt-t)/(y1-y0)};
 }
 function measure(){
  const style=getComputedStyle(line),size=parseFloat(style.fontSize);
  hole=hole||holeRatios(style);if(!hole)return;
  const box=line.getBoundingClientRect();
  const pen=document.createElement('canvas').getContext('2d');pen.font=style.fontWeight+' '+size+'px '+style.fontFamily;
  const m=pen.measureText('O'),inkW=m.actualBoundingBoxLeft+m.actualBoundingBoxRight,inkH=m.actualBoundingBoxAscent+m.actualBoundingBoxDescent;
  const holeW=hole.w*inkW,holeH=hole.h*inkH,pd=Math.min(holeW,holeH)*.5;
  for(const item of eyes){
   const range=document.createRange();range.setStart(item.node,item.index);range.setEnd(item.node,item.index+1);
   // O retângulo do caractere começa na altura de ascendente da fonte; dali se chega à linha de base de cada linha.
   const glyph=range.getBoundingClientRect(),baseline=glyph.top+m.fontBoundingBoxAscent;
   const centerX=glyph.left-m.actualBoundingBoxLeft+hole.cx*inkW-box.left,centerY=baseline-m.actualBoundingBoxAscent+hole.cy*inkH-box.top;
   item.geo={size,rx:Math.max(0,holeW/2-pd/2-size*.008),ry:Math.max(0,holeH/2-pd/2-size*.008)};
   const set=(name,value)=>item.eye.style.setProperty(name,value.toFixed(1)+'px');
   set('--ex',centerX);set('--ey',centerY);set('--ew',holeW);set('--eh',holeH);set('--pd',pd);
  }
  schedule();
 }
 function step(){
  frame=0;let moving=false;
  for(const item of eyes){
   const geo=item.geo;if(!geo)continue;
   const box=item.eye.getBoundingClientRect(),cx=box.left+box.width/2,cy=box.top+box.height/2;
   let tx,ty;
   if(motion()&&fine.matches){
    const dx=pointer.x-cx,dy=pointer.y-cy,d=Math.hypot(dx,dy)||1,reach=Math.min(1,d/(geo.size*.75));
    tx=dx/d*reach*geo.rx;ty=dy/d*reach*geo.ry;
   }else{tx=motion()?idleX*geo.rx:0;ty=motion()?idleY*geo.ry:geo.ry*.35;}
   item.lx+=(tx-item.lx)*.24;item.ly+=(ty-item.ly)*.24;
   item.eye.style.setProperty('--lx',item.lx.toFixed(2)+'px');item.eye.style.setProperty('--ly',item.ly.toFixed(2)+'px');
   if(Math.abs(tx-item.lx)+Math.abs(ty-item.ly)>.05)moving=true;
  }
  if(moving)frame=requestAnimationFrame(step);
 }
 function schedule(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(step);}
 pointerHooks.add(schedule);addEventListener('scroll',schedule,{passive:true});
 // Os olhos só se abrem quando a palavra aparece na tela.
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){host.classList.add('eyes-open');schedule();}}).observe(host);
 new ResizeObserver(()=>document.fonts.ready.then(measure)).observe(host);
 // Piscar de vez em quando; em telas de toque as pupilas passeiam sozinhas.
 (function blink(){if(motion()&&visible&&!document.hidden)eyes.forEach(item=>item.pupil.animate({scale:['1 1','1 .08','1 1']},{duration:170,easing:'ease-in-out'}));setTimeout(blink,3800+Math.random()*3600);})();
 setInterval(()=>{if(motion()&&visible&&!fine.matches){idleX=[-.8,0,.8,.3][Math.floor(Math.random()*4)];idleY=[.35,-.3,.6][Math.floor(Math.random()*3)];schedule();}},2600);
 reduce.addEventListener('change',schedule);
}
if(intro)letterEyes(document.querySelector('.type-developer .type-full>span'),intro);
{const word=document.querySelector('.thanks-word');if(word)letterEyes(word,word);}

// ——— Entrada do cabeçalho: as réguas se desenham a partir da assinatura e os botões saltam ———
{
 const bar=document.querySelector('.home-nav,.case-nav');
 if(bar&&motion()&&scrollY<=100){
  const rules=[...bar.querySelectorAll('.masthead-rule')],brand=bar.querySelector('.brand-tag'),buttons=[...bar.querySelectorAll('.doodle-link')];
  rules.forEach((rule,i)=>{rule.style.transformOrigin=i?'0 50%':'100% 50%';rule.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:950,delay:160,easing:'cubic-bezier(.22,.8,.25,1)',fill:'backwards'});});
  brand?.animate([{opacity:0,transform:'translateY(9px)'},{opacity:1,transform:'none'}],{duration:720,delay:90,easing:'cubic-bezier(.2,.8,.3,1)',fill:'backwards'});
  buttons.forEach((button,i)=>button.animate([{opacity:0,transform:'translateY(-8px) scale(.62)'},{opacity:1,transform:'none'}],{duration:680,delay:260+i*120,easing:'cubic-bezier(.3,1.55,.5,1)',fill:'backwards'}));
 }
}

// ——— Entrada dos títulos: um motor, um gesto por página (variáveis --enter-* no CSS) ———
// Só títulos e frases de abertura; imagens e parágrafos continuam parados. Cada elemento entra uma única vez.
if(document.querySelector('[data-enter]')){
 const targets=[...document.querySelectorAll('[data-enter]')];
 const cs=getComputedStyle(document.body),num=name=>parseFloat(cs.getPropertyValue(name))||0;
 const preset={dur:num('--enter-dur')||900,ease:(cs.getPropertyValue('--enter-ease')||'').trim()||'cubic-bezier(.16,1,.3,1)',y:num('--enter-y'),x:num('--enter-x'),blur:num('--enter-blur'),scale:num('--enter-scale')||1,rot:num('--enter-rot'),skew:num('--enter-skew')};
 const strength={title:1,line:.7,head:.85,fade:.4},order={fade:0,title:110,line:330};
 const finishAll=()=>targets.forEach(el=>{el.classList.remove('enter-armed');el.classList.add('enter-done');});
 function enter(el,delay){
  if(el.classList.contains('enter-done'))return;
  const kind=el.dataset.enter,k=strength[kind]||.7,size=parseFloat(getComputedStyle(el).fontSize)||16;
  const reach=kind==='title'?72:44,ty=clamp(preset.y*size*k,-reach,reach),tx=clamp(preset.x*size*k,-reach,reach);
  if(preset.rot)el.style.transformOrigin='0 100%';
  el.animate([
   {opacity:0,transform:'translate('+tx.toFixed(1)+'px,'+ty.toFixed(1)+'px) scale('+(1-(1-preset.scale)*k).toFixed(3)+') rotate('+(preset.rot*k).toFixed(2)+'deg) skewX('+(preset.skew*k).toFixed(2)+'deg)',filter:'blur('+(preset.blur*k).toFixed(1)+'px)'},
   {opacity:1,transform:'none',filter:'none'}
  ],{duration:preset.dur*(kind==='fade'?.75:kind==='head'?.92:1),delay,easing:preset.ease,fill:'backwards'});
  el.classList.remove('enter-armed');el.classList.add('enter-done');
 }
 // Espera a fonte e a transição de página, com teto de tempo, para nunca animar texto com a fonte errada.
 const fontsReady=Promise.race([document.fonts.ready,wait(1500)]);
 const pageReady=Promise.race([Promise.resolve(window.__pageTransition?.finished).catch(()=>{}),wait(650)]);
 Promise.all([fontsReady,pageReady]).then(()=>{
  if(!motion()){finishAll();return;}
  const fold=innerHeight*.94,waiting=[];
  targets.forEach(el=>el.classList.add('enter-armed'));
  let step=0;
  targets.forEach(el=>{
   const rect=el.getBoundingClientRect();
   if(rect.bottom<=0){el.classList.remove('enter-armed');el.classList.add('enter-done');}
   else if(rect.top<fold)enter(el,order[el.dataset.enter]??(120+(step++)*90));
   else waiting.push(el);
  });
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;observer.unobserve(entry.target);enter(entry.target,0);}},{rootMargin:'0px 0px -13% 0px'});
  waiting.forEach(el=>observer.observe(el));
  reduce.addEventListener('change',()=>{observer.disconnect();finishAll();});
 });
 addEventListener('pageshow',event=>{if(event.persisted)finishAll();});
}

// ——— Rodapé da home: o convite se repete por onde o ponteiro passa ———
const invitation=document.querySelector('.end-invitation');
if(invitation){
 const field=invitation.querySelector('.clone-field'),copy=invitation.querySelector('.invitation-link')?.dataset.copy||'';
 let lastX=null,lastY=null;
 const clear=()=>{field.replaceChildren();lastX=lastY=null;};
 invitation.addEventListener('pointermove',event=>{
  if(!motion())return;
  const r=invitation.getBoundingClientRect(),x=event.clientX-r.left,y=event.clientY-r.top;
  if(lastX!==null&&Math.hypot(x-lastX,y-lastY)<(event.pointerType==='touch'?90:147))return;
  lastX=x;lastY=y;
  const label=document.createElement('span');label.className='invitation-copy';label.textContent=copy;
  label.style.left=clamp(x-100,-80,r.width-120)+'px';label.style.top=clamp(y-40,0,r.height-70)+'px';
  field.append(label);setTimeout(()=>label.remove(),1500);
  while(field.childElementCount>8)field.firstElementChild.remove();
 },{passive:true});
 invitation.addEventListener('pointerleave',clear);
 reduce.addEventListener('change',clear);
}

// ——— Ampliação das capturas: versões leves para ajustar à tela, arquivo inteiro no tamanho real ———
const viewer=document.querySelector('.print-viewer');
if(viewer){
 const area=viewer.querySelector('.print-canvas'),sizing=viewer.querySelector('[data-size]');let origin=null,overflow='',image=null,sources='';
 const label=actual=>{sizing.firstChild.textContent=(actual?sizing.dataset.fit:sizing.dataset.actual)+' ';sizing.setAttribute('aria-pressed',String(actual));};
 document.addEventListener('click',event=>{
  const link=event.target.closest('[data-print]');
  if(!link||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();origin=link;
  const source=link.querySelector('img');
  image=new Image();image.decoding='async';image.alt=source?source.alt:area.dataset.fullAlt;
  sources=source?source.getAttribute('srcset'):link.dataset.srcset||'';
  if(sources){image.srcset=sources;image.sizes=link.hasAttribute('data-full')?'min(1100px, 100vw)':'100vw';}
  image.src=link.href;
  area.replaceChildren(image);viewer.dataset.size='fit';viewer.dataset.full=String(link.hasAttribute('data-full'));label(false);
  overflow=document.body.style.overflow;document.body.style.overflow='hidden';viewer.showModal();area.scrollTo(0,0);
 });
 sizing.addEventListener('click',()=>{
  const actual=viewer.dataset.size!=='actual';viewer.dataset.size=actual?'actual':'fit';label(actual);
  // No tamanho real vale o arquivo inteiro; ao voltar, o navegador escolhe de novo a versão leve.
  if(image){if(actual)image.removeAttribute('srcset');else if(sources)image.srcset=sources;}
  area.scrollTo(0,0);
 });
 viewer.querySelector('[data-close]').addEventListener('click',()=>viewer.close());
 viewer.addEventListener('close',()=>{document.body.style.overflow=overflow;origin?.focus({preventScroll:true});});
}

// ——— Fechamento: copiar o e-mail e vinheta de volta ao início ———
document.querySelectorAll('.copy-email').forEach(button=>{
 const labelEl=button.querySelector('.copy-label'),idle=labelEl.textContent;let timer=0;
 button.addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(button.dataset.copy);}
  catch{const range=document.createRange();range.selectNodeContents(button.querySelector('.copy-address'));getSelection().removeAllRanges();getSelection().addRange(range);return;}
  labelEl.textContent=button.dataset.copied;button.classList.add('is-copied');clearTimeout(timer);
  timer=setTimeout(()=>{labelEl.textContent=idle;button.classList.remove('is-copied');},2200);
 });
});
if(document.body.classList.contains('closing')){
 let leaving=false;
 const returnLink=document.querySelector('.closing-bottom a'),word=document.querySelector('.thanks-word')?.textContent.trim()||'';
 // Mesma composição da abertura: o último quadro da vinheta é o primeiro quadro da home, sem corte.
 const HERO_TYPE='<h1 class="intro-type"><span class="type-group type-creative"><span class="type-echo"><span>CREATIVE</span></span><span class="type-full"><span>CREATIVE</span></span><span class="type-fragment"><span>CREATIVE</span></span></span><span class="type-group type-developer"><span class="type-full"><span>DEVELOPER</span></span><span class="type-echo"><span>DEVELOPER</span></span><span class="type-fragment"><span>DEVELOPER</span></span></span></h1>';
 async function returnToOpening(){
  if(leaving)return;leaving=true;
  if(motion()){
   const curtain=document.createElement('div');curtain.className='replay-curtain';curtain.setAttribute('aria-hidden','true');
   curtain.innerHTML='<div class="replay-paper"><section class="intro replay-hero"><div class="replay-spacer"></div>'+HERO_TYPE+'</section></div><div class="replay-strips">'+Array.from({length:5},()=>'<div><span></span></div>').join('')+'</div>';
   curtain.querySelectorAll('.replay-strips span').forEach(span=>span.textContent=word);
   document.body.append(curtain);
   const paper=curtain.querySelector('.replay-paper'),strips=[...curtain.querySelectorAll('.replay-strips>div')],words=[...curtain.querySelectorAll('.replay-strips span')];
   const hero=curtain.querySelector('.replay-hero .intro-type'),parts=[...curtain.querySelectorAll('.replay-hero .type-group>span')];
   paper.style.opacity='0';
   // 1) as faixas vermelhas cobrem a página
   await Promise.all(strips.map((strip,i)=>strip.animate([{transform:'translateX('+(i%2?-105:105)+'%)'},{transform:'translateX(0)'}],{duration:520,delay:i*55,easing:'cubic-bezier(.76,0,.24,1)',fill:'both'}).finished));
   paper.style.opacity='1';
   // 2) o agradecimento perde o sinal (fatias tremendo, franjas de cor) e sai
   words.forEach((span,i)=>{
    const direction=i%2?1:-1,list=jitterFrames(0,34,8).slice(0,8);
    list[list.length-1].easing='cubic-bezier(.7,0,.3,1)';
    span.animate([...list.map((frame,k)=>({...frame,offset:k/8*.62})),{transform:'translateX('+direction*115+'%)',offset:1}],{duration:820,delay:i*35,fill:'forwards'});
    span.animate([{filter:fringe(0)},{filter:fringe(7),offset:.6},{filter:fringe(7)}],{duration:820,delay:i*35,fill:'forwards'});
   });
   await wait(560);
   // 3) as faixas saem e a abertura sintoniza por baixo, como um sinal voltando
   strips.forEach((strip,i)=>strip.animate([{transform:'translateX(0)'},{transform:'translateX('+(i%2?105:-105)+'%)'}],{duration:560,delay:i*55,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'}));
   const shift=innerWidth*.05;
   parts.forEach((part,i)=>part.animate(jitterFrames(shift*(.7+i%3*.3),0),{duration:760,delay:80+i*45,fill:'both'}));
   hero.animate([{filter:fringe(8)},{filter:fringe(0)}],{duration:760,delay:80,easing:'ease-out',fill:'both'});
   await wait(1250);
  }
  location.replace(returnLink.href);
 }
 returnLink?.addEventListener('click',event=>{if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();returnToOpening();});
}

// ——— Botões doodle ———
// Work e WhatsApp reproduzem o vídeo de referência (medido quadro a quadro, botão de 88 px de altura no vídeo).
const DOODLE={cycle:633,first:453,settle:170,breakAt:5,spread:2};
// Martelo: [ms desde a batida, graus]. Descanso, armação para a esquerda, pausa e golpe.
const HAMMER=[[0,90],[33,90],[67,29],[100,15],[133,6],[150,3],[250,3],[283,-6],[317,-9.5],[350,-14.5],[383,-16.5],[400,-17.5],[533,-17.5],[566,-12],[600,22],[633,90]];
// Deslocamento acumulado de cada letra por batida (x, y em px do vídeo; rotação em graus) e tranco no impacto.
const DRIFT=[[1.5,5.5,4],[.6,6.8,5],[-.5,7.4,5],[3.7,7.7,6]];
const JOLT=[10,12,13,15];
const noise=(a,b)=>{const s=Math.sin(a*12.9898+b*78.233)*43758.5453;return s-Math.floor(s);};
const pose=p=>'translate('+p.x.toFixed(2)+'px,'+p.y.toFixed(2)+'px) rotate('+p.r.toFixed(2)+'deg)';
const buttonResets=new Map();
const buttonObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(!entry.isIntersecting)buttonResets.get(entry.target)?.();});
// Olhos do WhatsApp: as pupilas seguem o ponteiro pela página inteira, com suavização.
const eyeItems=new Set(),idleLook={x:0,y:4.2};
let eyeFrame=0;
function updateEyes(){
 eyeFrame=0;let moving=false;
 for(const item of eyeItems){
  if(!item.visible)continue;
  const box=item.svg.getBoundingClientRect(),scale=box.width/42;
  for(const [side,cx] of [['l',9.6],['r',32.4]]){
   const dx=pointer.x-(box.left+cx*scale),dy=pointer.y-(box.top+21*scale),distance=Math.hypot(dx,dy)||1;
   const follow=motion()&&fine.matches,reach=follow?Math.min(1,distance/(34*scale+18)):0;
   const targetX=follow?dx/distance*reach*3.4:motion()?idleLook.x:0,targetY=follow?dy/distance*reach*9.8:motion()?idleLook.y:4.2;
   const state=item[side];state.x+=(targetX-state.x)*.32;state.y+=(targetY-state.y)*.32;
   if(Math.abs(targetX-state.x)+Math.abs(targetY-state.y)>.02)moving=true;else{state.x=targetX;state.y=targetY;}
   item.link.style.setProperty('--'+side+'x',state.x.toFixed(2)+'px');item.link.style.setProperty('--'+side+'y',state.y.toFixed(2)+'px');
  }
 }
 if(moving)eyeFrame=requestAnimationFrame(updateEyes);
}
const scheduleEyes=()=>{if(!eyeFrame&&eyeItems.size)eyeFrame=requestAnimationFrame(updateEyes);};
pointerHooks.add(scheduleEyes);
addEventListener('scroll',scheduleEyes,{passive:true});
// Sem mouse, os olhos do WhatsApp olham para os lados de vez em quando.
if(!fine.matches)setInterval(()=>{if(!motion()||document.hidden)return;[idleLook.x,idleLook.y]=[[0,4.2],[-3,2],[3,1.5],[-2.5,6],[2.5,-4],[0,-6]][Math.floor(Math.random()*6)];scheduleEyes();},2300);
reduce.addEventListener('change',scheduleEyes);
document.querySelectorAll('.doodle-link').forEach(link=>{
 const letters=[...link.querySelectorAll('.button-letter')],hammer=link.querySelector('.hammer'),chip=link.querySelector('.work-chip'),boomerang=link.querySelector('.boomerang');
 let animations=[],letterMotions=[],strikeTimer=0,throwTimer=0,flight=null,autoplay=false;
 if(link.classList.contains('doodle-chat')){
  const item={link,svg:link.querySelector('.doodle-icon'),visible:false,l:{x:0,y:4.2},r:{x:0,y:4.2}};
  eyeItems.add(item);
  new IntersectionObserver(entries=>{item.visible=entries[0].isIntersecting;if(item.visible)scheduleEyes();}).observe(link);
 }
 function reset(){
  clearTimeout(strikeTimer);clearTimeout(throwTimer);
  if(!animations.length&&!letterMotions.length)return;
  const loose=letters.map(letter=>getComputedStyle(letter).transform),tilt=hammer?getComputedStyle(hammer).transform:'none';
  letterMotions.forEach(a=>a?.cancel());letterMotions=[];animations.forEach(a=>a.cancel());animations=[];
  delete link.dataset.hits;link.classList.remove('is-broken');letters.forEach(letter=>letter.classList.remove('is-out'));
  if(!motion())return;
  // Volta em cerca de 150 ms, como no vídeo, em vez de teleportar; a pílula partida se fecha pela transição do CSS.
  letters.forEach((letter,i)=>{if(loose[i]&&loose[i]!=='none')letter.animate([{transform:loose[i]},{transform:'none'}],{duration:150,easing:'cubic-bezier(.2,.8,.3,1)'});});
  if(hammer&&tilt!=='none')hammer.animate([{transform:tilt},{transform:'rotate(2.5deg)'}],{duration:160,easing:'cubic-bezier(.2,.8,.3,1)'});
 }
 function startWork(){
  const unit=link.offsetHeight/88,began=performance.now();let hits=0;
  const swing=hammer.animate(HAMMER.map(([ms,deg])=>({transform:'rotate('+deg+'deg)',offset:ms/DOODLE.cycle})),{duration:DOODLE.cycle,iterations:Infinity,delay:-180,easing:'linear'});
  animations.push(swing);
  const rest=(n,i)=>{
   const spread=letters.length>1?i/(letters.length-1):0,d=DRIFT[i]||[1.5+2.2*spread,5.5+2.2*spread,4+2*spread],wobble=noise(i,n)*2-1;
   return {x:(d[0]*n*DOODLE.spread+wobble*2.2)*unit,y:d[1]*n*DOODLE.spread*unit,r:d[2]*n*1.2+wobble*1.6};
  };
  function strike(){
   if(!motion()||document.hidden||!link.isConnected){reset();return;}
   hits++;link.dataset.hits=String(hits);
   letters.forEach((letter,i)=>{
    const settled=rest(hits,i),push=(JOLT[i]??12)*(.8+.4*noise(hits,i))*unit,lift=(noise(i,hits)*2-2.4)*unit;
    letterMotions[i]?.cancel();
    // Tranco seco no impacto (fica parado ~170 ms) e assenta na nova posição, sem interpolar, como no vídeo.
    letterMotions[i]=letter.animate([{transform:pose({x:settled.x+push,y:settled.y+lift,r:settled.r-1.5})},{transform:pose(settled)}],{duration:DOODLE.settle,easing:'steps(1,jump-end)',fill:'forwards'});
   });
   setTimeout(markOut,DOODLE.settle+20);
   // O botão sente cada pancada com um tranco curto.
   link.animate([{transform:'none'},{transform:'translate(-.6px,.9px) rotate(-.7deg) scaleY(.982)',offset:.25},{transform:'translate(.3px,0) rotate(.25deg)',offset:.6},{transform:'none'}],{duration:180,easing:'linear'});
   if(hits<DOODLE.breakAt){strikeTimer=setTimeout(strike,Math.max(0,began+DOODLE.first+hits*DOODLE.cycle-performance.now()));return;}
   // Última batida: a pílula se parte na costura, uma lasca cai e o martelo fica deitado sobre a quebra.
   link.classList.add('is-broken');swing.cancel();
   letters.forEach((letter,i)=>{const from=rest(hits,i),to={x:from.x+(i-1.2)*3*unit,y:from.y+(14+noise(i,99)*10)*unit,r:from.r+(noise(99,i)*2-1)*24};letterMotions[i]?.cancel();letterMotions[i]=letter.animate([{transform:pose(from)},{transform:pose(to)}],{duration:460,delay:40+i*35,easing:'cubic-bezier(.45,0,.9,.55)',fill:'forwards'});});
   setTimeout(markOut,300);setTimeout(markOut,640);
   animations.push(hammer.animate([{transform:'rotate(90deg)'},{transform:'rotate(74deg)',offset:.35},{transform:'rotate(90deg)',offset:.7},{transform:'rotate(86deg)'}],{duration:520,easing:'cubic-bezier(.3,.7,.4,1)',fill:'forwards'}));
   if(autoplay){autoplay=false;strikeTimer=setTimeout(reset,2300);}
   if(chip)animations.push(chip.animate([{opacity:1,transform:'none'},{opacity:1,transform:'translate(3px,9px) rotate(70deg)',offset:.5},{opacity:0,transform:'translate(6px,20px) rotate(150deg)'}],{duration:720,easing:'cubic-bezier(.5,0,.8,.6)',fill:'forwards'}));
  }
  strikeTimer=setTimeout(strike,DOODLE.first);
 }
 // Letras cujo centro saiu da pílula passam a escuras (sobre o papel a letra clara sumiria).
 function markOut(){
  const pill=link.getBoundingClientRect();
  letters.forEach(letter=>{const r=letter.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;letter.classList.toggle('is-out',!!link.dataset.hits&&(y>pill.bottom-3||y<pill.top+3||x>pill.right-8||x<pill.left+8));});
 }
 // Voltar: o bumerangue sai girando para a esquerda e volta; ao ser pego, as letras dão um pulinho.
 function throwBoomerang(){
  flight=boomerang.animate([
   {transform:'translate(0,0) rotate(0deg)'},
   {transform:'translate(-30px,-11px) rotate(-260deg)',offset:.22},
   {transform:'translate(-78px,-4px) rotate(-570deg)',offset:.47},
   {transform:'translate(-48px,12px) rotate(-840deg)',offset:.72},
   {transform:'translate(0,0) rotate(-1080deg)'}
  ],{duration:1150,easing:'cubic-bezier(.4,.05,.35,1)'});
  flight.finished.then(()=>{
   flight=null;
   letters.forEach((letter,i)=>letter.animate([{transform:'none'},{transform:'translateY(-3px)',offset:.4},{transform:'none'}],{duration:320,delay:i*26,easing:'cubic-bezier(.3,.7,.4,1)'}));
   if(motion()&&(link.matches(':hover')||link.matches(':focus-visible')))throwTimer=setTimeout(throwBoomerang,650);
  },()=>{flight=null;});
 }
 function animate(){
  reset();if(!motion())return;
  if(hammer&&letters.length)startWork();
  if(boomerang&&!flight)throwBoomerang();
 }
 // Sem mouse (celular), o martelo trabalha sozinho uma vez quando o botão aparece e o botão se recompõe depois da quebra.
 if(hammer&&letters.length&&!matchMedia('(hover:hover)').matches){
  const watch=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)return;watch.disconnect();setTimeout(()=>{if(motion()&&!document.hidden){autoplay=true;animate();}},1300);});
  watch.observe(link);
 }
 link.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')animate();});
 link.addEventListener('focus',()=>{if(link.matches(':focus-visible'))animate();});
 link.addEventListener('pointerleave',reset);link.addEventListener('blur',reset);
 buttonResets.set(link,reset);buttonObserver.observe(link);
});
const resetButtons=()=>buttonResets.forEach(reset=>reset());
reduce.addEventListener('change',resetButtons);
document.addEventListener('visibilitychange',()=>{if(document.hidden)resetButtons();});

// ——— Favicon vivo: o olho da aba segue o ponteiro, pisca de vez em quando e dorme com a aba em segundo plano ———
if(matchMedia('(hover:hover) and (pointer:fine)').matches&&motion()){
 const size=64,sheet=document.createElement('canvas'),g=sheet.getContext('2d');
 sheet.width=sheet.height=size;
 // Posição inicial igual ao icon.svg: pupila embaixo, à esquerda.
 const cache=new Map(),look={x:-1,y:.94},target={x:-1,y:.94};
 let icon=null,shown='',frame=0,last=0,lid=0;
 function paint(x,y,closed){
  g.clearRect(0,0,size,size);
  g.fillStyle='#eee9df';g.beginPath();g.roundRect(0,0,size,size,15);g.fill();
  g.fillStyle='#25231f';g.beginPath();g.ellipse(32,32.5,20.5,22,0,0,Math.PI*2);g.fill();
  g.fillStyle='#eee9df';g.beginPath();g.ellipse(32,32.5,11,12.8,0,0,Math.PI*2);g.fill();
  if(closed>=1){g.strokeStyle='#25231f';g.lineWidth=3.2;g.lineCap='round';g.beginPath();g.moveTo(21.5,31);g.quadraticCurveTo(32,41,42.5,31);g.stroke();}
  else{
   g.save();g.beginPath();g.ellipse(32,32.5,11,12.8,0,0,Math.PI*2);g.clip();
   g.translate(32+x*3.4,32.5+y*5.2);g.scale(1,1-closed*.9);
   g.fillStyle='#bd291f';g.beginPath();g.arc(0,0,7.6,0,Math.PI*2);g.fill();
   g.fillStyle='#fffdf8';g.beginPath();g.arc(2.3,-3.4,2.3,0,Math.PI*2);g.fill();
   g.restore();
  }
  return sheet.toDataURL('image/png');
 }
 function show(x,y,closed=0){
  const key=x+','+y+','+closed;if(key===shown)return;
  let url=cache.get(key);if(!url){url=paint(x,y,closed);cache.set(key,url);}
  if(!icon){document.querySelectorAll('link[rel~="icon"]').forEach(el=>el.remove());icon=document.createElement('link');icon.rel='icon';icon.type='image/png';document.head.append(icon);}
  icon.href=url;shown=key;
 }
 const q=v=>Math.round(v*5)/5; // 11 posições por eixo: poucos desenhos diferentes, guardados em cache
 function step(time){
  frame=0;
  look.x+=(target.x-look.x)*.3;look.y+=(target.y-look.y)*.3;
  const moving=Math.abs(target.x-look.x)+Math.abs(target.y-look.y)>.02;
  if(time-last>45||!moving){last=time;show(q(moving?look.x:target.x),q(moving?look.y:target.y),lid);}
  if(moving)frame=requestAnimationFrame(step);
 }
 const follow=()=>{if(!frame&&!document.hidden)frame=requestAnimationFrame(step);};
 addEventListener('pointermove',event=>{if(event.pointerType==='touch')return;target.x=clamp(event.clientX/innerWidth*2-1,-1,1);target.y=clamp(.15+.85*event.clientY/innerHeight,-1,1);follow();},{passive:true});
 // Saindo pela borda de cima, em direção às abas, o olho olha para cima.
 document.addEventListener('mouseleave',event=>{if(event.clientY<=0){target.y=-1;follow();}});
 (function blink(){setTimeout(()=>{if(!document.hidden&&!lid){lid=.55;show(q(look.x),q(look.y),lid);setTimeout(()=>{lid=1;show(0,0,1);setTimeout(()=>{lid=0;show(q(look.x),q(look.y),0);},110);},60);}blink();},4200+Math.random()*4200);})();
 document.addEventListener('visibilitychange',()=>{if(document.hidden)show(0,0,1);else{lid=0;show(q(look.x),q(look.y),0);}});
 show(q(look.x),q(look.y),0);
}
})();
