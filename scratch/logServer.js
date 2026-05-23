const http = require('http');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'app_logs.txt');
fs.writeFileSync(logFile, '--- LOG START ---\n');

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/log') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        const timestamp = new Date().toISOString();
        const logLine = `[${timestamp}] ${parsed.message || body}\n`;
        fs.appendFileSync(logFile, logLine);
        console.log(logLine.trim());
      } catch (e) {
        fs.appendFileSync(logFile, `[ERR] ${body}\n`);
      }
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('ok');
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(8085, () => {
  console.log('Logging server listening on port 8085...');
});
