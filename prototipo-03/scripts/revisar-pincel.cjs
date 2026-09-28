const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createServer } = require('./servidor.cjs');
const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');

(async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const directory = path.resolve(__dirname, '../validacao/pincel-22-09');
  fs.mkdirSync(directory, { recursive: true });
  const errors = [];
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    page.on('pageerror', error => errors.push(error.message));
    for (const width of [1440, 768, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('http://127.0.0.1:' + server.address().port + '/projetos.html');
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.images].map(image => { image.loading = 'eager'; return image.decode(); }));
      });
      await page.waitForTimeout(100);
      const metrics = await page.evaluate(() => {
        const line = document.querySelector('.ink-centerline');
        const pigment = document.querySelector('.ink-pigment');
        const length = line.getTotalLength();
        const points = Array.from({ length: 151 }, (_, i) => line.getPointAtLength(length * i / 150));
        let turns = 0, direction = 0;
        for (let i = 1; i < points.length; i++) {
          const next = Math.sign(points[i].x - points[i - 1].x);
          if (direction && next && next !== direction) turns++;
          direction = next || direction;
        }
        return {
          width: innerWidth,
          fullStroke: parseFloat(getComputedStyle(line).strokeDashoffset) === 0,
          monotoneY: points.every((point, index) => !index || point.y >= points[index - 1].y),
          turns,
          brushWidth: Number(pigment.dataset.brushWidth),
          scratches: document.querySelectorAll('.ink-bristles path').length,
          overflow: document.documentElement.scrollWidth > innerWidth,
          inkFill: getComputedStyle(pigment).fill,
          maskType: getComputedStyle(document.querySelector('#archive-ink-bristles')).maskType,
        };
      });
      assert.equal(metrics.fullStroke, true);
      assert.equal(metrics.monotoneY, true);
      assert.equal(metrics.turns, 2);
      assert.equal(metrics.overflow, false);
      assert.equal(metrics.maskType, 'luminance');
      assert.ok(metrics.scratches > 30 && metrics.scratches <= 180);
      await page.screenshot({ path: path.join(directory, width + '.png'), fullPage: true });
      if (width === 1440) {
        // Isolate the vector temporarily for inspecting the material, not a shipped state.
        await page.addStyleTag({ content: '.archive-intro,.archive-grid,.masthead,footer{visibility:hidden}.archive-line{z-index:2!important}' });
        await page.screenshot({ path: path.join(directory, 'pincel-isolado.png'), fullPage: true });
      }
      console.log(JSON.stringify(metrics));
    }
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
