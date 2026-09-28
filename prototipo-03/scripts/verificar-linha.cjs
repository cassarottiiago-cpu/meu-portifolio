const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createServer } = require('./servidor.cjs');
const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');

(async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const origin = 'http://127.0.0.1:' + server.address().port;
  const out = path.resolve(__dirname, '../validacao/pincel-livre-24');
  fs.mkdirSync(out, { recursive: true });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      const original = window.requestAnimationFrame.bind(window);
      window.__frameRequests = 0;
      window.requestAnimationFrame = callback => { window.__frameRequests++; return original(callback); };
    });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const width of [1440, 1024, 768, 600, 481, 390, 320]) {
      await page.setViewportSize({ width, height: 960 });
      await page.goto(origin + '/projetos.html');
      if (!await page.locator('link[href="archive-ink.css"]').count()) await page.addStyleTag({ url: origin + '/archive-ink.css' });
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.images].map(img => { img.loading = 'eager'; return img.decode(); }));
      });
      await page.waitForTimeout(250);
      const metrics = await page.evaluate(() => {
        const line = document.querySelector('.ink-centerline');
        const pigment = document.querySelector('.ink-pigment');
        const css = getComputedStyle(line);
        const length = line.getTotalLength();
        const points = Array.from({ length: 101 }, (_, index) => line.getPointAtLength(length * index / 100));
        const entries = [...document.querySelectorAll('.archive-entry')];
        const rows = new Map();
        for (const entry of entries) {
          const box = entry.getBoundingClientRect();
          rows.set(box.top, (rows.get(box.top) || 0) + 1);
        }
        return {
          width: innerWidth,
          overflow: document.documentElement.scrollWidth > innerWidth,
          stroke: Number(pigment.dataset.brushWidth),
          pigment: getComputedStyle(pigment).fill,
          texture: document.querySelectorAll('.ink-bristles path').length,
          cap: css.strokeLinecap,
          offset: parseFloat(css.strokeDashoffset),
          curves: (line.getAttribute('d').match(/C/g) || []).length,
          monotone: points.every((point, index) => !index || point.y >= points[index - 1].y),
          directions: [...new Set(points.slice(1).map((point,index) => Math.sign(point.x - points[index].x)))],
          textProtected: [...document.querySelectorAll('.archive-caption')].every(el => getComputedStyle(el).backgroundColor === 'rgb(250, 247, 241)'),
          rowCounts: [...rows.values()],
          frames: window.__frameRequests,
        };
      });
      assert.equal(metrics.overflow, false);
      assert.equal(metrics.cap, 'butt');
      assert.equal(metrics.offset, 0);
      assert.ok(metrics.curves >= 7 && metrics.curves <= 10, 'Continuous gesture includes several distinct turns, not three repeated sweeps');
      assert.ok(metrics.directions.includes(-1) && metrics.directions.includes(1), 'Brush changes lateral direction');
      assert.equal(metrics.pigment, 'rgb(193, 44, 32)');
      assert.ok(metrics.texture >= 30 && metrics.texture <= 180, 'Texture confined to brush mask');
      assert.equal(metrics.monotone, false, 'Brush doubles back vertically through drawn loops');
      assert.equal(metrics.textProtected, true);
      assert.ok(metrics.stroke >= (width <= 760 ? 26 : 46) && metrics.stroke <= (width <= 760 ? 34 : 64));
      if (width === 1440) assert.equal(metrics.stroke, 64, 'Desktop brush is thicker than its former 52px cap');
      if (width === 390) assert.equal(metrics.stroke, 27.7, 'Mobile brush is thicker than the former 23px');
      if (width === 1440) assert.ok(metrics.rowCounts.length >= 7);
      if (width <= 600) assert.deepEqual(metrics.rowCounts, Array(9).fill(1));
      await page.waitForTimeout(250);
      assert.equal(await page.evaluate(() => window.__frameRequests), metrics.frames, 'No frames scheduled at rest');
      await page.screenshot({ path: path.join(out, width + '.png'), fullPage: true });
      console.log('static', JSON.stringify(metrics));
    }
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(origin + '/projetos.html');
    if (!await page.locator('link[href="archive-ink.css"]').count()) await page.addStyleTag({ url: origin + '/archive-ink.css' });
    await page.evaluate(async () => { await document.fonts.ready; });
    await page.waitForTimeout(300);
    const offset = () => page.locator('.ink-centerline').evaluate(el => parseFloat(getComputedStyle(el).strokeDashoffset));
    const first = await offset();
    await page.evaluate(() => scrollTo(0, 700));
    await page.waitForTimeout(150);
    const middle = await offset();
    assert.ok(middle < first, 'Ink grows when scrolling down');
    await page.screenshot({ path: path.join(out, 'scroll-middle.png') });
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(150);
    assert.ok(Math.abs(await offset() - first) < .1, 'Ink reverses to the exact previous state');
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(150);
    assert.equal(await offset(), 0, 'Entire gesture is drawn at page end');
    const frames = await page.evaluate(() => window.__frameRequests);
    await page.waitForTimeout(350);
    assert.equal(await page.evaluate(() => window.__frameRequests), frames, 'Animation settles without a perpetual frame loop');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(150);
    assert.equal(await offset(), 0, 'Changing motion preference reveals the static full gesture');
    assert.deepEqual(errors, []);
    console.log('Scroll reversível, mudança de preferência e repouso: OK.');
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
