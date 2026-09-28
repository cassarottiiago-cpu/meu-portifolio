const {chromium}=require(process.env.PORTFOLIO_PLAYWRIGHT||'playwright-core');
const assert=require('node:assert/strict'),path=require('node:path');
const {createServer}=require('./servidor.cjs');
(async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.addInitScript(()=>{window.frameCount=0;const raf=requestAnimationFrame;window.requestAnimationFrame=cb=>raf(t=>{frameCount++;cb(t);});});
  const base='http://127.0.0.1:'+server.address().port;
  await page.goto(base);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(150);
  const start=await page.locator('canvas').evaluate(c=>c.toDataURL());
  await page.screenshot({path:path.resolve(__dirname,'../validacao/hero-montagem.png')});
  await page.waitForTimeout(1600);
  assert.notEqual(await page.locator('canvas').evaluate(c=>c.toDataURL()),start);
  const frames=await page.evaluate(()=>frameCount);await page.waitForTimeout(350);assert.equal(await page.evaluate(()=>frameCount),frames);
  assert.equal(await page.locator('.replay-curtain,.replay-reveal').count(),0);
  await page.locator('[data-project=autopost]').evaluate(e=>scrollTo(0,scrollY+e.getBoundingClientRect().top-innerHeight*.3));await page.waitForTimeout(750);
  await page.locator('[data-project=dr-paulo]').evaluate(e=>scrollTo(0,scrollY+e.getBoundingClientRect().top-innerHeight*.3));await page.waitForTimeout(120);
  assert.equal(await page.locator('.following-outgoing').count(),0);
  assert.equal(await page.locator('.following-title>span').count(),1);
  assert.equal(await page.locator('.title-splice-track').first().evaluate(e=>e.getAnimations()[0].effect.getTiming().duration),780);
  await page.screenshot({path:path.resolve(__dirname,'../validacao/nome-transicao-suave.png')});
  for(const id of ['qozt','natalia','dr-paulo','autopost']){await page.locator('[data-project='+id+']').evaluate(e=>scrollTo(0,scrollY+e.getBoundingClientRect().top-innerHeight*.3));await page.waitForTimeout(60);assert.ok(await page.locator('.following-outgoing').count()<=1);}
  await page.waitForTimeout(2000);assert.equal(await page.locator('.title-splice').count(),0);
  assert.equal(await page.locator('.following-title').innerText(),'AUTOPOST');
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:900});await page.goto(base+'/projetos/phron.html');await page.waitForTimeout(100);
   assert.equal(await page.locator('.case-line .phrase-word').count(),0);
   const initial=await page.locator('.case-line').evaluate(e=>({html:e.innerHTML,height:e.offsetHeight}));
   await page.waitForTimeout(950);assert.equal(await page.locator('.phrase-word').count(),0);
   assert.deepEqual(await page.locator('.case-line').evaluate(e=>({html:e.innerHTML,height:e.offsetHeight})),initial);
   await page.locator('.case-context h2').evaluate(e=>scrollTo(0,scrollY+e.getBoundingClientRect().top-innerHeight*.4));await page.waitForTimeout(100);
   assert.equal(await page.locator('.case-context h2').evaluate(e=>getComputedStyle(e).clipPath),'none');
   await page.screenshot({path:path.resolve(__dirname,'../validacao/frases-phron-'+width+'.png')});
   await page.waitForTimeout(1100);assert.equal(await page.locator('.case-reveal-layer').count(),0);
   assert.equal(await page.locator('.case-print').evaluateAll(list=>list.reduce((n,e)=>n+e.getAnimations({subtree:true}).length,0)),0);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/projetos/phron.html');await page.waitForTimeout(100);
  assert.equal(await page.locator('.phrase-word').count(),0);
  await page.goto(base);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(200);
  assert.equal(await page.locator('.intro-type').evaluate(e=>e.getAnimations({subtree:true}).length),0);
  assert.deepEqual(errors,[]);
  console.log('OK: hero termina e fica ociosa; nomes sem duplicação; frases sem alterar DOM ou altura; prints estáticos; desktop/mobile/reduced-motion.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
