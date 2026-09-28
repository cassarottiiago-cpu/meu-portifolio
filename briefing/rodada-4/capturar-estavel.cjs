const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
const sharp = require('C:/Users/iago cassarotti/site-nat-work/node_modules/sharp');
const out = path.join(__dirname, 'acervo');
const targets = [
  ['paulo-live', 'https://drpaulo-eight.vercel.app/'],
  ['bmk-blink', 'https://blink.bmkgow.com/'],
  ['limozine', 'https://lplimozine-nu.vercel.app/']
];
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  try {
    for (const [id, url] of targets) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
      try {
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(7000);
        const reject = page.getByRole('button', { name: /RECUSAR|REJEITAR/i }).first();
        if (await reject.isVisible().catch(() => false)) await reject.click().catch(() => {});
        await page.waitForTimeout(1200);
        const record = await page.evaluate(() => ({ title: document.title, text: document.body.innerText.slice(0, 18000), headings: [...document.querySelectorAll('h1,h2,h3')].map(e => e.innerText).filter(Boolean), images: [...document.images].map(img => ({ src: img.currentSrc || img.src, complete: img.complete, width: img.naturalWidth, height: img.naturalHeight })).filter(img => img.src), links: [...document.querySelectorAll('a[href]')].map(e => ({ text: e.innerText.trim(), href: e.href })).filter(e => e.text).slice(0, 60), scripts: [...document.scripts].map(e => e.src).filter(Boolean) }));
        const image = await page.screenshot();
        await sharp(image).webp({ quality: 92 }).toFile(path.join(out, id + '-2x.webp'));
        await sharp(image).resize(1200).png().toFile(path.join(out, id + '.png'));
        await page.evaluate(() => scrollTo(0, innerHeight * 1.2));
        await page.waitForTimeout(900);
        await sharp(await page.screenshot()).resize(1440).webp({ quality: 88 }).toFile(path.join(out, id + '-detalhe.webp'));
        fs.writeFileSync(path.join(out, id + '.json'), JSON.stringify({ id, url, status: response?.status(), finalUrl: page.url(), capturedAt: new Date().toISOString(), ...record }, null, 2));
        console.log(id + ': ' + response?.status() + ' ' + record.title + ' images=' + record.images.length);
      } catch (error) { console.error(id + ': ' + error.message); }
      finally { await page.close(); }
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
