const {chromium}=require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
const assert=require('node:assert/strict'),path=require('node:path');
const {createServer}=require('./servidor.cjs');
(async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:'+server.address().port);await page.evaluate(()=>document.fonts.ready);
  const work=page.locator('.home-nav .doodle-work');assert.ok((await work.boundingBox()).height<=44);
  await work.hover();await page.waitForTimeout(2150);
  assert.equal(await work.locator('.letter-piece').count(),12);
  const broken=await work.locator('.letter-piece').evaluateAll(list=>list.filter(e=>Number(getComputedStyle(e).opacity)>.8&&getComputedStyle(e).transform!=='none').length);assert.equal(broken,12);
  await page.screenshot({path:path.resolve(__dirname,'../validacao/work-fragmentado.png'),clip:{x:1010,y:0,width:430,height:135}});
  await page.waitForTimeout(900);assert.equal(await work.locator('.letter-piece').first().evaluate(e=>getComputedStyle(e).opacity),'0');
  await page.mouse.move(300,400);await page.emulateMedia({reducedMotion:'reduce'});await work.hover();assert.equal(await work.locator('.letter-piece').first().evaluate(e=>e.getAnimations().length),0);
  await work.click();assert.ok(page.url().endsWith('#trabalhos'));assert.equal(await page.locator('.project-story img').count(),4);assert.equal(await page.locator('.project-story:visible').count(),4);
  await page.locator('.project-story img').evaluateAll(list=>Promise.all(list.map(i=>{i.loading='eager';return i.decode();})));
  await page.locator('.work-stage').screenshot({path:path.resolve(__dirname,'../validacao/projetos-continuos.png')});
  assert.deepEqual(errors,[]);console.log('Work: 12 fragmentos, recomposição, botão compacto, reduced-motion e link nativo aprovados. Home: quatro trabalhos contínuos, um print por trabalho.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
