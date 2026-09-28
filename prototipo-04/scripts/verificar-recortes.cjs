const {chromium}=require(process.env.PORTFOLIO_PLAYWRIGHT||'playwright-core');
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {createServer}=require('./servidor.cjs');
(async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const folder=path.resolve(__dirname,'../validacao/recortes');fs.mkdirSync(folder,{recursive:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  const base='http://127.0.0.1:'+server.address().port;
  const scrollTo=selector=>page.locator(selector).evaluate(e=>scrollTo(0,scrollY+e.getBoundingClientRect().top-innerHeight*.4));
  for(const width of [1440,390,320]){
   await page.setViewportSize({width,height:900});await page.goto(base);await page.evaluate(()=>document.fonts.ready);
   await scrollTo('[data-project=autopost]');await page.waitForTimeout(1000);
   // Mobile reading line sits directly below the caption, not at 40vh.
   await page.locator('[data-project=dr-paulo]').evaluate(e=>scrollTo(0,scrollY+e.getBoundingClientRect().top-(innerWidth<=700?140:innerHeight*.3)));
   await page.waitForFunction(()=>document.querySelectorAll('.title-splice-band').length===3);
   await page.evaluate(()=>document.querySelectorAll('.title-splice-track').forEach(e=>e.getAnimations().forEach(a=>{a.pause();a.currentTime=400;})));
   await page.screenshot({path:path.join(folder,'nomes-'+width+'.png')});
   assert.equal(await page.locator('.title-splice').count(),1);
   await page.evaluate(()=>document.querySelectorAll('.title-splice-track').forEach(e=>e.getAnimations().forEach(a=>a.play())));
   await page.waitForTimeout(1100);
   assert.equal(await page.locator('.following-title').innerText(),'Dr. Paulo');
   for(const id of ['qozt','natalia','dr-paulo','autopost']){
    await page.locator('[data-project='+id+']').evaluate(e=>scrollTo(0,scrollY+e.getBoundingClientRect().top-(innerWidth<=700?140:innerHeight*.3)));
    await page.waitForTimeout(70);assert.ok(await page.locator('.title-splice').count()<=1);
   }
   await page.waitForTimeout(2000);assert.equal(await page.locator('.following-title').innerText(),'AUTOPOST');
   assert.equal(await page.locator('.title-splice').count(),0);
  }
  for(const width of [1440,390])for(const id of ['autopost','phron','qozt','natalia','dr-paulo','limozine','dominos','bmk-blink','odonto']){
   await page.setViewportSize({width,height:900});await page.goto(base+'/projetos/'+id+'.html');await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.locator('.case-line').evaluate(e=>e.getAnimations().length),0);
   const selector=width<700?'.case-development h2':'.case-context h2';
   const title=page.locator(selector),before=await title.evaluate(e=>({html:e.innerHTML,height:e.offsetHeight,width:e.offsetWidth}));
   const alreadyVisible=await title.evaluate(e=>e.getBoundingClientRect().top<innerHeight);
   console.log('Case',id,width,alreadyVisible?'initially visible':'enter on scroll');
   await title.evaluate(e=>scrollTo(0,scrollY+e.getBoundingClientRect().top-innerHeight*.72));
   if(alreadyVisible){assert.equal(await title.locator('.case-reveal-layer').count(),0);continue;}
   await page.waitForFunction(selector=>document.querySelector(selector).getAnimations().length>0,selector);
   const during=await title.evaluate(e=>({height:e.offsetHeight,width:e.offsetWidth}));
   assert.equal(during.height,before.height);assert.equal(during.width,before.width);
   await title.evaluate(e=>e.getAnimations({subtree:true}).forEach(a=>{a.pause();a.currentTime=380;}));
   if(['phron','dr-paulo','qozt'].includes(id))await page.screenshot({path:path.join(folder,id+'-'+width+'-mid.png')});
   await title.evaluate(e=>e.getAnimations({subtree:true}).forEach(a=>{a.currentTime=999.99;}));
   if(['phron','dr-paulo','qozt'].includes(id))await page.screenshot({path:path.join(folder,id+'-'+width+'-assembled.png')});
   await title.evaluate(e=>scrollTo(0,scrollY+e.getBoundingClientRect().top-innerHeight*.20));await page.waitForTimeout(100);
   assert.deepEqual(await title.evaluate(e=>({html:e.innerHTML,height:e.offsetHeight,width:e.offsetWidth})),before);
   assert.equal(await title.evaluate(e=>getComputedStyle(e).clipPath),'none');
   if(['phron','dr-paulo','qozt'].includes(id))await page.screenshot({path:path.join(folder,id+'-'+width+'-final.png')});
   assert.equal(await page.locator('.case-print').evaluateAll(list=>list.reduce((n,e)=>n+e.getAnimations({subtree:true}).length,0)),0);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/projetos/phron.html');await page.evaluate(()=>document.fonts.ready);await scrollTo('.case-context h2');await page.waitForTimeout(100);
  assert.equal(await page.locator('.case-reveal-layer').count(),0);
  await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(base+'/projetos/phron.html');await page.evaluate(()=>document.fonts.ready);await page.locator('.case-development h2').evaluate(e=>scrollTo(0,scrollY+e.getBoundingClientRect().top-innerHeight*.72));
  await page.waitForFunction(()=>document.querySelector('.case-development h2').getAnimations().length>0);
  await page.setViewportSize({width:700,height:900});await page.waitForTimeout(100);
  assert.equal(await page.locator('.case-reveal-layer,.case-reveal-active').count(),0);
  const fallback=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
  await fallback.goto(base+'/projetos/phron.html');assert.ok(await fallback.locator('.case-line').isVisible());assert.equal(await fallback.locator('.case-reveal-layer').count(),0);await fallback.close();
  assert.deepEqual(errors,[]);
  console.log('OK: 3 larguras, reversão rápida, 9 casos em desktop/mobile, geometria e HTML intactos após entrada, prints estáticos e reduced-motion.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
