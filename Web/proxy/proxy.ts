import http, { ClientRequest, IncomingMessage, ServerResponse } from "http";
import https from "https";
import ProxyServer from "http-proxy";

import plugins from "./plugins/index.js";
import { addDomainsToConfigFile, getCerts } from "./commons.js";
import type { CertResult, Domain, OverrideRules, RouteTable } from "./commons.js";

const oldConsole = console.log;
console.log = async (...args: any) => oldConsole(...args);

type ProxyInstance = {
  server: http.Server | https.Server;
  port: number;
};

export type Plugin = Promise<{
  routeTable: RouteTable;
  serviceRules: ServiceRules;
  override: OverrideRules
}>;

export type ServiceRules = Record<
  string,
  (domain: string, pathname: string) => boolean
>;

export class ProxyManager {
  private plugins: Plugin[];
  private routeTable: RouteTable
  private serviceRules: ServiceRules
  private overrides: OverrideRules[] = [];
  private proxies: ProxyInstance[] = [];
  private routeProxies: Record<string, ProxyServer> = {};
  private lastDomain: Domain = "";
  private knownDomains: Domain[];
  public static readonly requestPerDomain: Record<
    string,
    Record<string, number>
  > = {};

  constructor(
    defaultConfig?: Plugin,
    private certInfo?: CertResult
  ) {
    this.knownDomains = certInfo?.domains || [];
    this.routeTable = {};
    this.serviceRules = {};

    this.plugins = [defaultConfig, ...plugins];
    this.loadPlugins();
  }

  private async loadPlugins(): Promise<void> {
    console.log(`\n🔌 Loading ${this.plugins.length} plugins...`);
    for (const pluginPromise of this.plugins) {
      let plugin;
      try {
        plugin = await pluginPromise;
        this.routeTable = { ...this.routeTable, ...plugin.routeTable };
        this.serviceRules = { ...this.serviceRules, ...plugin.serviceRules };
        if (plugin.override) {
          this.overrides.push(plugin.override);
        }
      } catch (error) {
        console.error("❌ Error loading plugin:", error, plugin);
      }
    }

    for (const [key, value] of Object.entries(this.routeTable)) {
      console.log(` 🔧 Route '${key}' will be proxy to ${value} when request fulfill the following rule:`);
      console.log(`    - ${this.serviceRules[key]?.toString() || "No specific rule"}`);
    }
    console.log("\n");
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

    await this.restartServers();
  }

  private restarting?: Promise<void>;

  async restartServers(): Promise<void> {
    if (this.restarting) return this.restarting;

    this.restarting = (async () => {
      console.log("🔄 Restarting servers to apply new certificate...");
      await this.shutdown();
      await this.addRedirect();
      await this.addMultiplexedProxy();
    })();

    try {
      await this.restarting;
    } finally {
      this.restarting = undefined;
    }
  }

  getTargetName(domain: string, pathname: string): [string, any] {
    for (const [key, rule] of Object.entries(this.serviceRules)) {
      if (rule(domain, pathname)) return [key, rule];
    }
    return ["default", null];
  }

  getHostName(req: IncomingMessage): string {
    const host = req?.headers?.host?.split(":")[0] || "localhost";
    return (req?.headers["x-forwarded-host"] as string) || host;
  }

  async logDomainChange(req: IncomingMessage): Promise<string> {
    const sourceDomain = this.getHostName(req);

    if (this.lastDomain !== sourceDomain) {
      this.lastDomain = sourceDomain;
      console.log(`\n🔗 Source domain: ${sourceDomain}`);

      // Verifica se o domínio é conhecido
      await this.handleUnknownDomain(sourceDomain);
    }
    return sourceDomain;
  }

