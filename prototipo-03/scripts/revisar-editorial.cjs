const fs = require('node:fs');
const path = require('node:path');
const { createServer } = require('./servidor.cjs');
const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
const out = path.resolve(__dirname, '../validacao/editorial');
fs.mkdirSync(out, { recursive: true });
(async () => {
  const server = createServer();
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const base = 'http://127.0.0.1:' + server.address().port;
    page.on('pageerror', error => console.error(error.message));
    const shot = async name => { await page.waitForTimeout(1250); await page.screenshot({ path: path.join(out, name + '.png') }); };
    await page.goto(base, { waitUntil: 'networkidle' });
    for (const [name, progress] of [['hero', 0], ['phron', .37], ['qozt', .625], ['natalia', .88]]) {
      await page.evaluate(p => scrollTo(0, (document.querySelector('.journey').offsetHeight - innerHeight) * p), progress);
      await shot(name);
    }
    await page.locator('#trabalhos').scrollIntoViewIfNeeded(); await shot('continua');
    await page.locator('#dr-paulo').scrollIntoViewIfNeeded(); await shot('paulo-home');
    await page.goto(base + '/projetos.html', { waitUntil: 'networkidle' }); await shot('arquivo-top');
    for (const entry of await page.locator('.archive-entry').all()) { await entry.scrollIntoViewIfNeeded(); await page.waitForTimeout(1250); }
    await page.screenshot({ path: path.join(out, 'arquivo-inteiro.png'), fullPage: true });
    await page.goto(base + '/projetos/dominos.html', { waitUntil: 'networkidle' }); await shot('dominos-case');
    await page.locator('.print-spread').scrollIntoViewIfNeeded(); await shot('dominos-prints');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base); await shot('mobile-hero');
    await page.locator('#dr-paulo').scrollIntoViewIfNeeded(); await shot('mobile-paulo');
    await page.goto(base + '/projetos.html'); await shot('mobile-arquivo');
    await page.locator('[data-project=dominos]').scrollIntoViewIfNeeded(); await shot('mobile-links');
    console.log('Capturas de revisão em ' + out);
  } finally { await browser.close(); await new Promise(r => server.close(r)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
