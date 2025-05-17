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

  addMultiplexedProxy(httpsPort, routeTable) {
    const server = https.createServer({ key: this.key, cert: this.cert }, (req, res) => {
      const pathname = req.url || '';
      console.log(`🔄 Proxying request for ${pathname}`);
      const matched = Object.entries(routeTable).find(([key]) => pathname.includes(key));
      const target = matched?.[1] || routeTable['default'];

      const proxy = httpProxy.createProxyServer({
        target,
        ws: true,
        changeOrigin: true,
        secure: false,
      });

      proxy.on('proxyReq', function(proxyReq, req, res) {
        proxyReq.setHeader('Connection', 'keep-alive');
        console.log(`Proxying request to: ${target}${req.url}`);
      });

      proxy.on('error', function (err, req, res) {
        console.error(`Proxy error: ${err.message}`);
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Proxy error.');
      });

      proxy.web(req, res);
    });

    server.on('upgrade', (req, socket, head) => {
      const pathname = req.url || '';
      console.log(`🔄 Proxying WebSocket request for ${pathname}`);
      const matched = Object.entries(routeTable).find(([key]) => pathname.includes(key));
      const target = matched?.[1] || routeTable['default'];

      const proxy = httpProxy.createProxyServer({
        target,
        ws: true,
        changeOrigin: true,
        secure: false,
      });

      proxy.ws(req, socket, head);
    });

    server.listen(httpsPort, () => {
      console.log(`🌐 Multiplexed proxy on https://localhost:${httpsPort}`);
    });

    this.proxies.push({ server, httpsPort });
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
  const CERT_DIR = path.join(__dirname, './certs');
  const CERT = path.join(CERT_DIR, 'localhost.pem');
  const KEY = path.join(CERT_DIR, 'localhost-key.pem');

  const manager = new ProxyManager(CERT, KEY);

  manager.addRedirect();

  manager.addMultiplexedProxy(443, {
    'firestore': 'http://localhost:8008',
    'default': 'http://localhost:3000',
  });

  const shutdownHandler = () => {
    console.log('\n🔻 Gracefully shutting down...');
    manager.shutdown();
    process.exit(0);
  };

  process.on('SIGINT', shutdownHandler);
  process.on('SIGTERM', shutdownHandler);
}