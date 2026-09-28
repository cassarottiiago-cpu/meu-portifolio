const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
const { createServer } = require('./servidor.cjs');
const out = path.resolve(__dirname,'../validacao/formacao-24');
fs.mkdirSync(out,{recursive:true});
(async()=>{
  const server=createServer(); await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  try {
    const report=[];
    for(const [label,width,height] of [['desktop',1440,1000],['notebook',1366,768],['mobile',390,844]]) {
      const page=await browser.newPage({viewport:{width,height}});
      page.on('pageerror',e=>console.log('PAGE ERROR',e.message));
      await page.goto(`http://127.0.0.1:${server.address().port}`,{waitUntil:'networkidle'});
      await page.evaluate(()=>document.fonts.ready);
      for(const progress of [0,.22,.48,.84]) {
        await page.evaluate(p=>scrollTo(0,(document.querySelector('.journey').offsetHeight-innerHeight)*p),progress);
        await page.waitForTimeout(150);
        await page.screenshot({path:path.join(out,`${label}-${progress}.png`)});
        report.push({label,progress,pieces:await page.locator('.scene').evaluateAll(list=>list.map(e=>{const r=e.getBoundingClientRect();return{id:e.dataset.piece,x:r.x,y:r.y,w:r.width,h:r.height,inert:e.inert};}))});
      }
      await page.close();
    }
    fs.writeFileSync(path.join(out,'geometry.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify(report));
  } finally {await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