  private getOrCreateProxy(
    domain: string,
    path: string
  ): {
    name: string;
    target: string;
    proxy: ProxyServer;
  } {
    const [targetName, rule] = this.getTargetName(domain, path);
    const target = this.routeTable[targetName];
    if (!this.routeProxies[targetName]) {
      const proxy = ProxyServer.createProxyServer({
        target,
        ws: true,
        changeOrigin: true,
        secure: false,
      });

      proxy.on("proxyReq", async (proxyReq: ClientRequest, req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
        const domain = await this.logDomainChange(req);

        if (!ProxyManager.requestPerDomain[domain])
          ProxyManager.requestPerDomain[domain] = {};
        ProxyManager.requestPerDomain[domain][targetName] =
          (ProxyManager.requestPerDomain[domain][targetName] || 0) + 1;

        const override = this.overrides
          .find(rule => rule.matches({req: proxyReq}, req, res))
        if (override && override.onProxyReq) {
          override.onProxyReq(proxyReq, req, res)
        } else {
          if (this.shouldLogRequest(req)) {
          const { method, headers, url } = req || {};
          const from = `${headers?.host}/${url}`.replace('//', '/');
          console.log(`🦉 Proxying ${targetName}:${method} https://${from} -> ${target}/*`);
        }
        }
      });

      proxy.on("proxyRes", (proxyRes, req, res) => {
        if (!res.headersSent) {
          res.setHeader('X-Proxy-To', `${target}${req?.url}`);
          res.setHeader('X-Proxy-Rule', String(rule));
        }
        const override = this.overrides
          .find(rule => rule.matches({res: proxyRes}, req, res))
        if (override && override.onProxyRes)
          override.onProxyRes(proxyRes, req, res);
      });

      proxy.on("error", async (err, req, res) => {
        await this.logDomainChange(req);
        console.error(`❌ Proxy error: ${err.message}`, req?.url, req?.headers);
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


  private applyRequestOverrides(req: IncomingMessage, res: ServerResponse<IncomingMessage>): boolean {
    for (const override of this.overrides) {
      if (!override.onRequest) continue;
      if (!override.matches({}, req, res)) continue;

      const result = override.onRequest(req, res);
      if (result === false || res.headersSent || res.writableEnded) {
        return false;
      }
    }

    return true;
  }

  async addMultiplexedProxy(port: number = 443): Promise<void> {
    await Promise.all(this.plugins);
    const { cert, key } = this.certInfo;
    const server = https.createServer({ key, cert }, async (req, res) => {
      await this.logDomainChange(req);

      if (!this.applyRequestOverrides(req, res)) return;

      const { proxy } = this.getOrCreateProxy(
        this.getHostName(req),
        req?.url || ""
      );
      proxy.web(req, res);
    });

    server.on("upgrade", async (req, socket, head) => {
      await this.logDomainChange(req);

      const { proxy, name } = this.getOrCreateProxy(
        this.getHostName(req),
        req?.url || ""
      );
      proxy.ws(req, socket, head);
      console.log(`🛜 Proxying WebSocket ${name} -> ${req?.url}`);

      socket.on("close", async () => {
        await this.logDomainChange(req);
        console.log(`❌ WebSocket disconnected from ${name}: ${req?.url}`);
      });
    });

    server.listen(port, () => {
      console.log(`🌐 HTTPS Proxy running on https://0.0.0.0:${port}`);
    });

    this.proxies.push({ server, port });
  }

  addRedirect(port: number = 80, to: number = 443): void {
    const server = http.createServer((req, res) => {
      const host = req?.headers?.host?.split(":")[0] || "localhost";
      const location = `https://${host}${req?.url}`;
      res.writeHead(301, { Location: location });
      res.end();
    });

    server.listen(port, () => {
      console.log(`🔁 HTTP → HTTPS redirect on http://*:${port}/* to https://*:${to}/*`);
    });

    this.proxies.push({ server, port });
  }

  async shutdown(): Promise<void> {
    for (const [target, proxy] of Object.entries(this.routeProxies)) {
      console.log(`🛑 Stopping proxy for ${target}`);
      proxy.close?.();
    }

    await Promise.all(
      this.proxies.map(({ server, port }) => {
        console.log(`🛑 Stopping server on port ${port}`);

        return new Promise<void>((resolve, reject) => {
          server.close((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      })
    );

    this.proxies = [];
    this.routeProxies = {};
  }

  private shouldLogRequest(req: IncomingMessage): boolean {
    const path = req?.url || "";
    if (path.startsWith("/src/")) return false;
    return !path.includes("/node_modules/");
  }
}
