const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { createServer } = require('./servidor.cjs');
const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
const { default: AxeBuilder } = require('C:/Users/iago cassarotti/site-nat-work/node_modules/@axe-core/playwright');
const sharp = require('C:/Users/iago cassarotti/site-nat-work/node_modules/sharp');
const root = path.resolve(__dirname, '..');
require('./gerar-paginas.cjs').generate();
const out = path.join(root, 'validacao');
fs.mkdirSync(out, { recursive: true });
const report = { date: new Date().toISOString(), checks: [], errors: [], accessibility: [],
  limits: ['Chromium/Edge automatizado; Safari iOS e dispositivos físicos não ensaiados.',
    'Não equivale a teste de satisfação, retenção ou conversão com usuários.'] };
async function check(name, fn) {
  try { const detail = await fn(); report.checks.push({ name, passed: true, detail }); }
  catch (error) { report.checks.push({ name, passed: false, error: error.message }); }
}
async function seek(page, progress) {
  await page.evaluate(p => scrollTo({ top: document.querySelector('.journey').offsetHeight * p, behavior: 'instant' }), progress);
  await page.waitForTimeout(60);
}
async function accessibility(page, label) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  // The opening no longer blends text with screenshots: every axe violation,
  // including color contrast, is a failure without selector exemptions.
  report.accessibility.push({ label, rawAxeViolations: result.violations, unresolved: result.violations });
  assert.equal(result.violations.length, 0, result.violations.map(v => `${v.id}: ${v.nodes.map(n => n.target).join(', ')}`).join('\n'));
}
(async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) report.errors.push(`${response.status()} ${response.url()}`); });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await check('Identificação e seleção preservam o trabalho, sem biografia sensível', async () => {
      assert.equal(await page.locator('h1').count(), 1);
      assert.match(await page.locator('h1').textContent(), /Iago\s+Cassarotti/i);
      assert.deepEqual(await page.locator('.shelf-item').evaluateAll(items => items.map(item => item.dataset.project)), ['Dr. Paulo', 'Limozine', 'Blink BMK']);
      const text=await page.locator('body').innerText();
      assert.equal((text.match(/Iago\s+Cassarotti/gi)||[]).length,1);
      assert.doesNotMatch(text,/Consulting Now|maconha|família de merda|VOL\.\s*01|Hachimitsu|O que me move|\(8\)|\(9\)/i);
      assert.doesNotMatch(text,/Estudo por conta própria|Quero entender como funciona|E o que acontece se|Protótipo local em revisão|Design\. Código\. Curiosidade\.|Role para descobrir|[↗↙↑↓]/);
      assert.equal(await page.locator('.hero-type,.view-label,.opening-note,.site-footer,.project-dialog').count(),0);
      assert.equal(await page.locator('.shelf-item').first().getAttribute('href'),'projetos/dr-paulo.html');
    });
    await check('Capturas nativas, calendário AUTOPOST e dois registros reais do PHRON', async () => {
      await page.evaluate(() => Promise.all([...document.images].map(img => { img.loading='eager'; return img.decode(); })));
      const images=await page.locator('.hero-project img,.feature-project img,.web-project img,.shelf-mobile-image').evaluateAll(items=>items.map(img=>{
        const r=img.getBoundingClientRect();
        return {src:img.getAttribute('src'),native:[img.naturalWidth,img.naturalHeight],declared:[Number(img.getAttribute('width')),Number(img.getAttribute('height'))],error:r.height?Math.abs((r.width/r.height)/(img.naturalWidth/img.naturalHeight)-1):0};
      }));
      assert.ok(images.length>=10);
      for(const img of images){assert.deepEqual(img.native,img.declared,img.src);assert.ok(img.error<.005,img.src);}
      assert.equal(await page.locator('.hero-project img').getAttribute('src'),'assets/autopost-queue.jpg');
      assert.equal(await page.locator('.feature-autopost img').getAttribute('src'),'assets/autopost-queue.jpg');
      assert.equal(await page.locator('.feature-phron .feature-print img').getAttribute('src'),'assets/revisao-23/phron-home-27.png');
      assert.equal(await page.locator('.phron-conversation img').getAttribute('src'),'assets/revisao-23/phron-whatsapp-27.jpeg');
      assert.deepEqual(await page.evaluate(()=>[...document.fonts].map(font=>font.family).sort()),['Barlow','DM']);
      assert.ok(await page.evaluate(()=>document.fonts.check('700 20px Barlow')&&document.fonts.check('16px DM')));
      return images;
    });
    await check('Primeira tela apresenta calendário inteiro e links utilizáveis', async () => {
      await seek(page,0);
      const image=await page.locator('.hero-project img').evaluate(img=>{
        const r=img.getBoundingClientRect();
        return {x:r.x,y:r.y,width:r.width,bottom:r.bottom,ratioError:Math.abs((r.width/r.height)/(img.naturalWidth/img.naturalHeight)-1),filter:getComputedStyle(img).filter,clip:getComputedStyle(img).clipPath};
      });
      assert.ok(image.width>=1440*.25&&image.x>=0&&image.x+image.width<=1441,JSON.stringify(image));
      assert.ok(image.y>=68&&image.bottom<=1000,JSON.stringify(image));
      assert.ok(image.ratioError<.005);
      assert.equal(image.filter,'none');assert.equal(image.clip,'none');
      await page.screenshot({path:path.join(out,'hero-sinal-desktop.png')});
      return image;
    });
    await check('Interfaces preservam cores e proporção durante o scroll', async () => {
      for(const progress of [0,.22,.59,.88]){
        await seek(page,progress);
        assert.equal(await page.locator('.journey').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(238, 233, 223)');
        const colors=await page.locator('.hero-project img,.feature-project img,.web-project img').evaluateAll(items=>items.map(el=>({filter:getComputedStyle(el).filter,blend:getComputedStyle(el).mixBlendMode})));
        assert.ok(colors.every(color=>color.filter==='none'&&color.blend==='normal'),JSON.stringify(colors));
      }
    });
    await check('Rolagem nativa avança e recua sobre a arte', async () => {
      await seek(page,0);await page.mouse.move(700,300);await page.mouse.wheel(0,400);await page.waitForTimeout(180);
      const advanced=await page.evaluate(()=>scrollY);assert.ok(advanced>0);
      await page.mouse.wheel(0,-200);await page.waitForTimeout(180);
      assert.ok(await page.evaluate(()=>scrollY)<advanced);
    });
    await check('Arte responde a ponteiro, forma e scroll; descanso não renderiza continuamente', async () => {
      await seek(page,0);
      await page.waitForFunction(()=>document.querySelector('.signal-field').dataset.signalReady==='true');
      const pixels=()=>page.locator('canvas').evaluate(el=>el.toDataURL());
      await page.mouse.move(0,0);await page.waitForTimeout(1100);
      const original=await pixels(), image=await page.locator('.hero-project img').boundingBox();
      await page.mouse.move(650,230);await page.waitForTimeout(1100);
      assert.notEqual(await pixels(),original,'Ponteiro precisa produzir mudança visual na arte');
      assert.deepEqual(await page.locator('.hero-project img').boundingBox(),image,'Arte não distorce o print');
      await page.mouse.move(0,0);await page.waitForTimeout(1100);
      assert.equal(await pixels(),original,'Sair do campo devolve a forma ao repouso');
      await page.locator('.signal-mode').click();await page.waitForTimeout(1100);
      assert.equal(await page.locator('.signal-mode').getAttribute('aria-pressed'),'true');
      assert.notEqual(await pixels(),original);
      await page.locator('.signal-reset').click();await page.mouse.move(0,0);await page.waitForTimeout(1100);
      assert.equal(await page.locator('.signal-mode').getAttribute('aria-pressed'),'false');
      assert.equal(await pixels(),original);
      await seek(page,.25);assert.notEqual(await pixels(),original);
      await seek(page,0);await page.waitForTimeout(400);assert.equal(await pixels(),original);
      const a=await page.evaluate(()=>window.__qaFrames);
      await page.waitForTimeout(400);
      const b=await page.evaluate(()=>window.__qaFrames);
      assert.equal(b-a,0,'A home parada não deve manter loop RAF');
      return {idleFrames:b-a};
    });
    await check('Header acompanha somente o comprimento da hero', async () => {
      await seek(page,.51);
      const header=await page.locator('.masthead').evaluate(el=>({position:getComputedStyle(el).position,top:el.getBoundingClientRect().top,parent:el.parentElement.className}));
      assert.equal(header.position,'sticky');assert.equal(header.top,0);assert.equal(header.parent,'journey');
      assert.equal(await page.locator('.home-mark').isVisible(),true);
      await seek(page,1.1);
      assert.ok(await page.locator('.masthead').evaluate(el=>el.getBoundingClientRect().bottom<=0));
      return header;
    });
    for (const [width, height] of [[1440, 1000], [1366, 768], [1024, 768], [768, 1024], [700, 900], [390, 844], [320, 740]]) {
      await check(`Layout e controles acessíveis em ${width}×${height}`, async () => {
        await page.setViewportSize({ width, height });
        for (const progress of [0, .12, .37, .625, .88]) {
          await seek(page, progress);
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
          const index = await page.locator('.formation-nav').boundingBox();
          if(index) assert.ok(index.x >= 0 && index.x + index.width <= width + 1);
          const header = await page.locator('.masthead').boundingBox();
          if(progress <= .625) assert.equal(header.y, 0); else assert.ok(header.y <= 0);
        }
        await seek(page, 0);
        for (const link of await page.locator('.direct-nav a').all()) {
          const control = await link.boundingBox();
          assert.ok(control.x >= 0 && control.x + control.width <= width && control.height >= 24);
        }
        await page.screenshot({ path: path.join(out, `verificado-${width}.png`) });
      });
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await check('Acessibilidade automatizada da abertura', async () => { await seek(page, 0); await accessibility(page, 'abertura-desktop'); });
    await check('Índice de projeto oferece entrada direta', async () => {
      await page.locator('.formation-nav [data-open="qozt"]').click();
      await page.waitForFunction(() => document.querySelector('.project-dialog').open);
      assert.ok(await page.evaluate(()=>!!document.activeElement.closest('dialog')));
      await accessibility(page,'indice-modal'); await page.keyboard.press('Escape'); await page.waitForTimeout(100);
    });
    for (const id of ['autopost', 'phron', 'qozt', 'natalia']) {
      await check(`Projeto ${id}: abre, prende foco, fecha por Esc e restaura posição`, async () => {
        await page.locator('.scene-'+id+' .piece-image').scrollIntoViewIfNeeded(); await page.waitForTimeout(60);
        const position = await page.evaluate(() => scrollY);
        const trigger = page.locator('.scene-'+id+' .piece-image');
        await trigger.click();
        assert.equal(await page.locator('dialog').evaluate(el => el.open), true);
        assert.ok(await page.locator('#dialog-title').innerText());
        await page.locator('.case-media img').evaluate(img => img.decode());
        await page.locator('.close-dialog').focus();
        await page.keyboard.press('Shift+Tab');
        assert.ok(await page.evaluate(() => !!document.activeElement.closest('dialog')));
        if (id === 'phron') {
          await page.locator('.inspection-toggle').click();
          assert.equal(await page.locator('.inspection').isVisible(), true);
          await accessibility(page, 'projeto-phron');
        }
        if (id === 'qozt') assert.equal(await page.locator('.case-notes a').first().getAttribute('href'), 'https://www.qozt.com.br/');
        assert.equal(await page.locator(`.case-notes a[href="projetos/${id}.html"]`).count(), 1);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(100); // dialog close restores scroll/focus in its queued close event
        assert.equal(await page.locator('dialog').evaluate(el => el.open), false);
        assert.equal(await page.evaluate(() => scrollY), position);
        assert.equal(await trigger.evaluate(el => el === document.activeElement), true);
      });
    }
    await check('Movimento reduzido elimina a passagem obrigatória e preserva os trabalhos', async () => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForFunction(() => document.documentElement.dataset.motion === 'off');
      assert.match(await page.locator('.scene-autopost h2').innerText(), /AUTOPOST/);
      assert.equal(await page.locator('.scene').evaluateAll(items=>items.every(el=>!el.inert)),true);
      assert.equal(await page.locator('.scene-autopost').isVisible(), true);
      assert.equal(await page.locator('html').getAttribute('data-motion'), 'off');
      assert.equal(await page.locator('.journey').isVisible(), true);
      assert.equal(await page.locator('.work-entry').count(), 3);
      await page.reload();
      assert.equal(await page.locator('html').getAttribute('data-motion'), 'off');
      await accessibility(page, 'sem-movimento');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.waitForFunction(() => document.documentElement.dataset.motion === 'on');
    });
    await check('Preferência do sistema sempre prevalece', async () => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      assert.equal(await page.locator('.journey').isVisible(), true);
      await page.waitForFunction(() => document.documentElement.dataset.motion === 'off');
      assert.equal(await page.locator('.motion-button,.site-menu').count(), 0);
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.waitForFunction(() => document.documentElement.dataset.motion === 'on');
    });
    await check('Teclado pula a abertura; conteúdo de trabalho recebe foco', async () => {
      await page.goto(base);
      await page.keyboard.press('Tab');
      assert.equal(await page.locator('.skip').evaluate(el => el === document.activeElement), true);
      await page.keyboard.press('Enter');
      assert.match(page.url(), /#trabalhos$/);
      assert.equal(await page.locator('#trabalhos').evaluate(el => el === document.activeElement), true);
    });
    await check('Celular: acessibilidade e detalhes sem transbordamento', async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(base);
      await accessibility(page, 'abertura-mobile');
      await page.locator('.formation-nav [data-open="qozt"]').click();
      await page.waitForFunction(() => document.querySelector('.project-dialog').open);

      await accessibility(page, 'projeto-mobile');
      assert.ok(await page.locator('dialog').evaluate(el => el.scrollWidth <= el.clientWidth + 1));
      await page.locator('.close-dialog').click();
    });
    await check('Sem JavaScript, os trabalhos e links continuam disponíveis', async () => {
      const staticContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
      const staticPage = await staticContext.newPage();
      await staticPage.goto(base);
      assert.equal(await staticPage.locator('.journey').isVisible(), true);
      assert.match(await staticPage.locator('.scene-autopost h2').innerText(), /AUTOPOST/);
      assert.equal(await staticPage.locator('.scene-autopost').isVisible(), true);
      assert.equal(await staticPage.locator('.work-entry').count(), 3);
      assert.equal(await staticPage.locator('.scene-qozt .piece-image').isVisible(), true);
      assert.equal(await staticPage.locator('#dr-paulo .work-cover').getAttribute('href'), 'projetos/dr-paulo.html');
      await staticPage.locator('.direct-nav a[href="projetos.html"]').click();
      assert.equal(await staticPage.locator('.archive-entry').count(), 9);
      await staticPage.locator('.archive-entry[data-project="dr-paulo"] h2 a').click();
      assert.match(await staticPage.locator('#desenvolvimento').innerText(), /construção/i);
      await staticContext.close();
    });
    await check('Nenhum recurso proibido ou dependência de animação no runtime', async () => {
      const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
      const css = ['style.css', 'editorial.css', 'opening.css', 'expression.css', 'archive-ink.css'].map(file => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
      assert.doesNotMatch(html, /skate\.webp|phron\.webp|consulting\.webp|✳|VOL\.\s*01|001/);
      assert.doesNotMatch(css, /rotate\(|drop-shadow|box-shadow|linear-gradient|radial-gradient|feTurbulence|border-radius:\s*[1-9]/);
      assert.doesNotMatch(html, /<script[^>]+https?:/);
    });
    await check('Servidor bloqueia scripts internos, arquivos de trabalho e travessia de diretório', async () => {
      for (const url of ['/scripts/servidor.cjs', '/.codex/pplx-thread', '/assets/fontes.json', '/..%5Cpackage.json']) {
        assert.equal((await fetch(base + url)).status, 403, url);
      }
      assert.deepEqual(report.errors, []);
    });
    await check('Abertura por arquivo local mantém navegação dos projetos', async () => {
      await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
      await page.locator('.skip').focus();
      await page.keyboard.press('Enter');
      await page.locator('#dr-paulo .work-cover').click();
      assert.match(await page.locator('h1').textContent(), /Dr. Paulo/);
    });
    await check('Navegação direta funciona por teclado e elimina o menu redundante', async () => {
      await page.goto(base);
      assert.equal(await page.locator('.direct-nav a').count(), 1);
      assert.equal(await page.locator('.site-menu,.motion-button').count(), 0);
      await page.locator('.direct-nav a').first().focus();
      await page.keyboard.press('Enter');
      await page.waitForURL('**/projetos.html');
      assert.match(page.url(), /projetos.html$/);
    });
    await check('Arquivo contém nove projetos distintos e a seleção corrigida', async () => {
      await page.goto(base + '/projetos.html');
      const ids = await page.locator('.archive-entry').evaluateAll(items => items.map(item => item.dataset.project));
      assert.deepEqual(ids, ['autopost', 'phron', 'qozt', 'natalia', 'dr-paulo', 'limozine', 'dominos', 'bmk-blink', 'odonto']);
      assert.equal(await page.locator('.archive-entry[data-project="autopost"] img').getAttribute('src'), 'assets/autopost-queue.jpg');
      assert.equal(await page.locator('.archive-entry[data-project="bmk-blink"] a').first().getAttribute('href'), 'projetos/bmk-blink.html');
      assert.equal(await page.locator('.archive-entry[data-project="dr-paulo"] img').getAttribute('src'), 'assets/revisao-23/dr-paulo-cover.webp');
      for (const width of [1440, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      }
      await accessibility(page, 'arquivo-mobile');
    });
    await check('Continuação revela imagens e títulos; fichas ficam inteiramente vermelhas', async () => {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto(base);
      const cover = page.locator('#dr-paulo .work-cover');
      const before = await cover.evaluate(el => getComputedStyle(el).clipPath);
      await cover.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1300);
      const after = await cover.evaluate(el => getComputedStyle(el).clipPath);
      assert.notEqual(before, after);
      assert.equal(after, 'inset(0px)');
      const colors = await page.locator('.work-information').evaluateAll(items => items.flatMap(el => [...el.querySelectorAll('p,h3,a,span')].map(child => getComputedStyle(child).color)));
      assert.ok(colors.every(color => color === 'rgb(193, 44, 32)'), JSON.stringify([...new Set(colors)]));
      return { before, after, color: colors[0] };
    });
    await check('Arquivo preserva proporções e não sobrepõe trabalhos', async () => {
      await page.goto(base + '/projetos.html');
      await page.evaluate(() => Promise.all([...document.images].map(img => { img.loading = 'eager'; return img.decode(); })));
      for (const width of [1440, 1024, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        const state = await page.locator('.archive-entry').evaluateAll(items => items.map(el => {
          const r = el.getBoundingClientRect(), img = el.querySelector('img'), ir = img.getBoundingClientRect();
          return { id: el.dataset.project, top: r.top, bottom: r.bottom, left: r.left, right: r.right, ratioError: Math.abs((ir.width / ir.height) / (img.naturalWidth / img.naturalHeight) - 1) };
        }));
        for (let i = 0; i < state.length; i++) {
          assert.ok(state[i].ratioError < .005, JSON.stringify(state[i]));
          for (let j = i + 1; j < state.length; j++) {
            const a = state[i], b = state[j];
            assert.ok(a.right <= b.left + 1 || b.right <= a.left + 1 || a.bottom <= b.top + 1 || b.bottom <= a.top + 1, width + ': ' + a.id + ' sobrepõe ' + b.id);
          }
        }
      }
    });
    await check('Print abre em cores originais, amplia, fecha e devolve foco sem saltar a leitura', async () => {
      await page.goto(base + '/projetos/dominos.html');
      const link = page.locator('.print-hero .print-open');
      await link.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1200);
      const y = await page.evaluate(() => scrollY);
      await link.click();
      assert.equal(await page.locator('.print-viewer').evaluate(el => el.open), true);
      await page.locator('.print-canvas img').evaluate(img => img.decode());
      assert.equal(await page.locator('.print-canvas img').evaluate(img => getComputedStyle(img).filter), 'none');
      await page.locator('.print-size').click();
      assert.ok(await page.locator('.print-canvas').evaluate(el => el.scrollWidth > el.clientWidth));
      await page.locator('.print-size').click();
      assert.ok(await page.locator('.print-canvas').evaluate(el => el.scrollWidth <= el.clientWidth + 1));
      await accessibility(page, 'ampliacao-print');
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.print-viewer').evaluate(el => el.open), false);
      assert.equal(await page.evaluate(() => scrollY), y);
      assert.equal(await link.evaluate(el => el === document.activeElement), true);
      assert.equal(await page.locator('.development a').getAttribute('href'), 'https://dominosblink.vercel.app/');
    });
    await check('Página completa amplia sem sobrepor o conteúdo e restaura foco', async () => {
      await page.goto(base + '/projetos/dr-paulo.html');
      const link = page.locator('[data-full]');
      await link.click();
      assert.equal(await page.locator('.print-viewer').evaluate(el => el.open), true);
      const img = page.locator('.print-canvas img');
      await img.evaluate(el => el.decode());
      assert.ok(await page.locator('.print-canvas').evaluate(el => el.scrollHeight > el.clientHeight * 2));
      assert.ok(await img.evaluate(el => { const r=el.getBoundingClientRect(); return Math.abs((r.width/r.height)/(el.naturalWidth/el.naturalHeight)-1)<.005; }));
      await page.keyboard.press('Escape');
      assert.equal(await link.evaluate(el => el === document.activeElement), true);
    });
    await check('AUTOPOST usa os três prints fornecidos com legendas corretas', async () => {
      await page.goto(base + '/projetos/autopost.html');
      const prints=await page.locator('.project-visual').evaluateAll(figures => figures.map(el => ({src:el.querySelector('img').getAttribute('src'),caption:el.querySelector('figcaption').textContent})));
      assert.equal(prints.length,3);
      assert.match(prints[0].caption,/calendário mensal/i);
      assert.match(prints[1].src,/autopost-calendar.jpg$/);
      assert.match(prints[1].caption,/Cadastro de unidades/);
      assert.match(prints[2].src,/autopost-hero.jpg$/);
      assert.match(prints[2].caption,/Fila de publicações/);
      const body=await page.locator('main').innerText();
      for(const term of ['80 unidades','React','AES-256-GCM','Row Level Security','Vitest','confirmação']) assert.ok(body.includes(term),term);
    });
    for (const project of require('./projetos.cjs')) {
      await check(`Caso completo ${project.id}: conteúdo, imagens, acessibilidade e próximo projeto`, async () => {
        await page.goto(base + '/projetos/' + project.id + '.html');
        assert.equal(await page.locator('h1').textContent(), project.name);
        assert.equal(await page.locator('.decision-grid article').count(), 3);
        assert.ok((await page.locator('.development').innerText()).length > 450);
        await page.evaluate(() => Promise.all([...document.images].map(img => { img.loading = 'eager'; return img.decode(); })));
        assert.ok(await page.evaluate(() => [...document.images].every(img => img.naturalWidth > 0)));
        assert.ok(await page.locator('.print-open').evaluateAll(links => links.every(link => link.querySelector('.print-action').getBoundingClientRect().top >= link.querySelector('img').getBoundingClientRect().bottom - 1)), 'Ampliar fica fora da interface, sem cobrir o conteúdo do print');
        for (const width of [1440, 768, 390, 320]) {
          await page.setViewportSize({ width, height: 900 });
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${project.id} ${width}`);
          const distorted = await page.locator('.project-visual img').evaluateAll(images => images.filter(img => {
            const rect = img.getBoundingClientRect();
            return Math.abs((rect.width / rect.height) / (img.naturalWidth / img.naturalHeight) - 1) > .005;
          }).map(img => img.src));
          assert.deepEqual(distorted, [], 'Capturas precisam manter suas proporções nativas');
        }
        await accessibility(page, 'caso-' + project.id);
        assert.equal((await fetch(new URL(await page.locator('.case-next').getAttribute('href'), page.url()))).status, 200);
      });
    }
    await check('Vídeo só carrega no rodapé, pausa fora dele e respeita escolha manual', async () => {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto(base);
      const video = page.locator('video');
      assert.equal(await video.getAttribute('src'), null);
      await page.locator('#liberdade').scrollIntoViewIfNeeded();
      await page.waitForFunction(() => { const v = document.querySelector('video'); return v.readyState >= 2 && !v.paused; });
      assert.equal(await video.evaluate(v => v.muted), true);
      assert.equal(await video.evaluate(v => v.duration), 24);
      await page.locator('.video-toggle').click();
      assert.equal(await video.evaluate(v => v.paused), true);
      await page.evaluate(() => scrollTo(0, 0));
      await page.locator('#liberdade').scrollIntoViewIfNeeded();
      assert.equal(await video.evaluate(v => v.paused), true);
      await page.locator('.video-toggle').click();
      await page.waitForFunction(() => !document.querySelector('video').paused);
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForFunction(() => document.querySelector('video').paused);
    });
    await check('Movimento reduzido e economia de dados não baixam o vídeo automaticamente', async () => {
      for (const saveData of [false, true]) {
        const ctx = await browser.newContext({ reducedMotion: saveData ? 'no-preference' : 'reduce' });
        if (saveData) await ctx.addInitScript(() => Object.defineProperty(navigator, 'connection', { value: { saveData: true } }));
        const tab = await ctx.newPage();
        await tab.goto(base); await tab.locator('#liberdade').scrollIntoViewIfNeeded();
        await tab.waitForTimeout(150);
        assert.equal(await tab.locator('video').getAttribute('src'), null);
        assert.equal(await tab.locator('video').evaluate(v => v.paused), true);
        await ctx.close();
      }
    });
    await check('Rodapé responsivo, contraste do vídeo e entrega parcial de mídia', async () => {
      await page.goto(base); await page.locator('#liberdade').scrollIntoViewIfNeeded();
      await page.waitForFunction(() => !document.querySelector('video').paused);
      await page.locator('.video-toggle').click();
      for (const width of [1440, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        await page.locator('#liberdade').scrollIntoViewIfNeeded();
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        const title = await page.locator('#outro-title').boundingBox();
        assert.ok(title.x >= 0 && title.x + title.width <= width);
      }
      // At 62% black, even a pure white video frame yields RGB 97,97,97.
      // Paper foreground against that maximum brightness exceeds 4.5:1.
      const alpha = await page.locator('.action-film').evaluate(el => Number(getComputedStyle(el, ':after').backgroundColor.match(/[\d.]+/g)[3]));
      assert.ok(alpha >= .62);
      await accessibility(page, 'rodape-mobile');
      const response = await fetch(base + '/assets/liberdade.mp4', { headers: { Range: 'bytes=0-1023' } });
      assert.equal(response.status, 206);
      assert.equal((await response.arrayBuffer()).byteLength, 1024);
      assert.match(response.headers.get('Content-Range'), /^bytes 0-1023\//);
      for (const range of ['bytes=999999999-', 'bytes=7-2', 'bytes=0-1,5-9', 'bytes=-0']) {
        assert.equal((await fetch(base + '/assets/liberdade.mp4', { headers: { Range: range } })).status, 416);
      }
      assert.deepEqual(report.errors, []);
    });
    await context.close();
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
    fs.writeFileSync(path.join(out, 'resultado.json'), JSON.stringify(report, null, 2));
    const failed = report.checks.filter(check => !check.passed);
    console.log(JSON.stringify({ passed: report.checks.length - failed.length, failed, errors: report.errors }, null, 2));
    if (failed.length || report.errors.length) process.exitCode = 1;
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
