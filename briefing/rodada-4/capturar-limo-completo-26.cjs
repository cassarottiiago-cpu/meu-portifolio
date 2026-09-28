const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
const sharp = require('C:/Users/iago cassarotti/site-nat-work/node_modules/sharp');
const out = path.resolve(__dirname, '../../prototipo-03/validacao/limo-26');
const url = 'https://lplimozine-nu.vercel.app/';
const viewport = { width: 1440, height: 1000 };

async function inspect(page) {
  return page.evaluate(() => ({
    scrollY, viewport: { width: innerWidth, height: innerHeight }, pageHeight: document.documentElement.scrollHeight, supportsContentVisibility: CSS.supports('content-visibility', 'auto'),
    scripts: [...document.scripts].map(s => ({ src: s.src, inline: s.src ? undefined : s.textContent })),
    stylesheets: [...document.querySelectorAll('link[rel="stylesheet"]')].map(l => l.href),
    sections: [...document.querySelectorAll('section, footer')].map(e => {
      const r = e.getBoundingClientRect(); const s = getComputedStyle(e);
      const headings = [...e.querySelectorAll('h1,h2,h3')].map(h => {
        const hr = h.getBoundingClientRect(); const hs = getComputedStyle(h);
        return { text: h.innerText, top: hr.top + scrollY, left: hr.left, width: hr.width, height: hr.height, opacity: hs.opacity, visibility: hs.visibility, ancestors: [h.parentElement, h.parentElement?.parentElement].filter(Boolean).map(p => ({ tag: p.tagName, class: p.className, opacity: getComputedStyle(p).opacity, transform: getComputedStyle(p).transform })) };
      });
      return { tag: e.tagName, id: e.id, class: e.className, top: r.top + scrollY, left: r.left, width: r.width, height: r.height, opacity: s.opacity, transform: s.transform, contentVisibility: s.contentVisibility, headings };
    }),
    images: [...document.images].map(i => ({ src: i.currentSrc, complete: i.complete, width: i.naturalWidth, height: i.naturalHeight, alt: i.alt })),
  }));
}

