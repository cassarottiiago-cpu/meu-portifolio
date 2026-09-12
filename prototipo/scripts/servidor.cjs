const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.md': 'text/plain; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
function createServer() {
  return http.createServer((request, response) => {
    let url;
    try { url = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); } catch { response.writeHead(400).end(); return; }
    const file = path.resolve(root, '.' + (url === '/' ? '/index.html' : url));
    const relative = path.relative(root, file);
    const allowed = relative && !relative.startsWith('..') && !path.isAbsolute(relative) && !relative.split(path.sep).some(part => part.startsWith('.')) && !['scripts', 'validacao'].includes(relative.split(path.sep)[0]) && types[path.extname(file)];
    if (!allowed || !['GET', 'HEAD'].includes(request.method)) { response.writeHead(403).end('Acesso não permitido'); return; }
    fs.stat(file, (error, stat) => {
      if (error || !stat.isFile()) { response.writeHead(404).end('Não encontrado'); return; }
      response.writeHead(200, { 'Content-Type': types[path.extname(file)], 'Content-Length': stat.size, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer' });
      if (request.method === 'HEAD') return response.end();
      fs.createReadStream(file).on('error', () => response.destroy()).pipe(response);
    });
  });
}
if (require.main === module) {
  const port = Number(process.env.PORT || 4177);
  const server = createServer();
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log(`Portfólio local: http://127.0.0.1:${server.address().port}`));
}
module.exports = { createServer };
