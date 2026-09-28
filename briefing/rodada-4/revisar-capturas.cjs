const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
const sharp = require('C:/Users/iago cassarotti/site-nat-work/node_modules/sharp');
const assets = path.resolve(__dirname, '../../prototipo-03/assets');
const records = path.join(__dirname, 'acervo');
async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(8000);
  await page.evaluate(async () => {
    const images = [...document.images].filter(img => img.getBoundingClientRect().top < innerHeight * 2);
    await Promise.race([Promise.all(images.map(img => img.decode().catch(() => {}))), new Promise(r => setTimeout(r, 5000))]);
  });
}
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  try {
    for (const [id, url, mobileOnly] of [['dominos', 'https://dominosblink.vercel.app/', false], ['bmk-blink', 'https://blink.bmkgow.com/', true]]) {
      for (const mobile of mobileOnly ? [true] : [false, true]) {
        const page = await browser.newPage({ viewport: mobile ? { width: 430, height: 900 } : { width: 1440, height: 1000 }, deviceScaleFactor: 2, isMobile: mobile, hasTouch: mobile });
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await settle(page);
        const record = await page.evaluate(() => ({ title: document.title, text: document.body.innerText, images: [...document.images].map(i => ({ src: i.currentSrc, width: i.naturalWidth, height: i.naturalHeight })), links: [...document.querySelectorAll('a[href]')].map(a => ({ text: a.innerText, href: a.href })) }));
        const frame = await page.screenshot();
        const suffix = mobile ? '-mobile' : '-2x';
        await sharp(frame).webp({ quality: 92 }).toFile(path.join(assets, id + suffix + '.webp'));
        await sharp(frame).resize(mobile ? 430 : 1200).png().toFile(path.join(records, id + suffix + '-review.png'));
        if (!mobile) {
          await sharp(frame).resize(1600).webp({ quality: 88 }).toFile(path.join(assets, id + '.webp'));
          await page.evaluate(() => scrollTo(0, innerHeight * 1.2));
          await page.waitForTimeout(1600);
          await sharp(await page.screenshot()).resize(1440).webp({ quality: 90 }).toFile(path.join(assets, id + '-detalhe.webp'));
        }
        fs.writeFileSync(path.join(records, id + suffix + '-revisao.json'), JSON.stringify({ url, status: response.status(), captured: new Date().toISOString(), ...record }, null, 2));
        console.log(JSON.stringify({ id, mobile, status: response.status(), title: record.title, text: record.text.slice(0, 600) }));
        await page.close();
      }
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
