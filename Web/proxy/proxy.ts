import http, { IncomingMessage } from 'http';
import https from 'https';
import ProxyServer from 'http-proxy';

import { getRouterFromFirebaseConfig, addDomainsToConfigFile, getCerts } from './commons.js';
import type { CertResult, Domain, RouteTable } from './commons.js';

type ProxyInstance = {
  server: http.Server | https.Server;
  port: number;
};

class ProxyManager {
  private proxies: ProxyInstance[] = [];
  private routeProxies: Record<string, ProxyServer> = {};
  private lastDomain: Domain = '';
  private manifestCached: string[] = [];
  private knownDomains: Domain[];
  public static readonly requestPerDomain: Record<
    string, Record<string, number>
  > = {};

  constructor(private routeTable: RouteTable, private certInfo: CertResult) {
    this.knownDomains = certInfo.domains;
  }

  async handleUnknownDomain(domain: Domain): Promise<void> {
    if (this.knownDomains.includes(domain)) return;
    if (!this.certInfo.generated) {
      console.log(`⚠️ Domain ${domain} not found in the custom certificate.`);
      return;
    }

    console.log(`🌐 New domain detected: ${domain}, updating certificate`);

    addDomainsToConfigFile([domain]);
    this.knownDomains.push(domain);
    this.certInfo = await getCerts(Array.from(this.knownDomains));

    this.restartServers();
  }

  restartServers(): void {
    console.log('🔄 Restarting servers to apply new certificate...');
    this.shutdown();
    this.addRedirect();
    this.addMultiplexedProxy();
  }

  private static readonly serviceRules: Record<string, (pathname: string) => boolean> = {
    firestore: (pathname) => pathname.includes('google.firestore.v1.Firestore/'),
  };

  getTargetName(pathname: string): string {
    for (const [key, rule] of Object.entries(ProxyManager.serviceRules)) {
      if (rule(pathname)) return key;
    }
    return 'default';
  }

  getHostName(req: IncomingMessage): string {
    const host = req.headers.host?.split(':')[0] || 'localhost';
    return req.headers['x-forwarded-host'] as string || host;
  }

  logDomainChange(req: IncomingMessage): string {
    const sourceDomain = this.getHostName(req);

    if (this.lastDomain !== sourceDomain) {
      this.lastDomain = sourceDomain;
      console.log(`\n🔗 Source domain: ${sourceDomain}`);

      // Verifica se o domínio é conhecido
      this.handleUnknownDomain(sourceDomain);
    }
    return sourceDomain;
  }

  getOrCreateProxy(path: string): { name: string; target: string; proxy: ProxyServer } {
    const targetName = this.getTargetName(path);
    const target = this.routeTable[targetName];
    if (!this.routeProxies[targetName]) {
      const proxy = ProxyServer.createProxyServer({
        target,
        ws: true,
        changeOrigin: true,
        secure: false,
      });

      proxy.on('proxyReq', (proxyReq, req, res) => {
        const domain = this.logDomainChange(req);

        if (!ProxyManager.requestPerDomain[domain]) ProxyManager.requestPerDomain[domain] = {};
        ProxyManager.requestPerDomain[domain][targetName] = 
          (ProxyManager.requestPerDomain[domain][targetName] || 0) + 1;

        if (this.isManifest(req)) {
          if (this.needIntercept(req, res)) {
            proxyReq.removeHeader('If-Modified-Since');
            proxyReq.removeHeader('If-None-Match');
          } else {
            proxyReq.destroy();
          }
        } else {
          console.log(`➡️ Proxying ${req.method} ${targetName} -> ${target}${req.url}`);
        }
      });

      proxy.on('proxyRes', (proxyRes, req, res) => {
        if (this.isManifest(req))
          this.handleManifestModification(proxyRes, req, res);
      });

      proxy.on('error', (err, req, res) => {
        this.logDomainChange(req);
        console.error(`❌ Proxy error: ${err.message}`);
        res?.end(`Proxy error: ${err.message}`);
      });

      this.routeProxies[targetName] = proxy;
    }

    return {
      name: targetName,
      target,
      proxy: this.routeProxies[targetName],
    };
  }

  addMultiplexedProxy(port = 443): void {
    const { cert, key } = this.certInfo;
    const server = https.createServer({ key, cert }, (req, res) => {
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

  addRedirect(port = 80): void {
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

  shutdown(): void {
    for (const [target, proxy] of Object.entries(this.routeProxies)) {
      console.log(`🛑 Stopping proxy for ${target}`);
      proxy.close?.();
    }

    for (const { server, port } of this.proxies) {
      console.log(`🛑 Stopping server on port ${port}`);
      server.close();
    }
    this.proxies = [];
    this.routeProxies = {};
  }

  private isManifest(req: IncomingMessage): boolean {
    return req.url?.endsWith('manifest.json') || false;
  }

  private needIntercept(req: IncomingMessage, res: http.ServerResponse): boolean {
    const eTag = req.headers['if-none-match'];
    if (!eTag) return false;

    const hasSended = this.manifestCached.includes(eTag);
    if (hasSended) {
      res.writeHead(304, { 'Content-Type': 'application/json' });
      res.end();
      return false;
    }

    return true;
  }

  private handleManifestModification(proxyRes: http.IncomingMessage, req: IncomingMessage, res: http.ServerResponse): void {
    proxyRes.pipe = (() => { }) as any;

    const sourceDomain = this.getHostName(req);
    let body = '';

    proxyRes.on('data', (chunk) => {
      body += chunk.toString();
      console.log('📦 Received chunk of manifest.json');
    });

    proxyRes.on('end', () => {
      try {
        const manifest = JSON.parse(body);
        manifest.name += ' - ' + sourceDomain;
        manifest.short_name = sourceDomain;

        const modifiedBody = JSON.stringify(manifest, null, 2);
        const eTag = `W/"${Buffer.byteLength(modifiedBody)}-${Date.now()}"`;
        this.manifestCached.push(eTag);

        res.writeHead(200, {
          ...proxyRes.headers,
          'ETag': eTag,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(modifiedBody),
        });
        res.end(modifiedBody);

        console.log('📝 Manifest.json modificado e enviado:', eTag, modifiedBody);
      } catch (err) {
        console.error('❌ Erro ao modificar o manifest.json:', body, err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Erro ao processar manifest.json');
      }
    });

    proxyRes.on('error', (err) => {
      console.error('❌ Erro no proxyRes:', err);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Erro interno ao processar a resposta.');
      }
    });

    console.log('📝 Interceptando manifest.json from ' + sourceDomain);
  }
}

function logProccessHelp(): void {
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

function parseArgs(): Record<string, string> {
  const args = process.argv.slice(2);
  const result: Record<string, string> = {};
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

async function start(): Promise<void> {
  console.log("\n");

  const routeTable: RouteTable = {
    ...getRouterFromFirebaseConfig(args.firebaseConfigPath),
    default: args.reactServer || 'http://web:3000',
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
  const manager = new ProxyManager(routeTable, cert);
  manager.addRedirect();
  manager.addMultiplexedProxy();

  const shutdownHandler = (): void => {
    console.log('\n Request per domain:', ProxyManager.requestPerDomain);
    console.log('\n🔻 Gracefully shutting down...');
    manager.shutdown();
    process.exit(0);
  };

  process.on('SIGINT', shutdownHandler);
  process.on('SIGTERM', shutdownHandler);
}

start();
