(() => {
'use strict';
const root=document.documentElement;
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const fine=matchMedia('(pointer:fine)');
const motion=()=>!reduce.matches;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
root.dataset.motion=motion()?'on':'off';
reduce.addEventListener('change',()=>{root.dataset.motion=motion()?'on':'off';document.dispatchEvent(new Event('portfolio:motion'));});
const stage=document.querySelector('.work-stage');
// One reading position follows the gallery; the document keeps its native scroll.
if(stage?.classList.contains('work-continuous')){
 const panels=[...stage.querySelectorAll('.project-story')],gallery=stage.querySelector('.work-panels');
 const layout=document.createElement('div'),rail=document.createElement('aside');
 layout.className='following-layout';rail.className='following-project';
 rail.setAttribute('aria-label','Projeto em leitura');
 gallery.before(layout);layout.append(rail,gallery);
 rail.innerHTML='<div class="following-title" aria-hidden="true"><span></span></div><p class="following-description"></p>';
 const title=rail.querySelector('span'),description=rail.querySelector('p');
 const link=panels[0].querySelector('.panel-heading a').cloneNode(true);rail.append(link);
 let active=-1,displayed=-1,frame=0,positions=[],captionHeight=120,visible=true,titleAnimations=[],transitionId=0,titleLayer=null;
 function settleTitle(){transitionId++;titleAnimations.forEach(animation=>animation.cancel());titleAnimations=[];titleLayer?.remove();titleLayer=null;title.style.removeProperty('visibility');}
 const records=panels.map(panel=>({id:panel.dataset.project,name:panel.querySelector('h3').textContent,description:panel.querySelector('.panel-heading p').textContent,href:panel.querySelector('.panel-heading a').href}));
 panels.forEach(panel=>panel.querySelector('.panel-heading a').tabIndex=-1);
 stage.dataset.following='true';
 function showProject(index){
  const project=records[index];displayed=index;title.textContent=project.name;
  description.textContent=project.description;link.href=project.href;
  link.setAttribute('aria-label','Ver caso '+project.name);rail.dataset.active=project.id;
 }
 function transitionTo(index){
  if(titleAnimations.length)return; // Finish the current splice, then take only the latest scroll target.
  if(index===displayed)return;
  if(!motion()||displayed<0||!visible||document.hidden){settleTitle();showProject(index);return;}
  const from=records[displayed].name,to=records[index].name,direction=index>displayed?1:-1,id=++transitionId;
  titleLayer=document.createElement('div');titleLayer.className='title-splice';titleLayer.setAttribute('aria-hidden','true');
  for(let band=0;band<3;band++){
   const slice=document.createElement('div'),track=document.createElement('div'),old=document.createElement('span'),next=document.createElement('span');
   slice.className='title-splice-band';slice.style.clipPath='inset('+(band*100/3)+'% 0 '+((2-band)*100/3)+'% 0)';
   track.className='title-splice-track';old.textContent=from;next.textContent=to;
   const forward=(band%2? -1:1)*direction>0;
   track.append(...(forward?[old,next]:[next,old]));slice.append(track);titleLayer.append(slice);
   titleAnimations.push(track.animate([{transform:'translateX('+(forward?0:-100)+'%)'},{transform:'translateX('+(forward?-100:0)+'%)'}],{duration:780,delay:band*55,easing:'cubic-bezier(.76,0,.24,1)',fill:'both'}));
  }
  title.parentElement.append(titleLayer);title.style.visibility='hidden';
  Promise.allSettled(titleAnimations.map(animation=>animation.finished)).then(()=>{
   if(id!==transitionId)return;
   settleTitle();showProject(index);if(active!==displayed)transitionTo(active);
  });
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
 function measure(){if(titleAnimations.length){settleTitle();showProject(active);}positions=panels.map(panel=>panel.getBoundingClientRect().top+scrollY);captionHeight=rail.offsetHeight;update();}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',measure);
 addEventListener('pageshow',measure);reduce.addEventListener('change',()=>{settleTitle();if(active>=0)showProject(active);schedule();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){settleTitle();if(active>=0)showProject(active);}});
 new ResizeObserver(measure).observe(gallery);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)schedule();},{rootMargin:'120px'}).observe(stage);
 document.fonts.ready.then(measure);measure();
}
const intro=document.querySelector('.intro'),canvas=document.querySelector('#brand-canvas');
if(intro){
 let entry=[];
 const finishEntry=()=>{entry.forEach(animation=>animation.cancel());entry=[];};
 document.fonts.ready.then(()=>{
  if(!motion()||scrollY>100)return;
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
  let samples=[],width=1,height=1,introTop=0,frame=0,visible=true,px=0,py=0,targetX=0,targetY=0,scroll=0,targetScroll=0,previous=0;
  let assembly=1,assemblyStart=null,assembling=false;
  const atlases=new Map();
  function build(){
   mask.clearRect(0,0,300,220);mask.fillStyle='#000';mask.textBaseline='alphabetic';mask.font='800 220px DM,Arial';mask.fillText('IC',12,183);
   const pixels=mask.getImageData(0,0,300,220).data;samples=[];
   for(let y=0;y<220;y+=5)for(let x=0;x<300;x+=4){const alpha=pixels[(y*300+x)*4+3]/255;if(alpha>.2){const seed=((x*17+y*29)%101)/101;samples.push({x,y,seed,wave:Math.sin(y*.15),glyph:seed<.26?0:seed<.52?1:seed<.76?2:3});}}
  }
  function size(){
   const rect=intro.getBoundingClientRect();width=rect.width;height=rect.height;introTop=rect.top+scrollY;const dpr=Math.min(2,devicePixelRatio||1);atlases.clear();
   canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);schedule();
  }
  function atlasFor(scale){
   if(atlases.has(scale))return atlases.get(scale);
   const dpr=Math.min(2,devicePixelRatio||1),side=Math.ceil(Math.max(5,5.6*scale)*2),tile=Math.ceil(side*dpr),sheet=document.createElement('canvas');
   sheet.width=tile*8;sheet.height=tile;
   const pen=sheet.getContext('2d');pen.scale(dpr,dpr);pen.textBaseline='top';pen.font=Math.max(5,5.6*scale)+'px monospace';
   for(let color=0;color<2;color++)for(let glyph=0;glyph<4;glyph++){
    pen.fillStyle=color?'#bd291f':'#25231f';const x=(color*4+glyph)*tile/dpr;
    if(glyph===0)pen.fillRect(x,0,4*scale*.86,scale*3.9);else pen.fillText(['','=', '#',':'][glyph],x,0);
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
    const formation=1-Math.pow(1-clamp((assembly-p.seed*.18)/.82),3),spread=1-formation;
    ctx.globalAlpha=formation;
    ctx.drawImage(atlas.sheet,(color*4+p.glyph)*atlas.tile,0,atlas.tile,atlas.tile,x+shift+spread*(p.wave*width*.45),y+spread*(p.seed-.5)*height*.65,atlas.side,atlas.side);
   }
   ctx.globalAlpha=1;
  }
  function draw(time){
   frame=0;if(!visible||document.hidden)return;
   if(assembling){if(assemblyStart===null)assemblyStart=time;assembly=clamp((time-assemblyStart)/1450);if(assembly===1)assembling=false;}
   const dt=previous?Math.min(45,time-previous):16;previous=time;
   const ease=motion()?1-Math.exp(-dt/75):1;
   px+=(targetX-px)*ease;py+=(targetY-py)*ease;scroll+=(targetScroll-scroll)*ease;
   ctx.clearRect(0,0,width,height);
   const compact=width<700,scale=compact?width/330:Math.min(width/460,height/250);
   stamp(width*(compact?.88:.83),height*.33,scale,0);
   stamp(width*(compact?.08:.08),height*.78,scale*.85,1);
   const displacement=motion()?scroll:0;
   intro.style.setProperty('--intro-scroll',displacement.toFixed(3));
   if(assembling||Math.abs(targetX-px)+Math.abs(targetY-py)+Math.abs(targetScroll-scroll)>.001)frame=requestAnimationFrame(draw);else previous=0;
  }
  function schedule(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(draw);}
  function onScroll(){if(scrollY>100||!motion()){assembling=false;assembly=1;}if(!visible)return;targetScroll=motion()?clamp((scrollY-introTop)/Math.max(1,height)):0;schedule();}
  intro.addEventListener('pointermove',e=>{if(!motion()||!fine.matches||e.pointerType==='touch')return;targetX=e.clientX/width*2-1;targetY=(e.clientY-introTop+scrollY)/height*2-1;schedule();},{passive:true});
  intro.addEventListener('pointerleave',()=>{targetX=0;targetY=0;schedule();});
  new ResizeObserver(size).observe(intro);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){onScroll();schedule();}else{cancelAnimationFrame(frame);frame=0;previous=0;}},{rootMargin:'40px'}).observe(intro);
  addEventListener('scroll',onScroll,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;assembling=false;assembly=1;}else schedule();});
  reduce.addEventListener('change',()=>{targetX=targetY=0;onScroll();});
  document.fonts.ready.then(()=>{build();assembling=motion()&&scrollY<100;assembly=assembling?0:1;size();});
 }
}
const invitation=document.querySelector('.end-invitation');
// Home/closing anchors are independent from the case typography.
{
 const running=new Map();
 function finish(element){const job=running.get(element);if(!job)return;running.delete(element);job.animations.forEach(animation=>animation.cancel());job.cleanup?.();}
 function reveal(element){
  if(!motion()||document.hidden||running.size>=4)return;
  const delay=element.matches('.closing-stage h1>span:last-child')?90:0;
  const animation=element.animate([{clipPath:'inset(-.15em 100% -.2em -.1em)'},{clipPath:'inset(-.15em -.1em -.2em -.1em)'}],{duration:420,delay,easing:'cubic-bezier(.22,.7,.25,1)',fill:'backwards'});
  running.set(element,{animations:[animation]});
  animation.finished.then(()=>finish(element),()=>finish(element));
 }
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;observer.unobserve(entry.target);reveal(entry.target);}},{threshold:0,rootMargin:'0px 0px -50px 0px'});
 document.querySelectorAll('.work-heading h2,.closing-stage h1>span').forEach(el=>observer.observe(el));
 const finishAll=()=>[...running.keys()].forEach(finish);
 reduce.addEventListener('change',finishAll);addEventListener('resize',finishAll);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)finishAll();});
 document.addEventListener('focusin',event=>{for(const el of running.keys())if(el.contains(event.target))finish(el);});
}
// In-place reading reveal: original text, no masks, copies, or displacement.
if(document.body.classList.contains('case-page')){
 const jobs=new Map();let frame=0;
 const finish=element=>{const job=jobs.get(element);if(!job)return;jobs.delete(element);job.animation.cancel();};
 const finishAll=()=>[...jobs.keys()].forEach(finish);
 function update(){
  frame=0;
  for(const [element,job] of jobs){
   const progress=clamp((scrollY-job.start)/job.distance);
   job.animation.currentTime=progress*1000;
   if(progress>=1)finish(element);
  }
 }
 function schedule(){if(!frame&&jobs.size&&!document.hidden)frame=requestAnimationFrame(update);}
 function reveal(element){
  if(!motion()||document.hidden)return;
  const bounds=element.getBoundingClientRect(),style=getComputedStyle(element);
  if(bounds.bottom<=0||bounds.width<1)return;
  const rgb=value=>(value.match(/[\d.]+/g)||[]).slice(0,3).map(Number);
  let background=[255,255,255];
  for(let ancestor=element;ancestor;ancestor=ancestor.parentElement){
   const value=getComputedStyle(ancestor).backgroundColor;
   if(value!=='rgba(0, 0, 0, 0)'&&value!=='transparent'){background=rgb(value);break;}
  }
  const ink=rgb(style.color),luminance=color=>color.map(v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
  const paperLight=luminance(background);let opacity=.45;
  // These display headings retain at least 3.2:1 contrast even at the start.
  while(opacity<1){const light=luminance(ink.map((v,i)=>v*opacity+background[i]*(1-opacity)));if((Math.max(light,paperLight)+.05)/(Math.min(light,paperLight)+.05)>=3.2)break;opacity=Math.min(1,opacity+.02);}
  const animation=element.animate([{opacity},{opacity:1}],{duration:1000,easing:'linear',fill:'both'});
  animation.pause();animation.currentTime=0;
  const start=bounds.top+scrollY-innerHeight*.94;
  const end=Math.min(start+innerHeight*.72,document.documentElement.scrollHeight-innerHeight);
  jobs.set(element,{animation,start,distance:Math.max(1,end-start)});
  update();
 }
 document.fonts.ready.then(()=>{
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;observer.unobserve(entry.target);reveal(entry.target);}},{rootMargin:'0px 0px 140px 0px'});
  document.querySelectorAll('.case-line,.case-context h2,.case-decisions>h2,.case-development h2').forEach(element=>{
   // Do not hide and replay text that the reader already saw while fonts loaded.
   if(element.getBoundingClientRect().top>=innerHeight)observer.observe(element);
  });
 });
 addEventListener('resize',finishAll);reduce.addEventListener('change',finishAll);
 addEventListener('scroll',schedule,{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)finishAll();});
}
if(invitation){
 const field=invitation.querySelector('.clone-field');let lastX=null,lastY=null;
 function clear(){field.replaceChildren();lastX=lastY=null;}
 invitation.addEventListener('pointermove',event=>{
  if(!motion()||!fine.matches||event.pointerType==='touch')return;
  const r=invitation.getBoundingClientRect(),x=event.clientX-r.left,y=event.clientY-r.top;
 if(lastX!==null&&Math.hypot(x-lastX,y-lastY)<220/1.5)return;
  lastX=x;lastY=y;
 for(let i=0;i<1;i++){
   const label=document.createElement('span');label.className='invitation-copy';label.textContent='VER TODOS OS PROJETOS';
   label.style.left=clamp(x+(i?80:-100),-80,r.width-120)+'px';
   label.style.top=clamp(y+(i?45:-40),0,r.height-70)+'px';
   field.append(label);setTimeout(()=>label.remove(),1500);
  }
 while(field.childElementCount>8)field.firstElementChild.remove();
 },{passive:true});
 invitation.addEventListener('pointerleave',clear);
 reduce.addEventListener('change',clear);
}
const viewer=document.querySelector('.print-viewer');
if(viewer){
 const area=viewer.querySelector('.print-canvas'),sizing=viewer.querySelector('[data-size]');let origin=null,overflow='';
 document.addEventListener('click',event=>{
  const link=event.target.closest('[data-print]');
  if(!link||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();origin=link;
  const source=link.querySelector('img'),image=source?source.cloneNode():new Image();
  if(!source){image.src=link.href;image.alt='Página completa do projeto';}
  image.removeAttribute('loading');image.removeAttribute('fetchpriority');
  area.replaceChildren(image);viewer.dataset.size='fit';viewer.dataset.full=String(link.hasAttribute('data-full'));sizing.setAttribute('aria-pressed','false');sizing.firstChild.textContent='Tamanho real ';
  overflow=document.body.style.overflow;document.body.style.overflow='hidden';viewer.showModal();area.scrollTo(0,0);
 });
 sizing.addEventListener('click',()=>{const actual=viewer.dataset.size!=='actual';viewer.dataset.size=actual?'actual':'fit';sizing.setAttribute('aria-pressed',String(actual));sizing.firstChild.textContent=actual?'Ajustar à tela ':'Tamanho real ';area.scrollTo(0,0);});
 viewer.querySelector('[data-close]').addEventListener('click',()=>viewer.close());
 viewer.addEventListener('close',()=>{document.body.style.overflow=overflow;origin?.focus({preventScroll:true});});
}
if(document.body.classList.contains('closing')){
 let leaving=false;
 const returnLink=document.querySelector('.closing-bottom a');
 async function returnToOpening(){
  if(leaving)return;leaving=true;
  if(motion()){
   const curtain=document.createElement('div');curtain.className='replay-curtain';curtain.setAttribute('aria-hidden','true');
   curtain.innerHTML='<div class="replay-strips">'+Array.from({length:5},(_,i)=>'<div style="--strip:'+i+'"><span>OBRIGADO.</span></div>').join('')+'</div><div class="replay-signature"><span>CREATIVE</span><span>DEVELOPER</span></div>';
   document.body.append(curtain);
   const strips=[...curtain.querySelectorAll('.replay-strips>div')];
   await Promise.all(strips.map((strip,i)=>strip.animate([{transform:'translateX('+(i%2?-105:105)+'%)'},{transform:'translateX(0)'}],{duration:550,delay:i*65,easing:'cubic-bezier(.76,0,.24,1)',fill:'both'}).finished));
   const words=curtain.querySelectorAll('.replay-strips span');
   words.forEach((word,i)=>word.animate([{transform:'translateX(0)'},{transform:'translateX('+(i%2?110:-110)+'%)'}],{duration:650,delay:i*35,fill:'forwards',easing:'cubic-bezier(.76,0,.24,1)'}));
   await curtain.querySelector('.replay-signature').animate([{clipPath:'inset(100% 0 0)'},{clipPath:'inset(0)'}],{duration:750,delay:180,fill:'both',easing:'cubic-bezier(.76,0,.24,1)'}).finished;
  }
  location.replace(returnLink.href);
 }
 returnLink?.addEventListener('click',event=>{if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();returnToOpening();});
}
const buttonResets=new Map();
const buttonObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(!entry.isIntersecting)buttonResets.get(entry.target)?.();});
document.querySelectorAll('.doodle-link').forEach(link=>{
 let animations=[],strikeTimer=0,letterMotions=[],eyeFrame=0,eyeRect=null,eyeX=0,eyeY=0;
 function reset(){clearTimeout(strikeTimer);cancelAnimationFrame(eyeFrame);eyeFrame=0;eyeRect=null;letterMotions.forEach(a=>a.cancel());letterMotions=[];animations.forEach(a=>a.cancel());animations=[];link.style.removeProperty('--eye-x');link.style.removeProperty('--eye-y');delete link.dataset.hits;}
 function animate(){
  reset();if(!motion())return;
  const letters=[...link.querySelectorAll('.button-letter')],hammer=link.querySelector('.hammer');
  if(hammer){
   // Video reference: a strike every ~640ms, with progressively loose whole letters.
   animations.push(hammer.animate([{transform:'rotate(0deg)',offset:0},{transform:'rotate(-24deg)',offset:.26},{transform:'rotate(94deg)',offset:.47},{transform:'rotate(94deg)',offset:.5},{transform:'rotate(-5deg)',offset:.7},{transform:'rotate(0deg)',offset:1}],{duration:640,iterations:Infinity,easing:'cubic-bezier(.3,0,.4,1)'}));
   let hits=0;const scale=parseFloat(getComputedStyle(link).fontSize)/16;
   function strike(){
    if(!motion()||document.hidden){reset();return;}
    hits++;link.dataset.hits=String(hits);
    const strength=Math.min(hits,6),previous=letters.map(letter=>getComputedStyle(letter).transform);
    letters.forEach((letter,i)=>{
     letterMotions[i]?.cancel();
     const noise=Math.sin(hits*2.7+i*4.1),x=(i-1.3)*strength*.38*scale,y=(i===2?1.35:.65)*strength*scale,angle=(i%2?1:-1)*strength*2.5+noise*2;
     letterMotions[i]=letter.animate([{transform:previous[i]},{transform:'translate('+(x+noise*1.5*scale)+'px,'+(y+2*scale)+'px) rotate('+(angle+noise*4)+'deg)',offset:.25},{transform:'translate('+x+'px,'+y+'px) rotate('+angle+'deg)'}],{duration:240,delay:i*12,fill:'forwards',easing:'cubic-bezier(.2,.8,.3,1)'});
    });
    strikeTimer=setTimeout(strike,640);
   }
   strikeTimer=setTimeout(strike,301);
  }else if(link.classList.contains('doodle-visit')){
   animations.push(link.querySelector('.visit-door').animate([{transform:'perspective(80px) rotateY(0deg)'},{transform:'perspective(80px) rotateY(-65deg)',offset:.4},{transform:'perspective(80px) rotateY(-65deg)',offset:.72},{transform:'perspective(80px) rotateY(0deg)'}],{duration:780,easing:'cubic-bezier(.3,0,.25,1)'}));
   animations.push(link.querySelector('.visit-step').animate([{transform:'translateX(0)'},{transform:'translateX(6px)',offset:.48},{transform:'translateX(6px)',offset:.65},{transform:'translateX(0)'}],{duration:780,easing:'cubic-bezier(.3,0,.25,1)'}));
  }else if(link.classList.contains('doodle-chat')){
   const eyes=link.querySelector('.eyes');animations.push(eyes.animate([{transform:'scaleY(1)'},{transform:'scaleY(.12)',offset:.45},{transform:'scaleY(1)'}],{duration:220,delay:120}));
  }else if(link.classList.contains('doodle-back')){
   ['.rewind-b','.rewind-a'].forEach((selector,i)=>animations.push(link.querySelector(selector).animate([{transform:'perspective(90px) rotateY(0deg)'},{transform:'perspective(90px) rotateY(-55deg)',offset:.4},{transform:'perspective(90px) rotateY(0deg)'}],{duration:650,delay:i*55,iterations:1})));
  }else{
   animations.push(link.querySelector('.doodle-icon').animate([{transform:'rotateY(0)'},{transform:'rotateY(-35deg)',offset:.4},{transform:'rotateY(0)'}],{duration:450}));
  }
 }
 link.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')animate();});
 link.addEventListener('focus',animate);
 link.addEventListener('pointerleave',reset);link.addEventListener('blur',reset);
 if(link.classList.contains('doodle-chat'))link.addEventListener('pointermove',event=>{
  if(!motion()||event.pointerType==='touch')return;
  if(!eyeRect){const r=link.getBoundingClientRect();eyeRect={left:r.left,top:r.top+scrollY,width:r.width,height:r.height};}
  eyeX=event.clientX;eyeY=event.clientY+scrollY;
  if(!eyeFrame)eyeFrame=requestAnimationFrame(()=>{eyeFrame=0;link.style.setProperty('--eye-x',((eyeX-eyeRect.left)/eyeRect.width*4-2)+'px');link.style.setProperty('--eye-y',((eyeY-eyeRect.top)/eyeRect.height*4-2)+'px');});
 },{passive:true});
 buttonResets.set(link,reset);buttonObserver.observe(link);
});
const resetButtons=()=>buttonResets.forEach(reset=>reset());
reduce.addEventListener('change',resetButtons);addEventListener('resize',resetButtons);
document.addEventListener('visibilitychange',()=>{if(document.hidden)resetButtons();});
})();
