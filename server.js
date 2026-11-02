// Zero-dependency static server: `npm start` → http://localhost:3000
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 3000;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.md': 'text/markdown; charset=utf-8'
};

function createServer() {
  return http.createServer((req, res) => {
    let p;
    try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400); return res.end('Bad request'); }
    if (p === '/') p = '/index.html';
    const file = path.normalize(path.join(ROOT, p));
    if (!file.startsWith(ROOT + path.sep) || p.split('/').some((s) => s.startsWith('.') && s.length > 1) || p.startsWith('/node_modules')) {
      res.writeHead(403); return res.end('Forbidden');
    }
    fs.readFile(file, (err, buf) => {
      if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(buf);
    });
  });
}

if (require.main === module) {
  createServer().listen(PORT, () => console.log(`ProcureLink running at http://localhost:${PORT}`));
}
module.exports = { createServer };
