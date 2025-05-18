import http from 'http';
import https from 'https';
import httpProxy from 'http-proxy';

import { getRouterFromFirebaseConfig, getCerts } from './commons.js';

class ProxyManager {
  constructor(cert, key, routeTable) {
    this.cert = cert;
    this.key = key;
    this.proxies = [];
    this.routeProxies = {};
    this.routeTable = routeTable || {};
    this.lastDomain = '';
  }

  getTargetName(pathname) {
    for (const key of Object.keys(this.routeTable)) {
      if (pathname.toLowerCase().includes(key)) {
        return key;
      }
    }
    return 'default';
  }

  logDomainChange(req) {
    const host = req.headers.host?.split(':')[0] || 'localhost';
    const sourceDomain = req.headers['x-forwarded-host'] || host;
    if (this.lastDomain !== sourceDomain) {
      this.lastDomain = sourceDomain;
      console.log(`\n🔗 Source domain: ${sourceDomain}`);
    }
  }

  getOrCreateProxy(path) {
    const targetName = this.getTargetName(path);
    const target = this.routeTable[targetName];
    if (!this.routeProxies[targetName]) {
      const proxy = httpProxy.createProxyServer({
        target,
        ws: true,
        changeOrigin: true,
        secure: false,
      });

      proxy.on('proxyReq',  (proxyReq, req) => {
        proxyReq.setHeader('Connection', 'keep-alive');

        this.logDomainChange(req);
        console.log(`➡️ Proxying ${req.method} ${targetName} -> ${target}${req.url}`);
      });

      proxy.on('error',  (err, req, res) => {
        this.logDomainChange(req);
        console.error(`❌ Proxy error: ${err.message}`);
        if (!res.headersSent && res.writeHead) {
          res.writeHead(502, { 'Content-Type': 'text/plain' });
        }
        res.end(`Proxy error: ${err.message}`);
      });

      this.routeProxies[targetName] = proxy;
    }

    return {
      name: targetName,
      target,
      proxy: this.routeProxies[targetName],
    };
  }

  addMultiplexedProxy(port) {
    const server = https.createServer({ key: this.key, cert: this.cert }, (req, res) => {
      const { proxy } = this.getOrCreateProxy(req.url || '');
      proxy.web(req, res);
    });

    server.on('upgrade', (req, socket, head) => {
      this.logDomainChange(req);
      
      const { proxy, name } = this.getOrCreateProxy(req.url || '');
      proxy.ws(req, socket, head);
      console.log(`🛜 Proxying WebSocket ${name} -> ${req.url}`);
      
      socket.on('close', () => {
        this.logDomainChange(req);
        console.log(`❌ WebSocket disconnected from ${name}: ${req.url}`);
      });
    });

    server.listen(port, () => {
      console.log(`🌐 HTTPS Proxy running on https://0.0.0.0:${port}`);
    });

    this.proxies.push({ server, port });
  }

  addRedirect(port = 80) {
    const server = http.createServer((req, res) => {
      const host = req.headers.host?.split(':')[0] || 'localhost';
      const location = `https://${host}${req.url}`;
      res.writeHead(301, { Location: location });
      res.end();
    });

    server.listen(port, () => {
      console.log(`🔁 HTTP → HTTPS redirect on http://0.0.0.0:${port}`);
    });

    this.proxies.push({ server, port });
  }

  shutdown() {
    for (const [target, proxy] of Object.entries(this.routeProxies)) {
      console.log(`🛑 Stopping proxy for ${target}`);
      proxy.close?.();
    }

    for (const { server, port } of this.proxies) {
      console.log(`🛑 Stopping server on port ${port}`);
      server.close();
    }
  }
}

function logProccessHelp() {
  console.log(`
  Usage: node run.js [options]
  Options:
    --reactServer <url>           URL of the React server (default: http://localhost:3000)
    --firebaseConfigPath <path>   Path to firebase.json (default: current directory)
    --certsDir <path>             Directory for certificates (default: ./certs)
    --certPath <path>             Path to the certificate file (default: ./certs/localhost.pem)
    --certKeyPath <path>          Path to the key file (default: ./certs/localhost-key.pem)
    --domains <domains>           Comma-separated list of extra domains
  
  Configs:
    - firebase.json: Firebase config, searches in current directory and parent directories.
    - certs/.domains: (Comma|Line)-separated list of extra domains
  `);

  process.exit(0);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--help' || args[i] === '-h') {
      logProccessHelp();
    } else if (args[i] === '--version' || args[i] === '-v') {
      console.log('Version: 1.0.0');
      process.exit(0);
    }
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const value = args[i + 1];
      result[key] = value;
      i++;
    }
  }
  return result;
}

const args = parseArgs();

async function start() {
  console.log("\n");

  let routeTable = {
    ...getRouterFromFirebaseConfig(args.firebaseConfigPath),
    default: args.reactServer || 'http://localhost:3000',
  };
  for (const [key, value] of Object.entries(routeTable)) {
    console.log(`  🔧 URLs with '${key}' will be proxied to ${value}`);
  }
  console.log("\n");

  const extraDomains = (args.domains || '').split(',');
  const cert = await getCerts(
    extraDomains,
    args.certsDir,
    args.certPath,
    args.certKeyPath
  );

  console.log("\n");
  const manager = new ProxyManager(cert.cert, cert.key, routeTable);
  manager.addRedirect();
  manager.addMultiplexedProxy(443);

  const shutdownHandler = () => {
    console.log('\n🔻 Gracefully shutting down...');
    manager.shutdown();
    process.exit(0);
  };

  process.on('SIGINT', shutdownHandler);
  process.on('SIGTERM', shutdownHandler);
}

start();