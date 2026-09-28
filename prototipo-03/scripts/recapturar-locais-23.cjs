const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { spawn } = require('node:child_process');
const { randomBytes, randomUUID } = require('node:crypto');
const { tmpdir } = require('node:os');
const { pathToFileURL } = require('node:url');
const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
const sharp = require('C:/Users/iago cassarotti/site-nat-work/node_modules/sharp');

const out = path.resolve(__dirname, '../assets/revisao-23');
const proof = path.resolve(__dirname, '../validacao/capturas-locais-23');
const phron = 'D:/HD NOVO/AREA DE TRABALHO/PHRON';
const nat = 'C:/Users/iago cassarotti/site-nat-work/dist';
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };
const reportFile = path.join(out, 'locais-origens.json');
const reports = fs.existsSync(reportFile) ? JSON.parse(fs.readFileSync(reportFile, 'utf8')) : [];

function staticServer(root) {
  return http.createServer((req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : decodeURIComponent(pathname)));
    if (!file.startsWith(path.resolve(root) + path.sep)) return res.writeHead(403).end();
    fs.stat(file, (error, info) => {
      if (error || !info.isFile()) return res.writeHead(404).end();
      res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(file).pipe(res);
    });
  });
}

async function ready(url) {
  for (let i = 0; i < 70; i++) {
    try { const response = await fetch(url, { signal: AbortSignal.timeout(1500) }); if (response.status < 500) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 400));
  }
  throw new Error('Host local não iniciou.');
}

async function settled(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].filter(img => img.getBoundingClientRect().width > 0).every(img => img.complete && img.naturalWidth > 0), null, { timeout: 20000 });
  await page.evaluate(async () => { await Promise.all([...document.images].filter(img => img.complete).map(img => img.decode().catch(() => {}))); });
  await page.waitForTimeout(1500);
}

async function save(page, id, details, options = {}) {
  const raw = await page.screenshot({ animations: 'disabled', ...options });
  const info = await sharp(raw).metadata();
  await sharp(raw).webp({ quality: 94, effort: 5 }).toFile(path.join(out, id + '.webp'));
  await sharp(raw).resize({ width: 1440, withoutEnlargement: true }).png().toFile(path.join(proof, id + '.png'));
  const images = await page.evaluate(() => [...document.images].filter(img => img.getBoundingClientRect().width > 0).map(img => ({ src: new URL(img.currentSrc || img.src).pathname, loaded: img.complete && img.naturalWidth > 0, width: img.naturalWidth, height: img.naturalHeight })));
  const record = { id, file: 'revisao-23/' + id + '.webp', width: info.width, height: info.height, capturedAt: new Date().toISOString(), title: await page.title(), readiness: { fonts: 'ready', images, animationWaitMs: 1500, screenshotAnimations: 'disabled after original entrance finished' }, ...details };
  const previous = reports.findIndex(entry => entry.id === id);
  if (previous !== -1) reports.splice(previous, 1);
  reports.push(record);
  fs.writeFileSync(path.join(out, 'locais-origens.json'), JSON.stringify(reports, null, 2));
  console.log(JSON.stringify({ id, width: info.width, height: info.height }));
}

