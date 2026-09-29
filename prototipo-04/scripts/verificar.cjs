const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
const {default:AxeBuilder}=require('@axe-core/playwright');
const {createServer}=require('./servidor.cjs');
const {generate}=require('./gerar.cjs');
const projects=require('../data/projects.cjs');
const featured=['autopost','dr-paulo','natalia','limozine'].map(id=>projects.find(p=>p.id===id));
const root=path.resolve(__dirname,'..'),output=path.join(root,'validacao');
const report={checks:[],accessibility:[],screens:[],limitations:['Microsoft Edge automatizado; Safari/iOS e dispositivos físicos não testados.','Verificação técnica não é aceite criativo nem teste de conversão.']};
function check(ok,label,detail){assert.ok(ok,label+' '+JSON.stringify(detail||''));report.checks.push({label,...(detail?{detail}:{})});}
async function images(page,selector='img'){await page.locator(selector).evaluateAll(async list=>{await Promise.all(list.filter(i=>i.getBoundingClientRect().width>0).map(async i=>{i.loading='eager';await i.decode();}));});}
async function ready(page){await page.evaluate(()=>document.fonts.ready);await images(page);await page.waitForTimeout(100);}
async function picture(page,name){await page.screenshot({path:path.join(output,name+'.png')});report.screens.push(name+'.png');}
async function bounds(page,label){const r=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,images:[...document.querySelectorAll('img')].filter(i=>i.getBoundingClientRect().width>0).map(i=>{const r=i.getBoundingClientRect();return {src:i.getAttribute('src'),error:Math.abs(r.width/r.height-(i.getAttribute('width')&&i.getAttribute('height')?i.getAttribute('width')/i.getAttribute('height'):i.naturalWidth/i.naturalHeight)),loaded:i.complete&&i.naturalWidth>0};})}));check(r.scroll<=r.width+1,label+' sem overflow',r);check(r.images.every(i=>i.loaded&&i.error<.01),label+' imagens proporcionais');}
async function settle(page){await page.waitForTimeout(300);await page.evaluate(()=>Promise.allSettled(document.getAnimations().filter(a=>{try{return isFinite(a.effect.getComputedTiming().endTime);}catch{return false;}}).map(a=>a.finished)));await page.waitForTimeout(120);}
async function axe(page,label){await settle(page);const result=await new AxeBuilder({page}).analyze();report.accessibility.push({label,violations:result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({html:n.html,summary:n.failureSummary}))}))});check(result.violations.length===0,'axe '+label,result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.html)})));}
(async()=>{
 generate();fs.mkdirSync(output,{recursive:true});
 const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 let browser;
 try{
  browser=await chromium.launch({channel:'msedge',headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage(),errors=[],badResponses=[];
  page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)badResponses.push({url:r.url(),status:r.status()});});
  await page.addInitScript(()=>{window.__frames=0;const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>raf(t=>{window.__frames++;cb(t);});});
  await page.goto(base);await ready(page);
  check(await page.getByRole('heading',{name:'Creative Developer',exact:true}).count()===1,'Título acessível da abertura');
  check(await page.locator('.owner').count()===1,'Assinatura única na home');
  check(await page.locator('.owner').getAttribute('href')==='encerramento.html','Assinatura abre About');
  check(await page.locator('.end-invitation .doodle-about').getAttribute('href')==='encerramento.html','Botão About no rodapé');
  check(await page.locator('[role=tab]').count()===0,'Sem seletor de abas na home');
  check(JSON.stringify(await page.locator('[data-project]').evaluateAll(list=>list.map(e=>e.dataset.project)))===JSON.stringify(featured.map(p=>p.id)),'Sequência exata de quatro trabalhos');
  check(await page.locator('.type-creative .type-full').evaluate(e=>getComputedStyle(e).color)==='rgb(189, 41, 31)','Creative em vermelho');
  check(await page.locator('.type-developer .type-full').evaluate(e=>getComputedStyle(e).color)==='rgb(189, 41, 31)','Developer em vermelho');
  check(await page.locator('.type-extra').evaluateAll(list=>list.length>0&&list.every(e=>getComputedStyle(e).display==='none')),'Fragmentos extras ocultos no desktop');
  check(await page.locator('.home-nav .doodle-chat').getAttribute('href')==='https://wa.me/5543988174922','WhatsApp corresponde ao currículo');
  await page.locator('.home-nav .doodle-work').hover();await page.waitForTimeout(280);
  check(await page.locator('.home-nav .hammer').evaluate(e=>e.getAnimations().length)>0,'Botão Work reage ao hover');await picture(page,'botao-work-hover');await page.mouse.move(500,700);await page.waitForTimeout(600);
  check((await page.locator('.project-story:visible img').first().getAttribute('src')).includes('/autopost-queue-'),'Calendário AUTOPOST como primeira capa');
  await page.waitForTimeout(800);await picture(page,'abertura-desktop');await axe(page,'home desktop');
  const still=await page.locator('#brand-canvas').evaluate(c=>c.toDataURL());await page.mouse.move(1220,320);await page.waitForTimeout(700);
  check(still!==await page.locator('#brand-canvas').evaluate(c=>c.toDataURL()),'Campo IC responde ao ponteiro');
  await page.mouse.move(1438,898);await page.waitForTimeout(1100);const frames=await page.evaluate(()=>window.__frames);await page.waitForTimeout(350);check(frames===await page.evaluate(()=>window.__frames),'Sem RAF contínuo quando parado');
  await page.evaluate(()=>scrollTo(0,500));await page.waitForTimeout(700);check(Number(await page.locator('.intro').evaluate(e=>e.style.getPropertyValue('--intro-scroll')))>.4,'Rolagem atua na abertura');
  await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(700);check(Number(await page.locator('.intro').evaluate(e=>e.style.getPropertyValue('--intro-scroll')))<.01,'Rolagem reversível');
  await page.mouse.wheel(0,1000);await page.waitForTimeout(600);check(await page.evaluate(()=>scrollY)>600,'Scroll nativo sem retenção');
  check(await page.locator('.home-nav').evaluate(e=>e.getBoundingClientRect().bottom)<0,'Header sai com a hero');
  await page.locator('#trabalhos').scrollIntoViewIfNeeded();
  for(const p of featured){const panel=page.locator('[data-project='+p.id+']');check(await panel.isVisible(),'Trabalho no fluxo '+p.id);check(await panel.locator('img').count()===1,'Um único print '+p.id);check(['static','absolute'].includes(await panel.locator('.panel-heading').evaluate(e=>getComputedStyle(e).position)),'Texto acompanha a rolagem (ficha ou fluxo) '+p.id);}
  check(await page.locator('.project-story').evaluateAll(list=>list.every((e,i)=>i===0||e.getBoundingClientRect().top>=list[i-1].getBoundingClientRect().bottom)),'Quatro trabalhos sucessivos sem sobreposição');
  await images(page,'.project-story img');await page.evaluate(()=>scrollTo(0,document.querySelector('#trabalhos').offsetTop));await picture(page,'indice-desktop');
  await page.locator('.end-invitation').scrollIntoViewIfNeeded();for(let x=70;x<1400;x+=130)await page.mouse.move(x,450);await page.waitForTimeout(250);
  check(await page.locator('.invitation-copy').count()>0&&await page.locator('.invitation-copy').count()<=8,'Rodapé com frequência ampliada');await picture(page,'rodape-interativo');await page.waitForTimeout(1700);check(await page.locator('.invitation-copy').count()===0,'Cópias temporárias não acumulam');
  check((await page.locator('.invitation-link').getAttribute('href'))==='projetos.html','Rodapé abre a seleção de projetos');
  await page.mouse.move(10,0);await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(100);
  for(const width of [1366,1024,768,390,320]){await page.setViewportSize({width,height:900});await ready(page);await bounds(page,'home '+width);check(await page.locator('.type-extra').evaluateAll((list,mobile)=>list.length>0&&list.every(e=>(getComputedStyle(e).display!=='none')===mobile),width<=700),'Fragmentos extras no viewport '+width);if(width===390){await picture(page,'abertura-mobile');await axe(page,'home mobile');await page.evaluate(()=>scrollTo(0,document.querySelector('#trabalhos').offsetTop));await picture(page,'indice-mobile');await page.evaluate(()=>scrollTo(0,0));}}
  for(const [catalog,about,caseDir] of [['projetos.html','encerramento.html','projetos/'],['en/projects.html','thanks.html','work/']]){
   await page.goto(base+'/'+catalog);await ready(page);
   check(JSON.stringify(await page.locator('[data-project]').evaluateAll(list=>list.map(e=>e.dataset.project)))===JSON.stringify(['phron','qozt','dominos','bmk-blink','odonto']),'Catálogo com os cinco projetos complementares '+catalog);
   check(await page.locator('.invitation-link').getAttribute('href')===about,'Rodapé do catálogo leva ao About '+catalog);
   for(const width of [1440,1024,390,320]){await page.setViewportSize({width,height:900});await ready(page);await bounds(page,'catálogo '+catalog+' '+width);if(width===1440||width===390){await picture(page,'catalogo-'+(catalog.startsWith('en/')?'en':'pt')+'-'+width);await axe(page,'catálogo '+catalog+' '+width);}}
   await page.locator('.panel-media a').first().click();await ready(page);
   check(page.url().endsWith(caseDir+'phron.html'),'Só o clique abre o caso '+catalog);
   await page.locator('.owner').click();await ready(page);
   check(page.url().endsWith(about),'About acessível a partir do caso '+catalog);
   check(await page.locator('.about-facts dd').count()===2,'Formação e aprendizado no About '+catalog);
   for(const width of [1440,390,320]){await page.setViewportSize({width,height:900});await ready(page);await settle(page);await bounds(page,'About '+catalog+' '+width);await picture(page,'about-'+(catalog.startsWith('en/')?'en':'pt')+'-'+width);}
  }
  const expected={autopost:'Inter',phron:'Plus Jakarta Sans',qozt:'Outfit',natalia:'Marble','dr-paulo':'Instrument Serif',limozine:'Bebas Neue',dominos:'Inter','bmk-blink':'Archivo',odonto:'Montserrat'};
  for(let i=0;i<projects.length;i++){
   const p=projects[i];await page.setViewportSize({width:1440,height:900});await page.goto(base+'/projetos/'+p.id+'.html');await ready(page);
   check(await page.locator('h1').textContent()===p.name,'Título '+p.id);const font=await page.locator('h1').evaluate(e=>getComputedStyle(e).fontFamily);check(font.includes(expected[p.id]),'Fonte do projeto '+p.id,font);
   check((await page.locator('.case-cover img').getAttribute('src')).includes('/'+p.image.split('/').pop().replace(/.[a-z]+$/,'')+'-'),'Capa correta '+p.id);
   check(await page.locator('.next-case').getAttribute('href')==='../projetos.html','Voltar à escolha de projetos '+p.id);
   check(await page.locator('.case-exit-about a').getAttribute('href')==='../encerramento.html','About direto no caso '+p.id);
   await bounds(page,'caso '+p.id+' desktop');await axe(page,p.id);await picture(page,'caso-'+p.id+'-desktop');
   for(const width of [1024,768,390,320]){await page.setViewportSize({width,height:844});await ready(page);await bounds(page,'caso '+p.id+' '+width);if(width===390)await picture(page,'caso-'+p.id+'-mobile');}
   console.log('Caso revisto:',p.id);
  }
  await page.setViewportSize({width:1440,height:900});await page.goto(base+'/projetos/phron.html');await ready(page);
  check(await page.locator('img[src*="phron-whatsapp-27"]').count()===1,'PHRON inclui registro WhatsApp fornecido');
  const cover=page.locator('.case-cover [data-print]');await cover.click();check(await page.locator('dialog[open]').count()===1,'Ampliar captura');await page.locator('button[data-size]').click();check(await page.locator('.print-viewer').getAttribute('data-size')==='actual','Tamanho real');await page.keyboard.press('Escape');check(await cover.evaluate(e=>e===document.activeElement),'Escape devolve foco');
  await page.goto(base+'/projetos/limozine.html');await ready(page);await page.locator('[data-full]').click();await images(page,'.print-canvas img');check(await page.locator('.print-viewer').getAttribute('data-full')==='true','Limozine captura longa rolável');await page.keyboard.press('Escape');
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base);await ready(page);await page.waitForTimeout(200);const reduced=await page.locator('#brand-canvas').evaluate(c=>c.toDataURL());await page.mouse.move(1200,200);await page.evaluate(()=>scrollTo(0,250));await page.waitForTimeout(200);check(reduced===await page.locator('#brand-canvas').evaluate(c=>c.toDataURL()),'Movimento reduzido: campo estático');await page.locator('.end-invitation').scrollIntoViewIfNeeded();await page.mouse.move(400,400);check(await page.locator('.invitation-copy').count()===0,'Movimento reduzido: sem cópias no rodapé');
  await page.goto(base+'/encerramento.html');await ready(page);check(await page.locator('.thanks-word .o-eye').count()===2,'Fechamento: dois olhos em OBRIGADO.');await axe(page,'encerramento');await picture(page,'encerramento');await page.locator('.closing-bottom a').click();await page.waitForURL('**/index.html?replay=1#inicio',{timeout:15000});check(await page.evaluate(()=>scrollY)===0,'Vinheta retorna à abertura');
  const plain=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),nojs=await plain.newPage();await nojs.goto(base);await ready(nojs);check(await nojs.locator('.project-story:visible').count()===4,'Sem JS: quatro trabalhos no fluxo');check(await nojs.locator('.project-tabs:visible').count()===0,'Sem JS: não exibe botões inativos');await bounds(nojs,'home sem JS');await nojs.goto(base+'/encerramento.html');check(await nojs.locator('.closing-bottom a[href*="index.html"]').count()===1,'Sem JS: retorno manual');await plain.close();
  for(const resource of ['/data/projects.cjs','/scripts/gerar.cjs','/.codex/config.html'])check((await fetch(base+resource)).status===403,'Servidor protege '+resource);
  check(errors.length===0,'Sem erros JavaScript',errors);check(badResponses.length===0,'Sem arquivos ausentes',badResponses);
  report.passed=true;console.log('Verificação concluída:',report.checks.length,'checagens,',report.accessibility.length,'páginas/estados axe.');
 }catch(error){report.passed=false;report.error=String(error.stack);console.error(error);process.exitCode=1;}
 finally{fs.writeFileSync(path.join(output,'resultado.json'),JSON.stringify(report,null,2));if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})();
