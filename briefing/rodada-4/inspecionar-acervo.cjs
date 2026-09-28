const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
const sharp = require('C:/Users/iago cassarotti/site-nat-work/node_modules/sharp');
const out = path.join(__dirname, 'acervo');
const sites = [
  ['hachimitsu', 'https://hachimitsuatelierdedelicias.vercel.app/'],
  ['flamex', 'https://lp.flamexfranchising.com.br/'],
  ['bmk', 'https://bmk-omega.vercel.app/'],
  ['brave', 'https://blinkbrave.vercel.app/'],
  ['odonto', 'https://lpodcmorroagudo.vercel.app/'],
  ['union', 'https://blinkunionbiologicals-gilt.vercel.app/'],
  ['galpao', 'https://lpgalpaonelore.vercel.app/']
];
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  try {
    const records = [];
    for (let i = 0; i < sites.length; i += 3) {
      await Promise.all(sites.slice(i, i + 3).map(async ([id, url]) => {
        const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
        try {
          const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
          await page.evaluate(() => document.fonts.ready);
          await page.waitForTimeout(700);
          const record = await page.evaluate(() => ({ title: document.title,
            headings: [...document.querySelectorAll('h1,h2,h3')].map(e => e.innerText).filter(Boolean),
            text: document.body.innerText.slice(0, 13000),
            scripts: [...document.scripts].map(e => e.src).filter(Boolean),
            links: [...document.querySelectorAll('a[href]')].map(e => ({ text: e.innerText.trim(), href: e.href })).filter(e => e.text).slice(0, 45),
            controls: [...document.querySelectorAll('button,input,select,textarea')].map(e => ({ tag: e.tagName, type: e.type, label: e.innerText || e.placeholder || e.name })).slice(0, 35)
          }));
          const first = await page.screenshot();
          await sharp(first).webp({ quality: 92 }).toFile(path.join(out, id + '-2x.webp'));
          await sharp(first).resize(1200).png().toFile(path.join(out, id + '.png'));
          await page.evaluate(() => scrollTo(0, innerHeight * 1.2));
          await page.waitForTimeout(500);
          await sharp(await page.screenshot()).resize(1440).webp({ quality: 87 }).toFile(path.join(out, id + '-detalhe.webp'));
          records.push({ id, url, status: response.status(), capturedAt: new Date().toISOString(), ...record });
          console.log(id + ': ' + response.status() + ' ' + record.title);
        } catch (error) { records.push({ id, url, error: error.message }); console.log(id + ': ' + error.message); }
        finally { await page.close(); }
      }));
    }
    fs.writeFileSync(path.join(out, 'inspecao.json'), JSON.stringify(records, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
