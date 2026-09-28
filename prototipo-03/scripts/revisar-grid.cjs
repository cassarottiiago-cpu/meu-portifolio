const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createServer } = require('./servidor.cjs');
const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
(async () => {
  const server = createServer();
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const out = path.resolve(__dirname, '../validacao/arquivo-livre-24');
  fs.mkdirSync(out, { recursive: true });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    for (const width of [1440, 1024, 768, 600, 481, 390, 320]) {
      await page.setViewportSize({ width, height: 960 });
      await page.goto('http://127.0.0.1:' + server.address().port + '/projetos.html');
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.images].map(img => { img.loading = 'eager'; return img.decode(); }));
      });
      await page.waitForTimeout(200);
      const metrics = await page.evaluate(() => {
        const entries = [...document.querySelectorAll('.archive-entry')];
        const rows = new Map();
        for (const entry of entries) {
          const r = entry.getBoundingClientRect();
          const row = rows.get(r.top) || [];
          row.push(r); rows.set(r.top, row);
        }
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          count: entries.length,
          rowCounts: [...rows.values()].map(row => row.length),
          distinctTops: rows.size,
          overlap: entries.some((entry, i) => entries.slice(i + 1).some(other => { const a = entry.getBoundingClientRect(), b = other.getBoundingClientRect(); return Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1; })),
          naturalImages: entries.every(el => { const img = el.querySelector('img'), r = img.getBoundingClientRect(); return Math.abs(r.width / r.height - img.naturalWidth / img.naturalHeight) < .015; }),
          widestGap: Math.max(...entries.slice(1).map((entry, i) => { const r = entry.getBoundingClientRect(); const previous = entries.slice(0, i + 1).map(el => el.getBoundingClientRect()).filter(a => a.bottom <= r.top + 1 && Math.min(a.right, r.right) > Math.max(a.left, r.left)); return previous.length ? r.top - Math.max(...previous.map(a => a.bottom)) : 0; })),
          textProtected: entries.every(el => getComputedStyle(el).backgroundColor === 'rgb(250, 247, 241)' && getComputedStyle(el.querySelector('.archive-caption')).backgroundColor === 'rgb(250, 247, 241)'),
          cardsBounded: entries.every(el => getComputedStyle(el).borderTopWidth === '1px' && getComputedStyle(el).borderBottomWidth === '1px'),
          captionsAligned: entries.every(el => Math.abs(el.clientWidth - el.querySelector('.archive-caption').getBoundingClientRect().width) < 1),
          labelsContained: entries.every(el => [...el.querySelectorAll('.archive-caption h2,.archive-caption p,.archive-caption h2 span')].every(text => { const a = el.getBoundingClientRect(), b = text.getBoundingClientRect(); return b.left >= a.left && b.right <= a.right && text.scrollWidth <= text.clientWidth + 1; })),
          height: document.documentElement.scrollHeight
        };
      });
      assert.equal(metrics.overflow, false);
      assert.equal(metrics.count, 9);
      assert.equal(metrics.overlap, false);
      assert.equal(metrics.naturalImages, true);
      assert.equal(metrics.textProtected, true);
      assert.equal(metrics.cardsBounded, true);
      assert.equal(metrics.labelsContained, true);
      assert.equal(metrics.captionsAligned, true);
      assert.ok(metrics.widestGap <= 65, 'Measured placement leaves no unused vertical pockets in a lane');
      if (width === 1440) assert.ok(metrics.distinctTops >= 7, 'Cards have their own rhythm rather than repeated aligned rows');
      if (width <= 600) assert.equal(metrics.rowCounts.length, 9);
      await page.screenshot({ path: path.join(out, width + '.png'), fullPage: true });
      console.log(width, JSON.stringify(metrics));
    }
    // The same page must return from the single-column mobile fallback without
    // stale absolute coordinates, overlaps, a clipped final card or a resize loop.
    for (const width of [1440, 390, 1024, 600, 1440]) {
      await page.setViewportSize({ width, height: 960 });
      await page.waitForTimeout(160);
      const state = await page.evaluate(() => {
        const grid = document.querySelector('.archive-grid');
        const cards = [...grid.querySelectorAll('.archive-entry')];
        const bounds = cards.map(card => card.getBoundingClientRect());
        const overlap = bounds.some((a, i) => bounds.slice(i + 1).some(b => Math.min(a.right, b.right) > Math.max(a.left, b.left) + 1 && Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top) + 1));
        return { mode: grid.dataset.layout || 'flow', overflow: document.documentElement.scrollWidth > innerWidth, overlap, contained: bounds.every(b => b.bottom <= grid.getBoundingClientRect().bottom) };
      });
      assert.equal(state.mode, width > 600 ? 'free' : 'flow');
      assert.equal(state.overflow, false);
      assert.equal(state.overlap, false);
      assert.equal(state.contained, true);
    }
    const fallback = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 1440, height: 960 } });
    await fallback.goto('http://127.0.0.1:' + server.address().port + '/projetos.html');
    assert.equal(await fallback.locator('.archive-entry:visible').count(), 9, 'All projects are available without JavaScript');
    assert.equal(await fallback.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await fallback.screenshot({ path: path.join(out, 'no-js.png'), fullPage: true });
    await fallback.close();
  } finally { await browser.close(); await new Promise(r => server.close(r)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
