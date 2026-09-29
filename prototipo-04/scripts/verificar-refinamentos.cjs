const {chromium}=require('playwright-core');
const {default:AxeBuilder}=require('@axe-core/playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {createServer}=require('./servidor.cjs');
(async()=>{
 const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port,results=[];
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const context=await browser.newContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:844});await page.goto(base+'/encerramento.html');await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1100);
   assert.equal(await page.locator('.closing-capabilities>div').count(),3);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   const violations=(await new AxeBuilder({page}).analyze()).violations;assert.deepEqual(violations,[]);
   await page.screenshot({path:path.resolve(__dirname,'../validacao/fechamento-'+width+'.png'),fullPage:true});
   results.push({width,overflow:false,violations:0});
  }
  await page.goto(base);await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.home-nav .doodle-work').hover();assert.equal(await page.locator('.home-nav .hammer').evaluate(e=>e.getAnimations().length),0);
  await page.locator('.home-nav .doodle-work').focus();await page.keyboard.press('Enter');await page.waitForTimeout(250);assert.ok(page.url().endsWith('#trabalhos'));
  assert.equal(await page.locator('.project-story:visible').count(),4);
  assert.equal(await page.locator('.project-story:visible').first().getAttribute('data-project'),'autopost');
  assert.deepEqual(errors,[]);console.log('Refinamentos: encerramento em quatro larguras, axe, teclado e movimento reduzido aprovados.');
  fs.writeFileSync(path.resolve(__dirname,'../validacao/refinamentos.json'),JSON.stringify({passed:true,results},null,2));
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
