const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createServer } = require('./servidor.cjs');
const localRequire = (name, fallback) => { try { return require(name); } catch { return require(fallback); } };
const { chromium } = localRequire('playwright-core', 'C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
const { default: AxeBuilder } = localRequire('@axe-core/playwright', 'C:/Users/iago cassarotti/site-nat-work/node_modules/@axe-core/playwright');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'validacao');
fs.mkdirSync(out, { recursive: true });
const report = { date: new Date().toISOString(), checks: [], errors: [], accessibility: [], note: 'Verificação automatizada e capturas locais. Não equivale a teste com usuários nem a certificação de acessibilidade.' };
async function check(name, action) { try { const detail = await action(); report.checks.push({ name, passed: true, detail }); } catch (error) { report.checks.push({ name, passed: false, error: error.message }); } }
async function main() {
  const server = createServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const base = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.PORTFOLIO_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) report.errors.push(`${response.status()} ${response.url()}`); });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await check('Uma única identificação principal e três projetos corretos', async () => {
      assert.equal(await page.locator('h1').count(), 1);
      assert.match(await page.locator('h1').innerText(), /IAGO[\s\S]*CASSAROTTI/);
      assert.deepEqual(await page.locator('.project h3').allTextContents(), ['PHRON ↗', 'Dra. Natália ↗', 'QOZT ↗']);
      assert.doesNotMatch(await page.locator('main').innerText(), /consulting|maconha|familia de merda|família de merda/i);
    });
    await check('Todos os assets visíveis e fontes carregados', async () => {
      await page.evaluate(async () => { await Promise.all([...document.images].map(img => { img.loading = 'eager'; return img.decode(); })); });
      const fonts = await page.evaluate(() => ['Bowlby', 'Barlow', 'DM'].map(name => ({ name, loaded: document.fonts.check(`16px ${name}`) })));
      assert.ok(fonts.every(font => font.loaded)); return fonts;
    });
    for (const [width, height] of [[1440, 1000], [1366, 768], [1024, 768], [768, 1024], [700, 900], [390, 844], [320, 740]]) {
      await page.setViewportSize({ width, height });
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await check(`Sem transbordamento horizontal em ${width}px`, async () => {
        const dimensions = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
        assert.ok(dimensions.document <= width + 1, JSON.stringify(dimensions));
        assert.ok(dimensions.body <= width + 1, JSON.stringify(dimensions)); return dimensions;
      });
      if ([1440, 1366, 390, 320].includes(width)) {
        await page.screenshot({ path: path.join(out, `abertura-${width}.png`) });
        if ([1440, 390].includes(width)) await page.screenshot({ path: path.join(out, `pagina-${width}.png`), fullPage: true });
      }
      if ([1440, 1366, 390, 320].includes(width)) await check(`Apresentação profissional e CTA na primeira tela em ${width}x${height}`, async () => {
        const bottom = await page.locator('.work-cta').evaluate(el => el.getBoundingClientRect().bottom);
        assert.ok(bottom <= height, `CTA termina em ${bottom}px, viewport de ${height}px`);
        const roleBottom = await page.locator('.hero-description').evaluate(el => el.getBoundingClientRect().bottom);
        assert.ok(roleBottom <= height, `Apresentação termina em ${roleBottom}px`);
      });
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await check('Contraste e regras axe WCAG A/AA na página principal', async () => {
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      report.accessibility.push({ page: 'home-desktop', violations: result.violations });
      assert.equal(result.violations.length, 0, result.violations.map(v => `${v.id}: ${v.nodes.map(n => n.target).join(', ')}`).join('\n'));
    });
    await check('Âncora de trabalhos', async () => {
      await page.locator('.work-cta').click();
      await page.waitForFunction(() => Math.abs(document.querySelector('#trabalhos').getBoundingClientRect().top - 24) < 3);
      assert.match(page.url(), /#trabalhos$/);
      await page.screenshot({ path: path.join(out, 'trabalhos-desktop.png') });
    });
    for (const id of ['phron', 'natalia', 'qozt']) {
      await check(`Detalhe ${id}, fechamento por Esc e restauração de foco`, async () => {
        const trigger = page.locator(`.project-visual[data-case="${id}"]`);
        await trigger.click();
        assert.equal(await page.locator('.case-dialog').evaluate(el => el.open), true);
        assert.ok(await page.locator('#dialog-title').innerText());
        await page.locator('.case-dialog img').evaluate(img => img.decode());
        if (id === 'phron') {
          await page.locator('.annotation-toggle').click();
          assert.equal(await page.locator('.case-annotations').isVisible(), true);
          assert.equal(await page.locator('.annotation-toggle').getAttribute('aria-pressed'), 'true');
          await page.screenshot({ path: path.join(out, 'detalhe-phron.png') });
          const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
          report.accessibility.push({ page: 'dialog-phron', violations: result.violations });
          assert.equal(result.violations.length, 0, result.violations.map(v => v.id).join(','));
          await page.locator('.dialog-close').focus();
          await page.keyboard.press('Shift+Tab');
          assert.equal(await page.evaluate(() => !!document.activeElement.closest('.case-dialog')), true);
        }
        if (id === 'qozt') assert.equal(await page.locator('.case-dialog .case-external').getAttribute('href'), 'https://www.qozt.com.br/');
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('.case-dialog').evaluate(el => el.open), false);
        assert.equal(await trigger.evaluate(el => el === document.activeElement), true);
      });
    }
    await check('Controle de movimento e preferência persistente', async () => {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.locator('.motion-toggle').click();
      assert.equal(await page.locator('html').getAttribute('data-motion'), 'off');
      await page.reload();
      assert.equal(await page.locator('html').getAttribute('data-motion'), 'off');
      await page.locator('.motion-toggle').click();
      assert.equal(await page.locator('html').getAttribute('data-motion'), 'on');
    });
    await check('Preferência de movimento reduzido do sistema', async () => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForFunction(() => document.documentElement.dataset.motion === 'off');
      await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'instant' }));
      assert.equal(await page.locator('.skate-scene').evaluate(el => getComputedStyle(el).transform), 'none');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
    });
    await check('Página utilizável por teclado sem mouse', async () => {
      await page.goto(base);
      await page.keyboard.press('Tab');
      assert.equal(await page.locator('.skip-link').evaluate(el => el === document.activeElement), true);
      await page.keyboard.press('Enter');
      assert.match(page.url(), /#trabalhos$/);
    });
    await check('Diálogo e acessibilidade no celular', async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(base);
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      report.accessibility.push({ page: 'home-mobile', violations: result.violations });
      assert.equal(result.violations.length, 0, result.violations.map(v => `${v.id}: ${v.nodes.map(n => n.target).join(', ')}`).join('\n'));
      await page.locator('.project-visual[data-case="qozt"]').click();
      await page.locator('.case-dialog img').evaluate(img => img.decode());
      assert.equal(await page.locator('.case-dialog').evaluate(el => el.scrollWidth <= el.clientWidth + 1), true);
      await page.screenshot({ path: path.join(out, 'detalhe-qozt-mobile.png') });
      await page.locator('.dialog-close').click();
    });
    await check('Conteúdo e casos disponíveis sem JavaScript', async () => {
      const staticContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
      const staticPage = await staticContext.newPage();
      await staticPage.goto(base);
      assert.equal(await staticPage.locator('.project').count(), 3);
      await staticPage.locator('.project-visual[data-case="qozt"]').click();
      assert.match(staticPage.url(), /casos.html#qozt$/);
      assert.equal(await staticPage.locator('#qozt').isVisible(), true);
      await staticContext.close();
    });
    for (const file of ['casos.html', 'notas.html']) {
      await check(`Página ${file} e acessibilidade`, async () => {
        await page.goto(`${base}/${file}`);
        const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        report.accessibility.push({ page: file, violations: result.violations });
        assert.equal(result.violations.length, 0, result.violations.map(v => v.id).join(','));
      });
    }
    await check('Servidor restrito ao protótipo e requisições sem erros', async () => {
      assert.equal((await fetch(`${base}/scripts/servidor.cjs`)).status, 403);
      assert.equal((await fetch(`${base}/assets/manifest.json`)).status, 403);
      assert.deepEqual(report.errors, []);
    });
    await check('Abertura direta do arquivo local', async () => {
      await page.goto(require('node:url').pathToFileURL(path.join(root, 'index.html')).href);
      await page.locator('.hero-peek').click();
      assert.equal(await page.locator('.case-dialog').evaluate(el => el.open), true);
    });
    await context.close();
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
    fs.writeFileSync(path.join(out, 'resultado.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ passed: report.checks.filter(c => c.passed).length, failed: report.checks.filter(c => !c.passed), errors: report.errors }, null, 2));
    if (report.checks.some(c => !c.passed) || report.errors.length) process.exitCode = 1;
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
