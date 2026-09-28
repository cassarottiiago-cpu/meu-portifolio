const {chromium}=require(process.env.PORTFOLIO_PLAYWRIGHT||'playwright-core');
const assert=require('node:assert/strict'),path=require('node:path');
const {createServer}=require('./servidor.cjs');
(async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
  const base='http://127.0.0.1:'+server.address().port;
  for(const width of [1440,390])for(const id of ['autopost','phron','qozt','natalia','dr-paulo','limozine','dominos','bmk-blink','odonto']){
   await page.setViewportSize({width,height:900});await page.goto(base+'/projetos/'+id+'.html');await page.evaluate(()=>document.fonts.ready);
   const heading=page.locator('.case-development h2');
   const original=await heading.innerHTML(),top=await heading.evaluate(e=>e.getBoundingClientRect().top+scrollY);
   const move=async fraction=>{await page.evaluate(y=>scrollTo(0,y),top-900*fraction);await page.waitForTimeout(100);};
   const times=()=>heading.evaluate(e=>e.getAnimations({subtree:true}).map(a=>a.currentTime));
   await move(.82);const early=await times();assert.ok(early.length>0);
   assert.equal(await heading.innerHTML(),original,'original DOM must remain unchanged during the reveal');
   assert.deepEqual(await heading.evaluate(e=>{const s=getComputedStyle(e);return [s.transform,s.clipPath];}),['none','none']);
   const firstOpacity=await heading.evaluate(e=>Number(getComputedStyle(e).opacity));
   await page.waitForTimeout(450);assert.deepEqual(await times(),early,'must stop when scrolling stops');
   await move(.67);const later=await times();assert.ok(later[0]>early[0]);
   assert.ok(await heading.evaluate(e=>Number(getComputedStyle(e).opacity))>firstOpacity);
   if(id==='phron')await page.screenshot({path:path.resolve(__dirname,'../validacao/frases-scroll-'+width+'.png')});
   await move(.82);assert.ok(Math.abs((await times())[0]-early[0])<2,'must reverse while entering');
   await move(.48);assert.ok((await times()).length>0,'the longer reveal must still be in progress');
   await move(.20);assert.equal(await heading.innerHTML(),original);assert.equal((await times()).length,0);assert.equal(await heading.evaluate(e=>getComputedStyle(e).opacity),'1');
   await move(.82);assert.equal(await heading.innerHTML(),original,'read text must not disappear again');
   assert.equal(await page.locator('.case-print').evaluateAll(nodes=>nodes.reduce((n,e)=>n+e.getAnimations({subtree:true}).length,0)),0);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/projetos/phron.html');await page.evaluate(()=>document.fonts.ready);
  await page.locator('.case-development h2').scrollIntoViewIfNeeded();assert.equal(await page.locator('.case-reveal-layer').count(),0);
  assert.deepEqual(errors,[]);console.log('OK: nove casos desktop/mobile; progresso ligado ao scroll, pausa, reversão parcial, conclusão estável, prints imóveis e reduced-motion.');
 }finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
