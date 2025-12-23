const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Servir index.html pour toutes les routes (SPA)
  if (req.url === '/' || req.url.startsWith('/src/') || req.url.startsWith('/@')) {
    const filePath = req.url === '/' ? '/index.html' : req.url;

    try {
      const fullPath = path.join(__dirname, filePath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath);
        const ext = path.extname(filePath);
        const contentType = {
          '.html': 'text/html',
          '.js': 'application/javascript',
          '.css': 'text/css',
          '.json': 'application/json',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.svg': 'image/svg+xml'
        }[ext] || 'text/plain';

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
        return;
      }
    } catch (error) {
      console.error('Error serving file:', error);
    }
  }

  // Fallback to index.html for SPA routing
  try {
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
      return;
    }
  } catch (error) {
    console.error('Error serving index.html:', error);
  }

  res.writeHead(404);
  res.end('File not found');
});

server.listen(5175, () => {
  console.log('Simple server running on http://localhost:5175');
});
