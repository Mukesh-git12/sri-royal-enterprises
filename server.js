// Local service-request backend for Sri Royal Enterprises.
// Run: node server.js  then open http://localhost:3000
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const root = __dirname;
const port = process.env.PORT || 3000;
const requestStore = path.join(root, process.env.NODE_ENV === 'test' ? 'data-test' : 'data');
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.mp4':'video/mp4', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.svg':'image/svg+xml' };

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; if (body.length > 10_000) reject(new Error('Request too large')); });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

http.createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/api/service-requests') {
      const data = JSON.parse(await readBody(req));
      const fields = ['name', 'phone', 'appliance', 'message'];
      if (!fields.every(field => typeof data[field] === 'string' && data[field].trim())) {
        res.writeHead(400, {'Content-Type':'application/json'}); return res.end(JSON.stringify({error:'Please complete all fields.'}));
      }
      const request = { id: crypto.randomUUID(), receivedAt: new Date().toISOString(), name: data.name.trim().slice(0,100), phone: data.phone.trim().slice(0,30), appliance: data.appliance.trim().slice(0,80), message: data.message.trim().slice(0,1000) };
      await fs.mkdir(requestStore, {recursive:true});
      await fs.appendFile(path.join(requestStore, 'service-requests.ndjson'), JSON.stringify(request) + '\n', 'utf8');
      res.writeHead(201, {'Content-Type':'application/json'}); return res.end(JSON.stringify({id:request.id}));
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
    const requested = req.url === '/' ? '/index.html' : decodeURIComponent(req.url.split('?')[0]);
    const file = path.resolve(root, '.' + requested);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
    const content = await fs.readFile(file);
    res.writeHead(200, {'Content-Type':mime[path.extname(file).toLowerCase()] || 'application/octet-stream', 'X-Content-Type-Options':'nosniff'});
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch (error) {
    res.writeHead(error.code === 'ENOENT' ? 404 : 500, {'Content-Type':'application/json'});
    res.end(JSON.stringify({error:'Unable to process this request.'}));
  }
}).listen(port, '0.0.0.0', () => console.log(`Sri Royal Enterprises site running at http://localhost:${port}`));
