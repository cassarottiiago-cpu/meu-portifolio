// Acabamento de 28/09: cabeçalho de jornal, Work/WhatsApp do vídeo, olhos, falha de sinal, entrada dos casos,
// chamada "Visitar o projeto", próximo trabalho, rodapé, fechamento e vinheta de retorno.
const {chromium}=require('playwright-core');
const assert=require('node:assert/strict'),path=require('node:path');
const {createServer}=require('./servidor.cjs');
const projects=require('../data/projects.cjs');
const shots=path.resolve(__dirname,'../validacao');
const angleOf=matrix=>{const m=matrix.match(/matrix\(([^)]+)\)/);if(!m)return 0;const [a,b]=m[1].split(',').map(Number);return Math.atan2(b,a)*180/Math.PI;};
(async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const settle=()=>page.evaluate(()=>Promise.allSettled(document.getAnimations().filter(a=>{try{return isFinite(a.effect.getComputedTiming().endTime);}catch{return false;}}).map(a=>a.finished)));
  const ready=async()=>{await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1300);await settle();};

  // ——— cabeçalho de jornal ———
  await page.goto(base);await ready();
  const bar=await page.evaluate(()=>{const r=s=>document.querySelector(s).getBoundingClientRect().toJSON();return {brand:r('.home-nav .brand-tag'),work:r('.home-nav .doodle-work'),chat:r('.home-nav .doodle-chat'),rules:[...document.querySelectorAll('.home-nav .masthead-rule')].map(e=>e.getBoundingClientRect().width),width:innerWidth};});
  assert.ok(Math.abs(bar.brand.left+bar.brand.width/2-bar.width/2)<45,'Assinatura centralizada');
  assert.ok(bar.work.left<bar.brand.left&&bar.chat.right>bar.brand.right,'Botões nas pontas');
  assert.equal(bar.rules.length,2);assert.ok(bar.rules.every(w=>w>100),'Duas réguas visíveis');
  for(const width of [1024,768,390,320]){
   await page.setViewportSize({width,height:844});await page.goto(base);await ready();
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Sem overflow no cabeçalho '+width);
   if(width===320){const h=await page.evaluate(()=>({brand:document.querySelector('.home-nav .brand-tag').getBoundingClientRect().top,work:document.querySelector('.home-nav .doodle-work').getBoundingClientRect().top}));assert.ok(h.brand<h.work,'Em telas estreitas a assinatura fica acima dos botões');}
  }
  await page.setViewportSize({width:1440,height:900});await page.goto(base);await ready();

  // ——— Work: martelo do vídeo (armação para a esquerda, golpe a ~90°) ———
  const work=page.locator('.home-nav .doodle-work'),hammer=work.locator('.hammer');
  await page.mouse.move(700,500);await work.hover();
  const angles=[];const started=Date.now();
  while(Date.now()-started<1500){angles.push(angleOf(await hammer.evaluate(e=>getComputedStyle(e).transform)));await page.waitForTimeout(16);}
  assert.ok(Math.min(...angles)<-10,'Martelo arma para a esquerda ('+Math.min(...angles).toFixed(0)+'°)');
  assert.ok(Math.max(...angles)>55,'Martelo golpeia ('+Math.max(...angles).toFixed(0)+'°)');
  await page.waitForTimeout(1500);
  assert.ok(Number(await work.getAttribute('data-hits'))>=4,'Batidas contínuas');
  await page.screenshot({path:path.join(shots,'acabamento-work.png'),clip:{x:0,y:0,width:520,height:120}});
  await page.mouse.move(700,500);await page.waitForTimeout(320);
  assert.equal(await work.locator('.button-letter').first().evaluate(e=>getComputedStyle(e).transform),'none','Letras voltam ao sair');

  // ——— WhatsApp: pupilas seguem o ponteiro pela página ———
  const look=async(x,y)=>{await page.mouse.move(x,y,{steps:4});await page.waitForTimeout(400);return page.locator('.home-nav .doodle-chat').evaluate(e=>({x:parseFloat(e.style.getPropertyValue('--lx')),y:parseFloat(e.style.getPropertyValue('--ly'))}));};
  const left=await look(40,300),right=await look(1439,300),up=await look(1320,2),down=await look(1320,880);
  assert.ok(left.x<-1&&right.x>1,'Pupilas seguem na horizontal',{left,right});assert.ok(up.y<down.y-4,'Pupilas seguem na vertical',{up,down});
  await page.screenshot({path:path.join(shots,'acabamento-olhos.png'),clip:{x:1100,y:0,width:340,height:70}});

  // ——— Olho no "O" de DEVELOPER ———
  assert.equal(await page.locator('.type-developer .o-eye').count(),1);
  const eyeAt=async(x,y)=>{await page.mouse.move(x,y,{steps:4});await page.waitForTimeout(500);return page.evaluate(()=>{const e=document.querySelector('.type-developer .o-eye').getBoundingClientRect(),p=document.querySelector('.type-developer .o-pupil').getBoundingClientRect();return {dx:p.left+p.width/2-(e.left+e.width/2),dy:p.top+p.height/2-(e.top+e.height/2),inside:p.left>=e.left-1&&p.right<=e.right+1&&p.top>=e.top-1&&p.bottom<=e.bottom+1};});};
  const a=await eyeAt(100,100),b=await eyeAt(1400,850);
  assert.ok(a.dx<-3&&a.dy<-3&&b.dx>3&&b.dy>3,'Pupila do O acompanha o ponteiro',{a,b});assert.ok(a.inside&&b.inside,'Pupila fica dentro do vazado do O');
  await page.screenshot({path:path.join(shots,'acabamento-hero.png')});

  // ——— falha de sinal na troca dos nomes ———
  await page.locator('[data-project=autopost]').evaluate(e=>scrollTo(0,scrollY+e.getBoundingClientRect().top-innerHeight*.3));await page.waitForTimeout(900);
  assert.equal(await page.locator('.following-title').innerText(),'AUTOPOST');
  await page.locator('[data-project=dr-paulo]').evaluate(e=>scrollTo(0,scrollY+e.getBoundingClientRect().top-innerHeight*.3));await page.waitForTimeout(150);
  assert.ok(await page.locator('.signal-layer').count()>0,'Falha de sinal em andamento');
  await page.screenshot({path:path.join(shots,'acabamento-sinal.png'),clip:{x:0,y:200,width:640,height:180}});
  await page.waitForTimeout(1100);
  assert.equal(await page.locator('.signal-layer,.signal-noise,.signal-bar').count(),0,'Camadas de sinal removidas');
  assert.equal(await page.locator('.following-title').innerText(),'Dr. Paulo');assert.equal(await page.locator('.title-splice').count(),0);
  // rolagem rápida: termina na última posição lida
  for(const id of ['natalia','limozine','natalia','dr-paulo','autopost'])await page.locator('[data-project='+id+']').evaluate(e=>scrollTo(0,scrollY+e.getBoundingClientRect().top-innerHeight*.3));
  await page.waitForTimeout(2600);assert.equal(await page.locator('.following-title').innerText(),'AUTOPOST');

  // ——— rodapé ———
  const index=await page.locator('.invitation-index a').evaluateAll(list=>list.map(a=>a.getAttribute('href')));
  assert.deepEqual(index,projects.map(p=>'projetos/'+p.id+'.html'),'Índice do rodapé com os nove casos');

  // ——— casos: entrada, chamada de visita e próximo trabalho ———
  for(let i=0;i<projects.length;i++){
   const p=projects[i];await page.goto(base+'/projetos/'+p.id+'.html');await ready();
   assert.equal(await page.locator('[data-enter]').evaluateAll(list=>list.filter(e=>e.classList.contains('enter-armed')&&e.getBoundingClientRect().top<innerHeight*.9).length),0,'Nada visível preso no estado oculto '+p.id);
   assert.equal(await page.locator('h1[data-enter]').evaluate(e=>getComputedStyle(e).opacity),'1','Título visível '+p.id);
   for(let y=0;y<=await page.evaluate(()=>document.documentElement.scrollHeight);y+=420){await page.evaluate(v=>scrollTo(0,v),y);await page.waitForTimeout(70);}await page.waitForTimeout(300);await settle(); // rolando como o visitante: cada título entra ao aparecer
   assert.equal(await page.locator('[data-enter]').evaluateAll(list=>list.filter(e=>getComputedStyle(e).opacity!=='1').length),0,'Títulos visíveis ao fim da página '+p.id);
   assert.equal(await page.locator('.next-case').getAttribute('href'),'../projetos.html');
   if(p.url){
    assert.equal(await page.locator('.visit-url strong').innerText(),new URL(p.url).hostname.replace(/^www\./,''),'Endereço da visita '+p.id);
    assert.equal(await page.locator('.doodle-visit').getAttribute('href'),p.url);
   }else assert.equal(await page.locator('.doodle-visit').count(),0);
  }
  await page.goto(base+'/projetos/dr-paulo.html');await ready();
  await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await page.waitForTimeout(500);
  await page.locator('.next-case').hover();await page.waitForTimeout(900);
  assert.match(await page.locator('.next-case').evaluate(e=>getComputedStyle(e,'::before').transform),/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/,'Cor do próximo caso sobe pela faixa');
  await page.screenshot({path:path.join(shots,'acabamento-proximo.png')});

  // ——— fechamento e vinheta ———
  await page.goto(base+'/encerramento.html');await ready();
  assert.equal(await page.locator('.thanks-word .o-eye').count(),2,'Dois olhos em OBRIGADO.');assert.equal(await page.locator('.cap-icon').count(),3);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:path.join(shots,'acabamento-fechamento.png'),fullPage:true});
  await page.locator('.closing-bottom a').click();await page.waitForTimeout(1500);
  assert.equal(await page.locator('.replay-curtain').count(),1,'Vinheta em andamento');
  await page.screenshot({path:path.join(shots,'acabamento-vinheta.png')});
  await page.waitForURL('**/index.html?replay=1#inicio',{timeout:15000});await page.waitForTimeout(250);
  assert.equal(await page.evaluate(()=>scrollY),0);assert.equal(await page.locator('.replay-curtain').count(),0);
  assert.equal(await page.locator('.intro-type .type-full>span').evaluateAll(list=>list.reduce((s,e)=>s+e.getAnimations().filter(a=>a.playState==='running').length,0)),0,'Vindo da vinheta, as palavras já estão no lugar');

  // ——— movimento reduzido ———
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(base);await ready();
  assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('js-enter')),false);
  assert.equal(await page.locator('.home-nav .hammer').evaluate(e=>e.getAnimations().length),0);
  assert.equal(await page.locator('.boil.b2').first().evaluate(e=>getComputedStyle(e).display),'none','Sem tremida do contorno');
  await page.locator('[data-project=autopost]').evaluate(e=>scrollTo(0,scrollY+e.getBoundingClientRect().top-innerHeight*.3));await page.waitForTimeout(300);
  await page.locator('[data-project=limozine]').evaluate(e=>scrollTo(0,scrollY+e.getBoundingClientRect().top-innerHeight*.3));await page.waitForTimeout(250);
  assert.equal(await page.locator('.following-title').innerText(),'Limozine','Troca imediata com movimento reduzido');assert.equal(await page.locator('.signal-layer').count(),0);
  await page.goto(base+'/projetos/limozine.html');await ready();
  assert.equal(await page.locator('[data-enter]').evaluateAll(list=>list.filter(e=>getComputedStyle(e).opacity!=='1').length),0);
  await page.goto(base+'/encerramento.html');await ready();await page.locator('.closing-bottom a').click();await page.waitForURL('**/index.html?replay=1#inicio',{timeout:5000});

  // ——— sem JavaScript ———
  const plain=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),nojs=await plain.newPage();
  await nojs.goto(base+'/projetos/limozine.html');
  assert.equal(await nojs.locator('h1').evaluate(e=>getComputedStyle(e).opacity),'1','Sem JS o título aparece');
  await nojs.goto(base);assert.equal(await nojs.locator('.invitation-link>span').first().evaluate(e=>getComputedStyle(e).opacity),'1');await plain.close();
  assert.deepEqual(errors,[]);
  console.log('OK: cabeçalho de jornal em cinco larguras, Work (armação/golpe/letras), olhos do WhatsApp e do O, falha de sinal (com rolagem rápida), entrada dos nove casos, chamada de visita, próximo trabalho, rodapé, fechamento, vinheta contínua, movimento reduzido e sem JS.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
