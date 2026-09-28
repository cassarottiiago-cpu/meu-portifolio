const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.mp4': 'video/mp4' };
Object.assign(types, { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.avif': 'image/avif' });
function createServer(directory = root) {
  return http.createServer((request, response) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); } catch { response.writeHead(400).end(); return; }
    const file = path.resolve(directory, '.' + (pathname === '/' ? '/index.html' : pathname));
    const relative = path.relative(directory, file);
    if (!relative || relative.startsWith('..') || path.isAbsolute(relative) || relative.split(path.sep).some(part => part.startsWith('.')) ||
      ['scripts', 'validacao', 'dist'].includes(relative.split(path.sep)[0]) || !types[path.extname(file)] || !['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(403).end('Acesso não permitido'); return;
    }
    fs.stat(file, (error, stat) => {
      if (error || !stat.isFile()) { response.writeHead(404).end('Não encontrado'); return; }
      const headers = { 'Content-Type': types[path.extname(file)], 'Content-Length': stat.size, 'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer', 'Accept-Ranges': 'bytes' };
      let start = 0, end = stat.size - 1, status = 200;
      if (request.headers.range && request.method === 'GET') {
        const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range);
        if (!range || (!range[1] && !range[2])) { response.writeHead(416, { 'Content-Range': `bytes */${stat.size}` }).end(); return; }
        if (!range[1]) start = Math.max(0, stat.size - Number(range[2]));
        else { start = Number(range[1]); if (range[2]) end = Math.min(Number(range[2]), end); }
        if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= stat.size) { response.writeHead(416, { 'Content-Range': `bytes */${stat.size}` }).end(); return; }
        status = 206;
        headers['Content-Length'] = end - start + 1;
        headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
      }
      response.writeHead(status, headers);
      if (request.method === 'HEAD') return response.end();
      const stream = fs.createReadStream(file, { start, end });
      response.on('close', () => stream.destroy());
      stream.on('error', () => response.destroy()).pipe(response);
    });
  });
}
if (require.main === module) {
  const server = createServer();
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
  server.listen(Number(process.env.PORT || 4177), '127.0.0.1', () => console.log(`Direção 03: http://127.0.0.1:${server.address().port}`));
}
module.exports = { createServer };