async function composeSections(page) {
  const sections = [];
  const snapshots = [];
  const selectors = ['#galeria', '#diferenciais', '#promocao-casal', '#valores', '#avaliacoes', '#reserva', 'footer'];
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(3000);
  const openingEnd = await page.locator('#galeria').evaluate(e => e.getBoundingClientRect().top + scrollY);
  const openingHeight = Math.round(openingEnd * 2);
  const opening = await page.screenshot({ fullPage: true, clip: { x: 0, y: 0, width: viewport.width, height: openingHeight / 2 }, timeout: 60000 });
  fs.writeFileSync(path.join(out, 'section-abertura.png'), opening);
  snapshots.push({ input: opening, top: 0, left: 0 });
  sections.push({ selector: '.hero + #historia', filename: 'section-abertura.png', scrollY: 0, topPixels: 0, heightPixels: openingHeight });
  for (let index = 0; index < selectors.length; index++) {
    const selector = selectors[index];
    const bounds = await page.locator(selector).evaluate(e => { const r = e.getBoundingClientRect(); return { top: r.top + scrollY, bottom: r.bottom + scrollY }; });
    // Native content-visibility skips distant sections in full-page screenshots.
    // Put the viewport just after each section, within its real paint vicinity.
    // Fixed navigation/CTA then stays outside the captured section naturally.
    await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), bounds.bottom + 50);
    await page.waitForTimeout(1400);
    const state = await inspect(page);
    const section = state.sections.find(s => selector === 'footer' ? s.tag === 'FOOTER' : '#' + s.id === selector);
    if (!section) throw new Error('Section missing: ' + selector);
    if (section.headings.some(h => !h.text || h.ancestors.some(a => +a.opacity < 0.999))) throw new Error('Section is not painted: ' + selector);
    const topPixels = Math.round(section.top * 2);
    const endPixels = Math.round((section.top + section.height) * 2);
    const clip = { x: 0, y: topPixels / 2, width: viewport.width, height: (endPixels - topPixels) / 2 };
    const filename = 'section-' + selector.replace('#', '') + '.png';
    const buffer = await page.screenshot({ fullPage: true, clip, timeout: 60000 });
    fs.writeFileSync(path.join(out, filename), buffer);
    snapshots.push({ input: buffer, top: topPixels, left: 0 });
    sections.push({ selector, filename, clip, scrollY: state.scrollY, topPixels, heightPixels: endPixels - topPixels, headings: section.headings });
  }
  const height = Math.max(...sections.map(s => s.topPixels + s.heightPixels));
  const composite = await sharp({ create: { width: viewport.width * 2, height, channels: 3, background: '#eee9df' } }).composite(snapshots).png().toBuffer();
  fs.writeFileSync(path.join(out, 'limozine-completo-composto.png'), composite);
  const info = await sharp(composite).resize({ width: 1920 }).webp({ quality: 94 }).toFile(path.join(out, 'limozine-completo-composto.webp'));
  const record = { url, capturedAt: new Date().toISOString(), viewport, deviceScaleFactor: 2, width: info.width, height: info.height, bytes: info.size, method: 'Composição em coordenadas de documento de oito capturas reais: abertura e sete seções, sem alterações do DOM, conteúdo, estilos ou ordem. Fontes, imagens e entradas de animação esperadas antes da captura. Navegação fixa capturada apenas onde naturalmente presente nas vistas inicial e final.', sections, finalState: await inspect(page) };
  fs.writeFileSync(path.join(out, 'limozine-completo-composto.json'), JSON.stringify(record, null, 2));
  console.log(JSON.stringify({ composition: { width: info.width, height: info.height, bytes: info.size, sections: sections.map(s => ({ selector: s.selector, topPixels: s.topPixels, heightPixels: s.heightPixels })) } }));
}

