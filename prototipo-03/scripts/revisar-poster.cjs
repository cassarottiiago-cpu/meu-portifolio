const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
const { createServer } = require('./servidor.cjs');
const out = path.resolve(__dirname, '../validacao/poster');
fs.mkdirSync(out, {recursive:true});
(async () => {
  const server=createServer();
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  const page=await browser.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try {
    for(const [width,height] of [[1440,900],[1366,768],[1024,768],[768,1024],[390,844],[320,740],[900,480]]){
      await page.setViewportSize({width,height});
      await page.goto(`http://127.0.0.1:${server.address().port}`);
      await page.evaluate(()=>document.fonts.ready);
      await page.locator('.scene-autopost img').evaluate(i=>i.decode());
      await page.waitForTimeout(850);
      await page.screenshot({path:path.join(out,`inicio-${width}.png`)});
      console.log(JSON.stringify(await page.evaluate(()=>({width:innerWidth,height:innerHeight,overflow:document.documentElement.scrollWidth-innerWidth,heroHeight:document.querySelector('.journey').offsetHeight,print:document.querySelector('.scene-autopost img').getBoundingClientRect().toJSON(),type:document.querySelector('.hero-type').getBoundingClientRect().toJSON(),header:document.querySelector('.masthead').getBoundingClientRect().toJSON()}))));
      if(width===1440){await page.mouse.move(500,220);await page.waitForTimeout(100);await page.screenshot({path:path.join(out,'ponteiro.png')});await page.evaluate(()=>scrollTo(0,320));await page.waitForTimeout(100);await page.screenshot({path:path.join(out,'scroll.png')});}
    }
    console.log({errors});
  } finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1});
