import fs from 'fs';
import http from 'http';
import https from 'https';
import path from 'path';
import httpProxy from 'http-proxy';

class ProxyManager {
  constructor(certPath, keyPath) {
    this.cert = fs.readFileSync(certPath);
    this.key = fs.readFileSync(keyPath);
    this.proxies = [];
  }

  addProxy({ httpsPort, target }) {
    const proxy = httpProxy.createProxyServer({
      target,
      ws: true,
      changeOrigin: true,
      secure: false,
    });

    proxy.on('proxyReq', function(proxyReq, req, res) {
      proxyReq.setHeader('Connection', 'keep-alive');
    });

    proxy.on('error', function (err, req, res) {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('Proxy error.');
    });

    const server = https.createServer({ key: this.key, cert: this.cert }, (req, res) => {
      proxy.web(req, res, {
        buffer: req,
        selfHandleResponse: false,
      }, (e) => {
        console.error(`❌ Proxy error on ${httpsPort} → ${target}:`, e.message);
      });
    });

    server.on('upgrade', (req, socket, head) => {
      proxy.ws(req, socket, head);
    });

    server.listen(httpsPort, () => {
      console.log(`✅ Proxy on https://localhost:${httpsPort} → ${target}`);
    });

    this.proxies.push({ server, proxy, httpsPort });
  }

  addRedirect(httpPort = 80) {
    const server = http.createServer((req, res) => {
      const host = req.headers.host?.split(':')[0] || 'localhost';
      const location = `https://${host}${req.url}`;
      res.writeHead(301, { Location: location });
      res.end();
    });

    server.listen(httpPort, () => {
      console.log(`🔁 HTTP to HTTPS redirect on http://0.0.0.0:${httpPort}`);
    });

    this.proxies.push({ server, httpsPort: httpPort });
  }

  shutdown() {
    for (const { server, httpsPort } of this.proxies) {
      server.close(() => {
        console.log(`🛑 Proxy on port ${httpsPort} stopped.`);
      });
    }
  }
}

// Auto-run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const CERT_DIR = path.resolve('./certs');
  const CERT = path.join(CERT_DIR, 'localhost.pem');
  const KEY = path.join(CERT_DIR, 'localhost-key.pem');

  const manager = new ProxyManager(CERT, KEY);

  manager.addRedirect();

  manager.addProxy({ httpsPort: 443, target: 'http://localhost:3000' });   // React Dev
  manager.addProxy({ httpsPort: 4431, target: 'http://localhost:8006' });  // Auth
  manager.addProxy({ httpsPort: 4432, target: 'http://localhost:8008' });  // Firestore
  manager.addProxy({ httpsPort: 4433, target: 'http://localhost:8010' });  // Hosting

  const shutdownHandler = () => {
    console.log('\n🔻 Gracefully shutting down...');
    manager.shutdown();
    process.exit(0);
  };

  process.on('SIGINT', shutdownHandler);
  process.on('SIGTERM', shutdownHandler);
}