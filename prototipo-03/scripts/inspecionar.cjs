const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
const { createServer } = require('./servidor.cjs');
const out = path.resolve(__dirname, '../validacao');
fs.mkdirSync(out, { recursive: true });
(async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
    await page.goto(`http://127.0.0.1:${server.address().port}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    for (const [width, height, progressList] of [[1440, 1000, [0, .11, .23, .37, .51, .625, .755, .88]], [390, 844, [0, .14, .37, .625]], [1366, 768, [0, .37]], [320, 740, [0]]]) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(80);
      for (const progress of progressList) {
        await page.evaluate(p => scrollTo({ top: (document.querySelector('.journey').offsetHeight - document.querySelector('.stage').clientHeight) * p, behavior: 'instant' }), progress);
        await page.waitForTimeout(100);
        await page.screenshot({ path: path.join(out, `tela-${width}-${String(progress).replace('.', '_')}.png`) });
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator('#trabalhos').scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(out, 'indice-desktop.png') });
    await page.locator('#dr-paulo .work-cover').click();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(out, 'caso-desktop.png') });
    const base = `http://127.0.0.1:${server.address().port}`;
    for (const [width, height] of [[1440, 1000], [390, 844], [320, 740]]) {
      await page.setViewportSize({ width, height });
      await page.goto(base + '/projetos.html');
      await page.evaluate(() => Promise.all([...document.images].map(img => { img.loading = 'eager'; return img.decode(); })));
      await page.screenshot({ path: path.join(out, `arquivo-${width}.png`), fullPage: true });
      await page.goto(base + '/projetos/dr-paulo.html');
      await page.evaluate(() => Promise.all([...document.images].map(img => { img.loading = 'eager'; return img.decode(); })));
      await page.screenshot({ path: path.join(out, `paulo-${width}.png`), fullPage: true });
      await page.goto(base);
      await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForFunction(() => document.querySelector('video').readyState >= 2);
      await page.locator('video').evaluate(v => { v.pause(); v.currentTime = 9; });
      await page.waitForTimeout(180);
      await page.screenshot({ path: path.join(out, `rodape-${width}.png`) });
    }
    console.log('Capturas geradas em ' + out);
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
