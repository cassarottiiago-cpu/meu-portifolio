const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
execFileSync(process.execPath, ['--check', path.join(root, 'app.js')]);
execFileSync(process.execPath, ['--check', path.join(root, 'site.js')]);
execFileSync(process.execPath, ['--check', path.join(root, 'signal.js')]);
require('./gerar-paginas.cjs').generate();
const files = ['index.html', 'projetos.html', 'creditos.html', 'style.css', 'editorial.css', 'opening.css', 'expression.css', 'archive-ink.css', 'app.js', 'signal.js', 'site.js', 'icon.svg'];
const destination = path.join(root, 'dist');
fs.mkdirSync(destination, { recursive: true });
for (const file of files) fs.copyFileSync(path.join(root, file), path.join(destination, file));
fs.cpSync(path.join(root, 'assets'), path.join(destination, 'assets'), { recursive: true });
fs.cpSync(path.join(root, 'projetos'), path.join(destination, 'projetos'), { recursive: true });
const pages = ['index.html', 'projetos.html', 'creditos.html', ...require('./projetos.cjs').map(p => 'projetos/' + p.id + '.html')];
for (const file of fs.readdirSync(path.join(destination, 'projetos'))) {
  if (file.endsWith('.html') && !pages.includes('projetos/' + file)) fs.unlinkSync(path.join(destination, 'projetos', file));
}
for (const page of pages) {
  const html = fs.readFileSync(path.join(destination, page), 'utf8');
  for (const [, ref] of html.matchAll(/(?:href|src|poster|data-src)="([^"]+)"/g)) {
    if (/^(?:https?:|#)/.test(ref)) continue;
    const target = path.resolve(destination, path.dirname(page), ref.split('#')[0]);
    const relative = path.relative(destination, target);
    if (relative.startsWith('..') || !fs.existsSync(target)) throw Error(`Recurso ausente no build: ${page} -> ${ref}`);
  }
}
console.log('Links e recursos locais das ' + pages.length + ' páginas conferidos no build.');
console.log('Build estático em prototipo-03/dist. Nenhuma publicação realizada.');
