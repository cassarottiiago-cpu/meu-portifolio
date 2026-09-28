(() => {
'use strict';
// A canceled native transition must leave navigation working normally.
for(const type of ['pageswap','pagereveal'])addEventListener(type,event=>{
 event.viewTransition?.ready.catch(error=>{
  if(!['AbortError','InvalidStateError'].includes(error.name))reportError(error);
 });
});
const root=document.documentElement;
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const fine=matchMedia('(pointer:fine)');
const motion=()=>!reduce.matches;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
root.dataset.motion=motion()?'on':'off';
reduce.addEventListener('change',()=>{root.dataset.motion=motion()?'on':'off';document.dispatchEvent(new Event('portfolio:motion'));});
const stage=document.querySelector('.work-stage');
if(stage&&stage.querySelector('[data-select]')){
 const tabs=[...stage.querySelectorAll('[data-select]')],panels=[...stage.querySelectorAll('.project-panel')];
 let cleanup=()=>{},selectionToken=0;
 stage.dataset.ready='true';
 function tear(panel,token){
  cleanup();
  const image=panel.querySelector('img'),host=panel.querySelector('.panel-media');
  if(!motion()||!image||!host)return;
  image.loading='eager';
  image.decode().then(()=>{
   if(token!==selectionToken||panel.hidden||!motion())return;
   const rect=image.getBoundingClientRect(),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
   if(!ctx||!rect.width||!rect.height)return;
   const ratio=Math.min(2,devicePixelRatio||1),w=rect.width,h=rect.height;
   canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);
   Object.assign(canvas.style,{position:'absolute',left:'0',top:'0',width:w+'px',height:h+'px',pointerEvents:'none',background:getComputedStyle(document.body).backgroundColor});
   canvas.setAttribute('aria-hidden','true');host.append(canvas);ctx.scale(ratio,ratio);image.style.visibility='hidden';
   let frame=0,start=0;
   cleanup=()=>{cancelAnimationFrame(frame);image.style.visibility='';canvas.remove();};
   function draw(time){
    if(token!==selectionToken||panel.hidden||!motion()){cleanup();return;}
    if(!start)start=time;
    const p=clamp((time-start)/420),power=(1-p)**4;
    ctx.clearRect(0,0,w,h);
    for(let i=0;i<36;i++){const y=i*h/36,sh=h/36+1,offset=Math.sin(i*3.73)*w*.7*power;
     ctx.drawImage(image,0,i*image.naturalHeight/36,image.naturalWidth,image.naturalHeight/36+1,offset,y,w,sh);
    }
    if(p<1)frame=requestAnimationFrame(draw);else cleanup();
   }
   frame=requestAnimationFrame(draw);
  }).catch(()=>{});
 }
 function activate(id,animate=true){
  selectionToken++;cleanup();
  tabs.forEach(tab=>{const selected=tab.dataset.select===id;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;});
  panels.forEach(panel=>{panel.hidden=panel.dataset.project!==id;});
  const current=panels.find(p=>p.dataset.project===id);
  if(animate&&current)tear(current,selectionToken);
 }
 tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>{activate(tab.dataset.select);const top=stage.getBoundingClientRect().top;if(top< -150)stage.scrollIntoView({behavior:motion()?'smooth':'instant',block:'start'});});
  tab.addEventListener('keydown',event=>{
   let next=index;
   if(event.key==='ArrowDown'||event.key==='ArrowRight')next=(index+1)%tabs.length;
   else if(event.key==='ArrowUp'||event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;
   else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;
   event.preventDefault();tabs[next].focus();activate(tabs[next].dataset.select);
  });
 });
 activate(tabs[0].dataset.select,false);
 reduce.addEventListener('change',()=>cleanup());
}
const intro=document.querySelector('.intro'),canvas=document.querySelector('#brand-canvas');
if(intro&&canvas){
 const ctx=canvas.getContext('2d',{alpha:true});
 if(ctx){
  const source=document.createElement('canvas'),mask=source.getContext('2d',{willReadFrequently:true});
  source.width=300;source.height=220;
  let samples=[],width=1,height=1,frame=0,visible=true,px=0,py=0,targetX=0,targetY=0,scroll=0,targetScroll=0,previous=0;
  function build(){
   mask.clearRect(0,0,300,220);mask.fillStyle='#000';mask.textBaseline='alphabetic';mask.font='800 220px DM,Arial';mask.fillText('IC',12,183);
   const pixels=mask.getImageData(0,0,300,220).data;samples=[];
   for(let y=0;y<220;y+=5)for(let x=0;x<300;x+=4){const alpha=pixels[(y*300+x)*4+3]/255;if(alpha>.2)samples.push({x,y,alpha,seed:((x*17+y*29)%101)/101});}
  }
  function size(){
   const rect=intro.getBoundingClientRect();width=rect.width;height=rect.height;const dpr=Math.min(2,devicePixelRatio||1);
   canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);schedule();
  }
  function stamp(cx,cy,scale,tone){
   const cell=4*scale;ctx.font=Math.max(5,5.6*scale)+'px monospace';ctx.textBaseline='top';
   for(const p of samples){
    if(scroll>p.seed*.9+.1)continue;
    const x=cx+(p.x-150)*scale,y=cy+(p.y-110)*scale;
    const distance=Math.abs(y-(py*.5+.5)*height),influence=Math.max(0,1-distance/(height*.2));
    const shift=px*influence*60+Math.sin(p.y*.15)*scroll*35;
    ctx.fillStyle=tone===0?'#25231f':p.seed>.58?'#bd291f':'#25231f';
    if(p.seed<.26){ctx.fillRect(x+shift,y,cell*.86,scale*3.9);}
    else{ctx.fillText(p.seed<.52?'=':p.seed<.76?'#':':',x+shift,y);}
   }
  }
  function draw(time){
   frame=0;if(!visible||document.hidden)return;
   const dt=previous?Math.min(45,time-previous):16;previous=time;
   const ease=motion()?1-Math.exp(-dt/75):1;
   px+=(targetX-px)*ease;py+=(targetY-py)*ease;scroll+=(targetScroll-scroll)*ease;
   ctx.clearRect(0,0,width,height);
   const compact=width<700,scale=compact?width/330:Math.min(width/460,height/250);
   stamp(width*(compact?.88:.83),height*.33,scale,0);
   stamp(width*(compact?.08:.08),height*.78,scale*.85,1);
   const displacement=motion()?scroll:0;
   intro.style.setProperty('--intro-scroll',displacement.toFixed(3));
   if(Math.abs(targetX-px)+Math.abs(targetY-py)+Math.abs(targetScroll-scroll)>.001)frame=requestAnimationFrame(draw);else previous=0;
  }
  function schedule(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(draw);}
  function onScroll(){const r=intro.getBoundingClientRect();targetScroll=motion()?clamp(-r.top/Math.max(1,r.height)):0;schedule();}
  intro.addEventListener('pointermove',e=>{if(!motion()||!fine.matches||e.pointerType==='touch')return;const r=intro.getBoundingClientRect();targetX=(e.clientX-r.left)/width*2-1;targetY=(e.clientY-r.top)/height*2-1;schedule();},{passive:true});
  intro.addEventListener('pointerleave',()=>{targetX=0;targetY=0;schedule();});
  new ResizeObserver(size).observe(intro);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){onScroll();schedule();}else{cancelAnimationFrame(frame);frame=0;previous=0;}},{rootMargin:'40px'}).observe(intro);
  addEventListener('scroll',onScroll,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();});
  reduce.addEventListener('change',()=>{targetX=targetY=0;onScroll();});
  document.fonts.ready.then(()=>{build();size();});
 }
}
const invitation=document.querySelector('.end-invitation');
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
 const display=document.querySelector('[data-seconds]'),pause=document.querySelector('[data-pause]'),timer=document.querySelector('.closing-timer');
 let remaining=40,paused=false,endingVisible=false;
 new IntersectionObserver(entries=>{endingVisible=entries[0].intersectionRatio>=.8;},{threshold:.8}).observe(document.querySelector('.closing-bottom'));
 timer.hidden=false;pause.hidden=false;
 pause.addEventListener('click',()=>{paused=!paused;pause.textContent=paused?'Retomar retorno':'Permanecer aqui';timer.hidden=paused;});
 let interval=0;
 function startTimer(){
  clearInterval(interval);
  interval=setInterval(()=>{if(paused||document.hidden||!endingVisible)return;remaining--;display.textContent=String(Math.max(0,remaining));if(remaining<=0){clearInterval(interval);location.replace('index.html?replay=1#inicio');}},1000);
 }
 startTimer();
 addEventListener('pagehide',()=>clearInterval(interval));
 addEventListener('pageshow',event=>{if(event.persisted)startTimer();});
}
document.querySelectorAll('.doodle-link').forEach(link=>{
 let animations=[];
 function reset(){animations.forEach(a=>a.cancel());animations=[];link.style.removeProperty('--eye-x');link.style.removeProperty('--eye-y');}
 function animate(){
  reset();if(!motion())return;
  const letters=[...link.querySelectorAll('.button-letter')],hammer=link.querySelector('.hammer');
  if(hammer){
   animations.push(hammer.animate([{transform:'translateX(0) rotate(0deg)'},{transform:'translateX(0) rotate(-32deg)',offset:.26},{transform:'translateX(11px) rotate(62deg)',offset:.43},{transform:'translateX(8px) rotate(48deg)',offset:.52},{transform:'translateX(0) rotate(0deg)'}],{duration:650,iterations:3,easing:'cubic-bezier(.3,0,.3,1)'}));
   letters.forEach((letter,i)=>animations.push(letter.animate([{transform:'translateY(0) rotate(0deg)'},{transform:'translateY(3px) rotate('+((i%2?1:-1)*9)+'deg)',offset:.08},{transform:'translateY(-'+(5-i*.7)+'px) rotate('+((i%2?-1:1)*5)+'deg)',offset:.32},{transform:'translateY(0) rotate(0deg)'}],{delay:280+i*32,duration:650,iterations:3,easing:'ease-out'})));
   letters.forEach((letter,i)=>{
    const base=letter.querySelector('.letter-base');
    if(!base)return;
    animations.push(base.animate([{opacity:1},{opacity:1,offset:.6},{opacity:0,offset:.61},{opacity:0,offset:.91},{opacity:1,offset:.98},{opacity:1}],{duration:2700}));
    letter.querySelectorAll('.letter-piece').forEach((piece,j)=>{
     const dx=(i-1.2)*10+(j-1)*12,dy=[-23,10,29][j]+i*2,angle=[-31,22,38][j]*(i%2?-1:1);
     const scattered='translate('+dx+'px,'+dy+'px) rotate('+angle+'deg)';
     animations.push(piece.animate([{opacity:0,transform:'none'},{opacity:0,transform:'none',offset:.6},{opacity:1,transform:'none',offset:.61},{opacity:1,transform:scattered,offset:.73},{opacity:1,transform:scattered,offset:.85},{opacity:1,transform:'none',offset:.97},{opacity:0,transform:'none'}],{duration:2700,easing:'linear'}));
    });
   });
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
 link.addEventListener('pointermove',event=>{if(!motion()||event.pointerType==='touch')return;const r=link.getBoundingClientRect();link.style.setProperty('--eye-x',((event.clientX-r.left)/r.width*4-2)+'px');link.style.setProperty('--eye-y',((event.clientY-r.top)/r.height*4-2)+'px');},{passive:true});
 reduce.addEventListener('change',reset);
});
})();
