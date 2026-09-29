const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createServer}=require('./servidor.cjs');
const output=path.resolve(__dirname,'../validacao/scroll-fechamento');
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
  page.on('pageerror',e=>{errors.push(String(e));console.error('Browser error at',page.url(),e.stack);});
  const base='http://127.0.0.1:'+server.address().port;
  for(const width of [1440,390,320]){
   await page.setViewportSize({width,height:900});await page.goto(base);await page.evaluate(()=>document.fonts.ready);
   const ids=await page.locator('[data-project]').evaluateAll(list=>list.map(e=>e.dataset.project));
   for(const id of [...ids,...ids.slice().reverse()]){
    await page.locator('[data-project='+id+']').evaluate(el=>scrollTo(0,scrollY+el.getBoundingClientRect().top-(innerWidth<=700?document.querySelector('.following-project').offsetHeight+24:innerHeight*.3)));
    await page.waitForTimeout(1000);
    assert.equal(await page.locator('.following-project').getAttribute('data-active'),id,JSON.stringify(await page.evaluate(()=>({width:innerWidth,rail:document.querySelector('.following-project').getBoundingClientRect().toJSON(),panels:[...document.querySelectorAll('[data-project]')].map(e=>({id:e.dataset.project,top:e.getBoundingClientRect().top}))}))));
    assert.match(await page.locator('.following-project a').getAttribute('href'),new RegExp(id+'\\.html$'),JSON.stringify(await page.evaluate(()=>({width:innerWidth,active:document.querySelector('.following-project').dataset.active,rail:document.querySelector('.following-project').getBoundingClientRect().toJSON(),panels:[...document.querySelectorAll('[data-project]')].map(e=>({id:e.dataset.project,top:e.getBoundingClientRect().top}))}))));
    assert.equal(await page.locator('[data-project='+id+'] img').count(),1);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   }
   await page.screenshot({path:path.join(output,'scroll-'+width+'.png')});
  }
  await page.goto(base+'/projetos/phron.html');
  assert.match(await page.locator('.case-meta').innerText(),/em desenvolvimento/);
  assert.match(await page.locator('.case-context').innerText(),/ainda não um produto finalizado/);
  await page.screenshot({path:path.join(output,'phron-mobile.png')});
  await page.setViewportSize({width:1440,height:900});await page.goto(base+'/encerramento.html');
  await page.locator('.closing-bottom a').click();await page.waitForTimeout(800);
  assert.equal(await page.locator('.replay-curtain').count(),1);
  await page.screenshot({path:path.join(output,'vinheta.png')});
  await page.waitForURL('**/index.html?replay=1#inicio');await page.waitForTimeout(1200);
  assert.equal(await page.locator('.replay-reveal').count(),0);assert.equal(await page.evaluate(()=>scrollY),0);
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base);
  await page.locator('[data-project=limozine]').evaluate(el=>el.scrollIntoView());await page.waitForTimeout(100);
  assert.equal(await page.locator('.following-project').getAttribute('data-active'),'limozine');
  assert.equal(await page.locator('.following-title span').evaluate(el=>el.getAnimations().length),0);
  const plain=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const nojs=await plain.newPage();await nojs.goto(base);
  assert.equal(await nojs.locator('.panel-heading:visible').count(),4);
  await nojs.goto(base+'/encerramento.html');assert.equal(await nojs.locator('.closing-bottom a').count(),1);
  assert.deepEqual(errors,[]);
  console.log('OK: scroll reversível em 3 larguras, links sincronizados, PHRON, vinheta manual, reduced-motion e fallback sem JS.');
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
