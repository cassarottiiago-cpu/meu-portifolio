const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { spawn } = require('node:child_process');
const { randomBytes, randomUUID } = require('node:crypto');
const { tmpdir } = require('node:os');
const { pathToFileURL } = require('node:url');
const { chromium } = require('C:/Users/iago cassarotti/PHRON-revisao/navegador/node_modules/playwright-core');
const sharp = require('C:/Users/iago cassarotti/site-nat-work/node_modules/sharp');
const project = path.resolve(__dirname, '../..');
const out = path.join(project, 'prototipo-03/assets');
const evidence = path.join(__dirname, 'capturas');
const phron = 'D:/HD NOVO/AREA DE TRABALHO/PHRON';
const nat = 'C:/Users/iago cassarotti/site-nat-work/dist';
const port = 4318;
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.woff2': 'font/woff2', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
const local = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const file = path.resolve(nat, '.' + (pathname === '/' ? '/index.html' : decodeURIComponent(pathname)));
  if (!file.startsWith(path.resolve(nat) + path.sep)) return res.writeHead(403).end();
  fs.stat(file, (error, info) => {
    if (error || !info.isFile()) return res.writeHead(404).end();
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
});
async function ready(url) {
  for (let attempt = 0; attempt < 80; attempt++) {
    try { const r = await fetch(url); if (r.status < 600) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error('Servidor da captura não iniciou.');
}
(async () => {
  fs.mkdirSync(out, { recursive: true });
  fs.mkdirSync(evidence, { recursive: true });
  // A fresh SQLite database and ephemeral signing key protect the actual workspace.
  // The source and existing .phron-data are never modified by this script.
  const data = fs.mkdtempSync(path.join(tmpdir(), 'portfolio-capture-phron-'));
  const secret = randomBytes(48).toString('hex');
  const child = spawn(process.execPath, [phron + '/node_modules/next/dist/bin/next', 'start',
    '--hostname', '127.0.0.1', '--port', String(port)], { cwd: phron, windowsHide: true,
    env: { ...process.env, PHRON_WORKSPACE_DATABASE: 'sqlite', PHRON_DATA_DIR: data,
      PHRON_SESSION_SECRET: secret, GROQ_API_KEY: '', NODE_ENV: 'production' }, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', () => {});
  child.stderr.on('data', () => {});
  let browser;
  const records = [];
  try {
    await ready(`http://127.0.0.1:${port}`);
    await new Promise(resolve => local.listen(0, '127.0.0.1', resolve));
    browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
    const { SignJWT } = await import(pathToFileURL(phron + '/node_modules/jose/dist/webapi/index.js').href);
    const token = await new SignJWT({ email: 'portfolio@example.invalid', nome: 'Iago' })
      .setProtectedHeader({ alg: 'HS256' }).setSubject('portfolio-capture').setIssuer('phron')
      .setJti(randomUUID()).setIssuedAt().setExpirationTime('15m').sign(new TextEncoder().encode(secret));
    for (const item of [
      { id: 'phron-noturno', url: `http://127.0.0.1:${port}`, source: 'Build local PHRON; banco temporário vazio; sessão exclusiva de captura; tema dark.' },
      { id: 'qozt', url: 'https://www.qozt.com.br/', source: 'Site publicado indicado pelo usuário. Alegações do site não são resultados verificados do portfólio.' },
      { id: 'natalia', url: `http://127.0.0.1:${local.address().port}`, source: 'Build local em site-nat-work/dist, sem alteração de conteúdo.' }
    ]) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 3,
        colorScheme: item.id === 'phron-noturno' ? 'dark' : 'light', reducedMotion: 'reduce' });
      if (item.id === 'phron-noturno') {
        await context.addCookies([{ name: 'phron_sessao', value: token, url: item.url, httpOnly: true, sameSite: 'Lax' }]);
        await context.addInitScript(() => localStorage.setItem('phron_theme', 'dark'));
      }
      const page = await context.newPage();
      const response = await page.goto(item.url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1200);
      if (item.id === 'phron-noturno') {
        if (/login/.test(page.url())) throw new Error('PHRON redirecionou ao login; captura cancelada.');
        if (!(await page.locator('html').getAttribute('class')).includes('dark')) throw new Error('Tema noturno não aplicado.');
      }
      const raw = await page.screenshot();
      await sharp(raw).webp({ quality: 94, effort: 5 }).toFile(path.join(out, item.id + '-3x.webp'));
      await sharp(raw).resize(1440).png().toFile(path.join(evidence, item.id + '.png'));
      await sharp(raw).resize(1600).webp({ quality: 86 }).toFile(path.join(out, item.id + '.webp'));
      records.push({ id: item.id, source: item.source, url: item.id === 'qozt' ? page.url() : item.id === 'natalia' ? 'site-nat-work/dist' : 'PHRON/.next',
        capturedAt: new Date().toISOString(), status: response.status(), title: await page.title(),
        cssViewport: [1440, 1000], deviceScaleFactor: 3, pixels: [4320, 3000],
        image: item.id + '-3x.webp', theme: item.id === 'phron-noturno' ? 'dark' : 'original' });
      console.log('Capturado: ' + item.id + ' (4320 × 3000)');
      await context.close();
    }
    const fonts = ['barlow-condensed-bold.ttf', 'dm-sans.woff2'];
    fs.mkdirSync(path.join(out, 'fonts'), { recursive: true });
    fs.mkdirSync(path.join(out, 'licenses'), { recursive: true });
    for (const file of fonts) fs.copyFileSync(path.join(project, 'prototipo/assets/fonts', file), path.join(out, 'fonts', file));
    for (const file of ['barlow-condensed.txt', 'dm-sans.txt']) fs.copyFileSync(path.join(project, 'prototipo/assets/licenses', file), path.join(out, 'licenses', file));
    fs.writeFileSync(path.join(evidence, 'origens.json'), JSON.stringify(records, null, 2));
  } finally {
    if (browser) await browser.close();
    local.close();
    child.kill();
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
