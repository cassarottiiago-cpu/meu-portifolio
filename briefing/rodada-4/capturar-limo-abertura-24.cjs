const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
const sharp = require('C:/Users/iago cassarotti/site-nat-work/node_modules/sharp');

const out = path.resolve(__dirname, '../../prototipo-03/validacao/limo-24');
const url = 'https://lplimozine-nu.vercel.app/';

(async () => {
  fs.mkdirSync(out, { recursive: true });
  if (process.argv.includes('--promote')) {
    const filename = 'limozine-capa-1440x700.webp';
    const capture = JSON.parse(fs.readFileSync(path.join(out, filename.replace('.webp', '.json')), 'utf8'));
    const assets = path.resolve(__dirname, '../../prototipo-03/assets/revisao-23');
    const destination = path.join(assets, 'limozine-cover.webp');
    const oldCover = path.join(out, 'limozine-cover-galeria-anterior.webp');
    if (!fs.existsSync(oldCover)) fs.copyFileSync(destination, oldCover);
    fs.copyFileSync(path.join(out, filename), destination);
    fs.writeFileSync(path.join(assets, 'limozine-cover-metadata.json'), JSON.stringify(capture, null, 2));
    const metadataPath = path.join(assets, 'limozine-metadata.json');
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    metadata.coverRevisedAt = capture.capturedAt;
    metadata.coverCapture = { ...capture, filename: 'revisao-23/limozine-cover.webp' };
    metadata.files = metadata.files.map(file => file.role === 'cover'
      ? { ...file, width: capture.width, height: capture.height, bytes: capture.bytes, capturedAt: capture.capturedAt, viewport: capture.viewport }
      : file);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(JSON.stringify({ promoted: destination, width: capture.width, height: capture.height, previousCover: oldCover }));
    return;
  }
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  try {
    for (const viewport of [{ width: 1440, height: 900 }, { width: 1440, height: 700 }]) {
      const context = await browser.newContext({ viewport, deviceScaleFactor: 2, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' });
      try {
        const page = await context.newPage();
        const failed = [];
        page.on('requestfailed', r => failed.push({ url: r.url(), error: r.failure()?.errorText }));
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(12000);
        await page.evaluate(async () => {
          await Promise.all([...document.images].filter(i => i.getBoundingClientRect().top < innerHeight * 2).map(i => i.decode().catch(() => {})));
        });
        // Exercise the actual entrance animation without changing source styles or content.
        await page.locator('#historia').scrollIntoViewIfNeeded();
        await page.waitForTimeout(2800);
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await page.waitForTimeout(2800);
        const measurement = await page.evaluate(() => {
          const read = selector => {
            const e = document.querySelector(selector);
            const r = e.getBoundingClientRect();
            return { selector, x: r.x, y: r.y + scrollY, width: r.width, height: r.height, bottom: r.bottom + scrollY, opacity: getComputedStyle(e).opacity };
          };
          return {
            hero: read('.hero'), history: read('#historia'), historyHeading: read('#historia h2'), gallery: read('#galeria'), logo: read('.hero img[alt="Logo Limozini"]'),
            title: document.title, fontsLoaded: document.fonts.status,
            visibleImages: [...document.images].filter(i => i.getBoundingClientRect().top < document.querySelector('#galeria').getBoundingClientRect().top).map(i => ({ src: i.currentSrc, complete: i.complete, width: i.naturalWidth, height: i.naturalHeight })),
          };
        });
        if (measurement.visibleImages.some(i => !i.complete || !i.width)) throw new Error('Image in opening is not ready.');
        const clip = { x: 0, y: 0, width: viewport.width, height: Math.ceil(measurement.history.bottom) };
        const filename = `limozine-abertura-${viewport.width}x${viewport.height}.webp`;
        const info = await sharp(await page.screenshot({ fullPage: true, clip, timeout: 60000 })).webp({ quality: 94 }).toFile(path.join(out, filename));
        const record = { url, finalUrl: page.url(), status: response.status(), capturedAt: new Date().toISOString(), viewport, deviceScaleFactor: 2, clip, filename, width: info.width, height: info.height, bytes: info.size, measurement, failed };
        fs.writeFileSync(path.join(out, filename.replace('.webp', '.json')), JSON.stringify(record, null, 2));
        console.log(JSON.stringify(record));
        // Condensed display accents paint above their line box. Keep a measured
        // visual inset, not just the heading's CSS top, so no fragment is visible.
        const logoSource = measurement.visibleImages.find(i => i.src.includes('LOGO'));
        const logoResponse = await page.request.get(logoSource.src);
        const logoPixels = await sharp(await logoResponse.body()).resize({ width: Math.round(measurement.logo.width * 2) }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
        let lastPaintedLogoRow = -1;
        for (let y = 0; y < logoPixels.info.height; y++) {
          for (let x = 0; x < logoPixels.info.width; x++) {
            if (logoPixels.data[(y * logoPixels.info.width + x) * 4 + 3] > 16) lastPaintedLogoRow = y;
          }
        }
        measurement.logo.paintedBottom = measurement.logo.y + (lastPaintedLogoRow + 1) / 2;
        const coverClip = { ...clip, height: Math.floor(measurement.historyHeading.y) - 17 };
        if (coverClip.height < measurement.logo.paintedBottom + 8) throw new Error('The visible logo has insufficient clearance before the next heading.');
        const coverName = filename.replace('abertura', 'capa');
        const coverInfo = await sharp(await page.screenshot({ fullPage: true, clip: coverClip, timeout: 60000 })).webp({ quality: 94 }).toFile(path.join(out, coverName));
        const coverRecord = { ...record, filename: coverName, clip: coverClip, width: coverInfo.width, height: coverInfo.height, bytes: coverInfo.size };
        fs.writeFileSync(path.join(out, coverName.replace('.webp', '.json')), JSON.stringify(coverRecord, null, 2));
        console.log(JSON.stringify({ filename: coverName, width: coverInfo.width, height: coverInfo.height, clip: coverClip, headingTop: measurement.historyHeading.y, logoBottom: measurement.logo.bottom }));
      } finally { await context.close(); }
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
