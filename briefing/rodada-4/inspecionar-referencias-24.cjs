const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
const fs = require('node:fs');
const path = require('node:path');
const output = path.join(__dirname, 'referencias-24');
const targets = [
  ['mike', 'https://mikevandersanden.com/cases/'],
  ['lax', 'https://www.laxspace.co/'],
  ['formation', 'https://tympanus.net/Development/OnScrollLayoutFormations/'],
  ['stewart', 'https://www.stewartpartners.studio/'],
].filter(([name]) => !process.argv[2] || process.argv[2].split(',').includes(name));
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const reports = await Promise.all(targets.map(async ([name, url]) => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const report = { name, url, captured: new Date().toISOString(), frames: [] };
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(6500);
      for (const y of (process.argv[3] ? process.argv[3].split(',').map(Number) : [0, 700, 1400, 2400])) {
        await page.evaluate(y => window.scrollTo(0, y), y);
        await page.waitForTimeout(1200);
        if (name === 'lax') await page.mouse.move(900, 350, { steps: 16 });
        await page.screenshot({ path: path.join(output, `${name}-${y}.png`) });
        report.frames.push(await page.evaluate(() => ({ y: scrollY, height: document.documentElement.scrollHeight, canvas: document.querySelectorAll('canvas').length, images: document.images.length, text: document.body.innerText.slice(0, 1500), grids: [...document.querySelectorAll('[class*=grid]')].slice(0, 8).map(e => ({ class: e.className, display: getComputedStyle(e).display, columns: getComputedStyle(e).gridTemplateColumns })) })));
      }
    } catch (error) { report.error = error.message; }
    finally { await page.close(); }
    return report;
  }));
  fs.writeFileSync(path.join(output, process.argv[2] ? `inspecao-${process.argv[2]}.json` : 'inspecao.json'), JSON.stringify(reports, null, 2));
  console.log(JSON.stringify(reports));
  await browser.close();
})();
