const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
const out = path.join(__dirname, 'esportes');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  try {
    const page = await browser.newPage();
    await page.goto('https://mixkit.co/license/', { waitUntil: 'networkidle' });
    const reject = page.getByRole('button', { name: 'Rejeitar todos', exact: true });
    if (await reject.isVisible()) await reject.click();
    await page.getByRole('button', { name: 'View License', exact: true }).first().click();
    await page.waitForTimeout(1000);
    const license = await page.locator('body').textContent();
    fs.writeFileSync(path.join(out, 'licenca-observada.txt'), license);
    console.log(license.slice(-12000));
    const records = JSON.parse(fs.readFileSync(path.join(out, 'origens.json'), 'utf8'));
    for (const record of records) {
      if (!record.text.includes('commercial or personal use, under the Mixkit Stock Video Free License')) throw Error('Licença livre não confirmada: ' + record.id);
      const source = new URL(record.inputs.find(e => e.name === 'download-option' && e.data.label === 'Full HD').value, record.url).href;
      let response = await page.request.get(source, { timeout: 120000 });
      if (/text\/html/.test(response.headers()['content-type'])) {
        const html = await response.text();
        const links = [...html.matchAll(/https?:[^\s"'<>]+\.mp4(?:\?[^\s"'<>]*)?/g)].map(x => x[0].replace(/&amp;/g, '&'));
        console.log(record.id + ' download links: ' + JSON.stringify([...new Set(links)]));
        const selected = links.find(url => /1080/.test(url)) || links.find(url => /assets\.mixkit\.co/.test(url));
        if (!selected) throw Error('Sem endereço de download observado');
        response = await page.request.get(selected, { timeout: 120000 });
      }
      const type = response.headers()['content-type'];
      if (!response.ok() || !/video|octet-stream/.test(type)) throw Error('Download não é vídeo: ' + response.status() + ' ' + type);
      const bytes = await response.body();
      fs.writeFileSync(path.join(out, record.id + '.mp4'), bytes);
      console.log(record.id + ': ' + bytes.length + ' bytes / ' + response.url());
      record.download = { source, resolved: response.url(), bytes: bytes.length, date: new Date().toISOString() };
    }
    fs.writeFileSync(path.join(out, 'origens.json'), JSON.stringify(records, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