async function composeViewportTiles(page) {
  // Capture only pixels that the visitor can actually see. A full-document
  // screenshot cannot paint distant content-visibility:auto sections reliably.
  // Keep every subsequent tile below the fixed header and above the floating
  // CTA. Nothing in the source DOM, styles or content is changed.
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const pieces = [], records = [];
  await page.evaluate(() => scrollTo({top:0,behavior:'instant'}));
  await page.waitForTimeout(2200);
  // Hero parallax must be captured in one state, not split across scroll
  // positions. These first two sections do not use content-visibility:auto.
  let cursor = Math.ceil(await page.locator('#galeria').evaluate(e=>e.getBoundingClientRect().top+scrollY));
  const opening = await page.screenshot({fullPage:true,clip:{x:0,y:0,width:viewport.width,height:cursor},timeout:30000});
  pieces.push({input:opening,left:0,top:0});
  records.push({documentY:0,scrollY:0,height:cursor,method:'Abertura e história em uma captura contínua; preserva o estado do parallax.'});
  while (cursor < height) {
    await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), Math.max(0,cursor-120));
    await page.waitForTimeout(1400);
    const carousel = await page.locator('.card-carousel').boundingBox();
    if(carousel && carousel.y < viewport.height-120 && carousel.y+carousel.height > 120) {
      const visibleTop=Math.max(120,carousel.y),visibleBottom=Math.min(viewport.height-120,carousel.y+carousel.height);
      await page.mouse.move(carousel.x+carousel.width/2,(visibleTop+visibleBottom)/2);
      await page.waitForTimeout(800);
    }
    const scroll = await page.evaluate(() => scrollY);
    const clipTop = cursor - scroll;
    const remaining = height - cursor;
    const atEnd = scroll >= height - viewport.height - 1;
    const tileHeight = Math.min(remaining, viewport.height - clipTop - (atEnd ? 0 : 120));
    if (tileHeight <= 0 || (cursor > 0 && clipTop < 100)) throw new Error('Invalid viewport tile at '+cursor);
    const pixels = await page.screenshot({ fullPage: false, timeout: 30000 });
    const crop = { left:0, top:Math.round(clipTop*2), width:viewport.width*2, height:Math.round(tileHeight*2) };
    const buffer = await sharp(pixels).extract(crop).png().toBuffer();
    pieces.push({ input:buffer, left:0, top:Math.round(cursor*2) });
    records.push({ documentY:cursor, scrollY:scroll, crop, height:tileHeight });
    cursor += tileHeight;
  }
  const buffer = await sharp({create:{width:viewport.width*2,height:Math.round(height*2),channels:3,background:'#eee9df'}}).composite(pieces).png().toBuffer();
  const file = 'limozine-completo-viewport.webp';
  const info = await sharp(buffer).resize({width:1920}).webp({quality:94}).toFile(path.join(out,file));
  const meta = {url,capturedAt:new Date().toISOString(),viewport,deviceScaleFactor:2,width:info.width,height:info.height,bytes:info.size,
    method:'Composição de abertura e história em uma captura contínua, seguida de recortes de viewport reais em coordenadas contíguas. Sem alterações do DOM ou CSS. Recortes intermediários ficam abaixo do header fixo e acima do botão flutuante; ambos aparecem apenas nas vistas inicial/final. Carregamento e animações aguardados. Carrossel pausado por hover nativo durante a captura.',tiles:records};
  fs.writeFileSync(path.join(out,file.replace('.webp','.json')),JSON.stringify(meta,null,2));
  console.log(JSON.stringify(meta));
}

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: process.argv.includes('--paint-all') ? ['--disable-blink-features=CSSContentVisibility'] : [] });
  try {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 2, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo', reducedMotion: process.argv.includes('--reduced') ? 'reduce' : 'no-preference' });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(12000);
    const initial = await inspect(page);
    fs.writeFileSync(path.join(out, 'initial.json'), JSON.stringify(initial, null, 2));
    for (const [index, script] of initial.scripts.filter(s => s.src.startsWith(url)).entries()) {
      const response = await page.request.get(script.src);
      fs.writeFileSync(path.join(out, `source-${index}.js`), await response.body());
    }
    for (const [index, css] of initial.stylesheets.filter(s => s.startsWith(url)).entries()) {
      const response = await page.request.get(css);
      fs.writeFileSync(path.join(out, `source-${index}.css`), await response.body());
    }
    console.log(JSON.stringify({ initial: { pageHeight: initial.pageHeight, sections: initial.sections, scripts: initial.scripts.map(s => s.src) } }));
    if (process.argv.includes('--inspect')) return;
    const height = initial.pageHeight;
    const states = [];
    for (let y = 0; y < height - viewport.height; y += 400) {
      await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), y);
      await page.waitForTimeout(1000);
      const state = await inspect(page);
      states.push({ requestedY: y, scrollY: state.scrollY, headings: state.sections.flatMap(s => s.headings) });
    }
    await page.waitForTimeout(3000);
    if (process.argv.includes('--tiles')) {
      await composeViewportTiles(page);
      return;
    }
    if (process.argv.includes('--compose')) {
      await composeSections(page);
      return;
    }
    if (process.argv.includes('--paint-all')) {
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(3000);
    }
    const filename = process.argv.includes('--paint-all') ? 'full-painted.webp' : 'full-from-bottom.webp';
    await sharp(await page.screenshot({ fullPage: true, timeout: 60000 })).resize({ width: 1920 }).webp({ quality: 94 }).toFile(path.join(out, filename));
    fs.writeFileSync(path.join(out, filename.replace('.webp', '.json')), JSON.stringify(await inspect(page), null, 2));
    fs.writeFileSync(path.join(out, 'scroll-states.json'), JSON.stringify(states, null, 2));
    console.log(JSON.stringify({ final: await inspect(page) }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
