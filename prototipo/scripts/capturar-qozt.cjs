const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
const sharp = require('C:/Users/iago cassarotti/site-nat-work/node_modules/sharp');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
    const response = await page.goto('https://www.qozt.com.br/', { waitUntil: 'networkidle', timeout: 45000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1500);
    const screenshot = await page.screenshot();
    await sharp(screenshot).webp({ quality: 87 }).toFile(path.join(__dirname, '../assets/qozt.webp'));
    fs.writeFileSync(path.join(__dirname, '../assets/qozt-source.json'), JSON.stringify({ url: page.url(), capturedAt: new Date().toISOString(), status: response.status(), title: await page.title(), width: 1440, height: 1000, note: 'Captura visual do site indicado por Iago; as alegações comerciais da página não são métricas verificadas do portfólio.' }, null, 2));
    console.log({ status: response.status(), title: await page.title(), file: 'assets/qozt.webp' });
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
