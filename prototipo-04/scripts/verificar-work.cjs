const {chromium}=require(process.env.PORTFOLIO_PLAYWRIGHT||'playwright-core');
const assert=require('node:assert/strict'),path=require('node:path');
const {createServer}=require('./servidor.cjs');
(async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:'+server.address().port);await page.evaluate(()=>document.fonts.ready);
  const work=page.locator('.home-nav .doodle-work');assert.ok((await work.boundingBox()).height<=44);
  assert.equal(await page.locator('.replay-reveal,.replay-curtain').count(),0);
  await work.hover();await page.waitForTimeout(310);
  await page.screenshot({path:path.resolve(__dirname,'../validacao/work-impacto.png'),clip:{x:1010,y:0,width:430,height:135}});
  await page.waitForTimeout(2750);
  assert.equal(await work.locator('.letter-piece').count(),0);
  assert.ok(Number(await work.getAttribute('data-hits'))>=5);
  const displaced=await work.locator('.button-letter').evaluateAll(list=>list.filter(e=>getComputedStyle(e).transform!=='none').length);assert.equal(displaced,4);
  await page.screenshot({path:path.resolve(__dirname,'../validacao/work-video-recriado.png'),clip:{x:1010,y:0,width:430,height:135}});
  await page.mouse.move(300,400);assert.equal(await work.getAttribute('data-hits'),null);
  assert.equal(await work.locator('.button-letter').first().evaluate(e=>getComputedStyle(e).transform),'none');
  await page.emulateMedia({reducedMotion:'reduce'});await work.hover();assert.equal(await work.locator('.hammer').evaluate(e=>e.getAnimations().length),0);
  await work.click();assert.ok(page.url().endsWith('#trabalhos'));assert.equal(await page.locator('.project-story img').count(),4);assert.equal(await page.locator('.project-story:visible').count(),4);
  await page.locator('.project-story img').evaluateAll(list=>Promise.all(list.map(i=>{i.loading='eager';return i.decode();})));
  await page.locator('.work-stage').screenshot({path:path.resolve(__dirname,'../validacao/projetos-continuos.png')});
  assert.equal(await page.locator('.following-title').evaluate(e=>getComputedStyle(e).color),'rgb(189, 41, 31)');
  for(const width of [390,320]){await page.setViewportSize({width,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html?replay=1#inicio');
  assert.equal(await page.locator('.replay-reveal,.replay-curtain').count(),0);
  await page.emulateMedia({reducedMotion:'no-preference'});await page.reload();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1200);
  assert.equal(await page.locator('.intro-type').evaluate(e=>e.getAnimations({subtree:true}).filter(a=>a.playState==='running').length),0);
  assert.deepEqual(errors,[]);console.log('Work: batidas contínuas, letras inteiras, reset, botão compacto, reduced-motion e link nativo aprovados. Títulos vermelhos; abertura sem vinheta adicional e animação breve.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
