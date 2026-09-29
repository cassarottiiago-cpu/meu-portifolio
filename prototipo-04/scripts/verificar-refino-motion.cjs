const {chromium}=require('playwright-core');
const assert=require('node:assert/strict'),path=require('node:path');
const {createServer}=require('./servidor.cjs');
const projects=require('../data/projects.cjs');
(async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  const base='http://127.0.0.1:'+server.address().port;
  await page.goto(base);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1000);
  assert.equal(await page.locator('.following-title').evaluate(e=>getComputedStyle(e).fontWeight),'600');
  await page.locator('.home-nav .doodle-work').hover();await page.waitForTimeout(700);
  assert.ok(Number(await page.locator('.home-nav .doodle-work').getAttribute('data-hits'))>0);
  await page.evaluate(()=>scrollTo(0,1200));await page.waitForTimeout(500);
  assert.equal(await page.locator('.panel-media').evaluateAll(list=>list.reduce((sum,el)=>sum+el.getAnimations({subtree:true}).length,0)),0,'Selected project images never animate');
  assert.equal(await page.locator('.home-nav .hammer').evaluate(e=>e.getAnimations().length),0,'Work stops offscreen');
  await page.waitForTimeout(500);assert.equal(await page.locator('.ink-copy,.print-shutter').count(),0);
  for(const project of projects.filter(p=>p.url)){
   await page.goto(base+'/projetos/'+project.id+'.html');await page.waitForTimeout(700);
   const link=page.getByRole('link',{name:'Visitar o projeto',exact:true});
   assert.equal(await link.getAttribute('href'),project.url);assert.equal(await link.getAttribute('target'),'_blank');
   assert.match(await link.getAttribute('rel'),/noopener/);
   await link.scrollIntoViewIfNeeded();await link.hover();await page.waitForTimeout(200);
   assert.ok(await link.locator('.visit-window').evaluate(e=>e.getAnimations().length)>0);
   const contrast=await link.evaluate(el=>{
    const c=getComputedStyle(el),rgb=s=>{const v=s.match(/[\d.]+/g).slice(0,3).map(Number);return s.startsWith('color(')?v.map(x=>x*255):v;},lum=a=>a.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);
    const x=lum(rgb(c.color)),y=lum(rgb(c.backgroundColor));return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);
   });assert.ok(contrast>=4.5,project.id+' text contrast '+contrast);
   if(project.id==='qozt')await link.screenshot({path:path.resolve(__dirname,'../validacao/visitar-porta.png')});
   await page.setViewportSize({width:320,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await page.setViewportSize({width:1440,height:900});
  }
  for(const width of [1440,768,390,320]){
   await page.setViewportSize({width,height:900});await page.goto(base+'/encerramento.html');await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(800);
   assert.equal(await page.locator('.ink-copy').count(),0);
   const titles=await page.locator('.closing-stage h1>span').evaluateAll(list=>list.map(el=>({clip:getComputedStyle(el).clipPath,pad:parseFloat(getComputedStyle(el).paddingBottom),font:parseFloat(getComputedStyle(el).fontSize),line:parseFloat(getComputedStyle(el).lineHeight)})));
   assert.ok(titles.every(t=>t.clip==='none'&&t.pad>=t.font*.13&&t.line>t.font));
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await page.screenshot({path:path.resolve(__dirname,'../validacao/closing-refinado-'+width+'.png')});
  }
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/projetos/qozt.html');
  const visit=page.getByRole('link',{name:'Visitar o projeto',exact:true});await visit.scrollIntoViewIfNeeded();await visit.hover();
  assert.equal(await visit.locator('.visit-window').evaluate(e=>e.getAnimations().length),0);
  assert.equal(await page.locator('.ink-copy,.print-shutter').count(),0);
  const plain=await browser.newPage({javaScriptEnabled:false});await plain.goto(base+'/projetos/qozt.html');
  assert.equal(await plain.getByRole('link',{name:'Visitar o projeto',exact:true}).getAttribute('href'),'https://www.qozt.com.br/');
  assert.deepEqual(errors,[]);
  console.log('OK: nomes semibold, Work para fora da tela, entradas limpas, sete botões externos com contraste/hover, fechamento sem recorte em quatro larguras, reduced-motion e fallback sem JS.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
