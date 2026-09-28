const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
const sharp = require('C:/Users/iago cassarotti/site-nat-work/node_modules/sharp');
const { createServer } = require('../../prototipo-03/scripts/servidor.cjs');
const out = path.join(__dirname, 'acervo');
const media = path.join(__dirname, 'esportes');
const clips = [
  ['skate', 'https://mixkit.co/free-stock-video/a-skater-doing-skateboarding-on-a-vert-ramp-1366/'],
  ['surf', 'https://mixkit.co/free-stock-video/person-surfing-1127/'],
  ['neve', 'https://mixkit.co/free-stock-video/person-practicing-snowboarding-3373/'],
  ['salto', 'https://mixkit.co/free-stock-video/extreme-skydiving-3478/']
];
(async () => {
  fs.mkdirSync(media, { recursive: true });
  const server = createServer('C:/Users/iago cassarotti/BMK/site/dist');
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
    await page.goto('http://127.0.0.1:' + server.address().port, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1400);
    const broken = await page.locator('img').evaluateAll(items => items.filter(img => img.complete && !img.naturalWidth).map(img => img.src));
    if (broken.length) throw Error('Imagens não carregadas na origem: ' + broken.join(', '));
    const facts = await page.evaluate(() => ({ text: document.body.innerText, headings: [...document.querySelectorAll('h1,h2,h3')].map(e => e.innerText) }));
    if (!/Paulo/i.test(facts.text)) throw Error('A versão local não identifica Dr. Paulo.');
    await sharp(await page.screenshot()).webp({ quality: 92 }).toFile(path.join(out, 'dr-paulo-2x.webp'));
    await sharp(await page.screenshot()).resize(1200).png().toFile(path.join(out, 'dr-paulo.png'));
    await page.evaluate(() => scrollTo(0, innerHeight * 3.3));
    await page.waitForTimeout(800);
    await sharp(await page.screenshot()).resize(1440).webp({ quality: 88 }).toFile(path.join(out, 'dr-paulo-detalhe.webp'));
    fs.writeFileSync(path.join(out, 'dr-paulo.json'), JSON.stringify({ source: 'C:/Users/iago cassarotti/BMK/site/dist', capturedAt: new Date().toISOString(), ...facts }, null, 2));
    console.log('Dr. Paulo capturado, sem alterar o projeto de origem.');
    if (process.argv.includes('--paulo')) return;
    const records = [];
    for (const [id, url] of clips) {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      const record = await page.evaluate(() => ({ text: document.body.innerText, videos: [...document.querySelectorAll('video,video source')].map(e => e.src || e.currentSrc).filter(Boolean), inputs: [...document.querySelectorAll('input')].map(e => ({ name: e.name, value: e.value, data: {...e.dataset} })), forms: [...document.forms].map(e => ({ action: e.action, html: e.outerHTML.slice(0, 14000) })) }));
      records.push({ id, url, checkedAt: new Date().toISOString(), ...record });
      console.log(JSON.stringify({ id, ...record }));
    }
    fs.writeFileSync(path.join(media, 'origens.json'), JSON.stringify(records, null, 2));
    await page.goto('https://mixkit.co/license/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'View License', exact: true }).first().click();
    const license = await page.locator('body').innerText();
    fs.writeFileSync(path.join(media, 'licenca-observada.txt'), license);
    console.log('LICENÇA: ' + license);
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