(async () => {
  fs.mkdirSync(out, { recursive: true });
  fs.mkdirSync(proof, { recursive: true });
  const local = staticServer(nat);
  await new Promise(resolve => local.listen(0, '127.0.0.1', resolve));
  let browser, child;
  try {
    browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
    if (!process.argv.includes('--phron')) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:' + local.address().port, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => !document.documentElement.classList.contains('abertura-pendente'), null, { timeout: 15000 });
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += 650) { await page.evaluate(y => window.scrollTo(0, y), y); await page.waitForTimeout(450); }
    await settled(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1800);
    const heroBottom = await page.locator('.hero').evaluate(el => Math.ceil(el.getBoundingClientRect().bottom + window.scrollY));
    await save(page, 'natalia-inicio', { source: 'Build local site-nat-work/dist, 21/09/2026; somente leitura.', framing: 'Header e seção hero inteira, limite obtido no DOM.', viewport: [1440, 1100], heroBottom }, { clip: { x: 0, y: 0, width: 1440, height: heroBottom } });
    const sobre = page.locator('#sobre');
    await sobre.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1600);
    const box = await sobre.boundingBox();
    const y = await page.evaluate(() => window.scrollY);
    await save(page, 'natalia-sobre', { source: 'Build local site-nat-work/dist, 21/09/2026; somente leitura.', framing: 'Seção Sobre inteira, sem remover componentes.' }, { fullPage: true, clip: { x: 0, y: box.y + y, width: 1440, height: Math.ceil(box.height) } });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);
    await save(page, 'natalia-completo', { source: 'Build local site-nat-work/dist, 21/09/2026; somente leitura.', framing: 'Página completa após percorrer todas as seções e concluir carregamentos.' }, { fullPage: true });
    await context.close();
    }

    // Never reuse the live instance, its data folder, cookies, or signing key.
    const data = fs.mkdtempSync(path.join(tmpdir(), 'portfolio-local-23-phron-'));
    const secret = randomBytes(48).toString('hex');
    const port = 4319;
    child = spawn(process.execPath, [phron + '/node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
      cwd: phron, windowsHide: true, env: { ...process.env, PHRON_WORKSPACE_DATABASE: 'sqlite', PHRON_DATA_DIR: data, PHRON_BACKUP_DIR: path.join(data, 'backups'), PHRON_SESSION_SECRET: secret, GROQ_API_KEY: '', PHRON_IA_CHAVE: '', NODE_ENV: 'production' }, stdio: ['ignore', 'pipe', 'pipe']
    });
    child.stdout.on('data', () => {});
    child.stderr.on('data', () => {});
    await ready('http://127.0.0.1:' + port);
    const { SignJWT } = await import(pathToFileURL(phron + '/node_modules/jose/dist/webapi/index.js').href);
    const token = await new SignJWT({ email: 'portfolio@example.invalid', nome: 'Demonstração' }).setProtectedHeader({ alg: 'HS256' }).setSubject('portfolio-local-23').setIssuer('phron').setJti(randomUUID()).setIssuedAt().setExpirationTime('15m').sign(new TextEncoder().encode(secret));
    const phronContext = await browser.newContext({ viewport: { width: 1440, height: 1400 }, deviceScaleFactor: 2, colorScheme: 'dark', reducedMotion: 'reduce' });
    await phronContext.addCookies([{ name: 'phron_sessao', value: token, url: 'http://127.0.0.1:' + port, httpOnly: true, sameSite: 'Lax' }]);
    await phronContext.addInitScript(() => localStorage.setItem('phron_theme', 'dark'));
    const phronPage = await phronContext.newPage();
    await phronPage.goto('http://127.0.0.1:' + port, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await phronPage.locator('[data-view]').waitFor({ state: 'visible', timeout: 20000 });
    await phronPage.waitForTimeout(3000);
    if (/login/.test(phronPage.url())) throw new Error('PHRON voltou ao login; não foi capturado.');
    await settled(phronPage);
    if (!(await phronPage.locator('html').getAttribute('class')).includes('dark')) throw new Error('PHRON não está no tema dark.');
    for (let attempt = 0; attempt < 3; attempt++) {
      const missing = await phronPage.locator('main').evaluate(el => Math.ceil(el.scrollHeight - el.clientHeight));
      if (missing < 2) break;
      const viewport = phronPage.viewportSize();
      await phronPage.setViewportSize({ width: viewport.width, height: Math.min(2400, viewport.height + missing + 18) });
      await phronPage.waitForTimeout(600);
    }
    const layout = await phronPage.evaluate(() => ({ text: document.body.innerText, views: [...document.querySelectorAll('[data-view]')].map(el => ({ view: el.dataset.view, rect: el.getBoundingClientRect().toJSON(), scrollHeight: el.scrollHeight })), scrollable: [...document.querySelectorAll('main,section,div')].filter(el => el.clientHeight > 100 && el.scrollHeight > el.clientHeight + 5 && ['auto','scroll'].includes(getComputedStyle(el).overflowY)).map(el => ({ tag: el.tagName, class: el.className, clientHeight: el.clientHeight, scrollHeight: el.scrollHeight })) }));
    fs.writeFileSync(path.join(proof, 'phron-layout.json'), JSON.stringify(layout, null, 2));
    if (layout.scrollable.some(entry => entry.tag === 'MAIN')) throw new Error('Conteúdo da Home não coube integralmente na janela de captura.');
    await save(phronPage, 'phron-noturno-inicio', { source: 'Build local PHRON de 20/09/2026; SQLite temporário vazio e sessão exclusiva, sem dados da instância pessoal.', framing: 'Janela ampliada até caberem todos os widgets, tema noturno; nenhum componente removido.', viewport: Object.values(phronPage.viewportSize()), isolatedData: true, layout });
    // A second real screen, reached using the app navigation state, no DOM edits.
    await phronPage.evaluate(() => {
      const key = 'phron:workspace:phron-matriz-core:v1:modulo';
      localStorage.setItem(key, JSON.stringify('agenda'));
      window.dispatchEvent(new StorageEvent('storage', { key }));
    });
    await phronPage.setViewportSize({ width: 1440, height: 1000 });
    await phronPage.waitForTimeout(2000);
    await settled(phronPage);
    const active = await phronPage.locator('[data-view]').getAttribute('data-view');
    if (active !== 'agenda') throw new Error('A aba agenda não ficou ativa: ' + active);
    await save(phronPage, 'phron-noturno-agenda', { source: 'Build local PHRON de 20/09/2026; SQLite temporário vazio e sessão exclusiva.', framing: 'Aba Agenda completa em modo noturno; banco de demonstração sem compromissos pessoais.', viewport: [1440, 1000], isolatedData: true });
    await phronContext.close();
  } finally {
    if (browser) await browser.close();
    local.close();
    if (child) child.kill();
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
