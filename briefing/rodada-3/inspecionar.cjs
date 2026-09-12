const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
const targets = [
  ['dia', 'https://www.dia.studio/'],
  ['html', 'https://kitasenjudesign.com/html/'],
  ['order', 'https://order.design/project/all-the-streets-are-silent'],
  ['demo', 'https://studiodumbar.com/work/demo-2025'],
  ['ordinary', 'https://www.ordinaryfolk.co/'],
  ['adidas', 'https://www.dia.studio/work/adidas-sb'],
  ['space10', 'https://www.dia.studio/work/space10'],
  ['scan-type', 'https://www.dia.studio/work/scan-type'],
];
const selected = process.argv.find(arg => arg.startsWith('--ids='))?.slice(6).split(',');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--mute-audio'] });
  const results = [];
  const out = path.join(__dirname, 'capturas');
  fs.mkdirSync(out, { recursive: true });
  try {
    let next = 0;
    const queue = targets.filter(([id]) => !selected || selected.includes(id));
    await Promise.all(Array.from({ length: 2 }, async () => {
      while (next < queue.length) {
        const [id, url] = queue[next++];
        const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        const page = await context.newPage();
        const entry = { id, url, inspectedAt: new Date().toISOString(), actions: [], frames: [], errors: [] };
        page.on('pageerror', error => { if (entry.errors.length < 5) entry.errors.push(error.message); });
        const shot = async (label) => {
          const file = `${id}-${label}.jpg`;
          await page.screenshot({ path: path.join(out, file), type: 'jpeg', quality: 85, timeout: 15000 });
          entry.frames.push(file);
        };
        try {
          const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
          entry.status = response?.status();
          await page.waitForTimeout(4500);
          await shot('abertura');
          entry.title = await page.title();
          entry.finalUrl = page.url();
          entry.text = (await page.locator('body').innerText()).slice(0, 13000);
          entry.links = await page.locator('a[href]').evaluateAll(els => els.slice(0, 90).map(el => ({ text: el.innerText.slice(0, 100), href: el.href })));
          entry.controls = await page.locator('button,input,iframe,canvas,video').evaluateAll(els => els.slice(0, 60).map(el => ({ tag: el.tagName, text: el.textContent.slice(0, 70), type: el.type || null, src: el.src || el.currentSrc || null, box: { width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height } })));
          await page.mouse.move(220, 250);
          await page.mouse.move(1000, 550, { steps: 25 });
          entry.actions.push('Movimento do ponteiro do canto superior esquerdo à região inferior direita.');
          await page.waitForTimeout(1200);
          await shot('ponteiro');
          for (let i = 0; i < 3; i++) { await page.mouse.wheel(0, 650); await page.waitForTimeout(800); await shot(`scroll-${i + 1}`); }
          entry.actions.push('Três rolagens de 650px, registradas separadamente.');
        } catch (error) { entry.error = error.message; }
        finally {
          fs.writeFileSync(path.join(__dirname, `${id}.json`), JSON.stringify(entry, null, 2));
          results.push(entry);
          console.log(JSON.stringify({ id, status: entry.status, title: entry.title, error: entry.error, frames: entry.frames }));
          await context.close();
        }
      }
    }));
  } finally { await browser.close(); fs.writeFileSync(path.join(__dirname, 'inspecao.json'), JSON.stringify(results, null, 2)); }
})();
