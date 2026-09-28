const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
const { createServer } = require('./servidor.cjs');
(async () => {
  const out = path.resolve(__dirname, '../validacao/abertura-21');
  fs.mkdirSync(out, { recursive: true });
  const server = createServer();
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  try {
    const page = await browser.newPage();
    page.on('pageerror', e => console.error(e));
    for (const [width,height] of [[1440,1000],[1366,768],[390,844],[320,740]]) {
      await page.setViewportSize({width,height});
      await page.goto('http://127.0.0.1:' + server.address().port);
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => Promise.all([...document.querySelectorAll('.scene img')].map(img => img.decode())));
      for (const p of [0,.1,.22,.37,.51,.625,.755,.88]) {
        await page.evaluate(p => scrollTo(0, (document.querySelector('.journey').offsetHeight - innerHeight)*p), p);
        await page.waitForTimeout(90);
        await page.screenshot({path:path.join(out,`${width}-${p}.png`)});
      }
    }
    console.log(out);
  } finally { await browser.close(); await new Promise(r=>server.close(r)); }
})().catch(e=>{console.error(e);process.exitCode=1});
