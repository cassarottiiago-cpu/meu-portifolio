// Telas de celular (iPhone 17 Pro: 402×874 pt; 820 pt abaixo da barra de status) dos link-in-bio publicados.
// Uso: node capturar-celulares-29.cjs
const path = require('node:path');
const { chromium } = require(process.env.PORTFOLIO_PLAYWRIGHT || 'C:/Users/bmkld/meu-portifolio/prototipo-04/node_modules/playwright-core');
const sharp = require(process.env.PORTFOLIO_SHARP || 'C:/Users/bmkld/meu-portifolio/prototipo-04/node_modules/sharp');
const out = path.resolve(__dirname, '../../prototipo-04/assets/revisao-23');
const alvos = [
  { id: 'dominos', url: 'https://dominosblink.vercel.app/', telas: [{ y: 0 }, { secao: 'section:not(.links-section)', margem: 20 }, { y: 'fim' }] },
  { id: 'bmk-blink', url: 'https://blink.bmkgow.com/', telas: [{ y: 0 }, { texto: 'Site', margem: 24 }, { texto: 'CONHEÇA NOSSOS SERVIÇOS', margem: 24 }] },
];

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    for (const alvo of alvos) {
      const context = await browser.newContext({ viewport: { width: 402, height: 820 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'pt-BR' });
      const page = await context.newPage();
      await page.goto(alvo.url, { waitUntil: 'networkidle' });
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 300) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, 0); });
      await page.evaluate(() => Promise.race([Promise.all([...document.images].map(i => i.decode().catch(() => {}))), new Promise(r => setTimeout(r, 8000))]));
      await page.waitForTimeout(2000);
      for (const [i, tela] of alvo.telas.entries()) {
        let y = tela.y;
        if (y === 'fim') y = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
        else if (tela.secao) y = await page.locator(tela.secao).first().evaluate(e => e.getBoundingClientRect().top + scrollY) - tela.margem;
        else if (tela.texto) y = await page.getByText(tela.texto, { exact: true }).first().evaluate(e => e.closest('a,section,div').getBoundingClientRect().top + scrollY) - tela.margem;
        await page.evaluate(y => scrollTo(0, y), Math.max(0, Math.round(y)));
        await page.waitForTimeout(1200);
        const arquivo = alvo.id + '-celular-' + (i + 1) + '.webp';
        const info = await sharp(await page.screenshot()).webp({ quality: 92 }).toFile(path.join(out, arquivo));
        console.log(arquivo, info.width + 'x' + info.height);
      }
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
