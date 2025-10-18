import { ClientRequest, IncomingMessage, ServerResponse } from "http";
import { __dirname, fs, OverrideRules, path } from "../commons";
import { ProxyTarget, RouteTable } from "../commons";
import { ServiceRules } from "../proxy";

export const serviceRules: ServiceRules = {};
export const routeTable: RouteTable = {};

class ReactManifestOverrideRules extends OverrideRules {
  private manifestCached: string[] = [];

  matches(proxy: { 
    req?: ClientRequest;
    res?: IncomingMessage;
  }, req: IncomingMessage, res: ServerResponse<IncomingMessage>): boolean {
    return this.isManifest(req)
  }
  onProxyReq(proxyReq: ClientRequest, req: IncomingMessage, res: ServerResponse<IncomingMessage>): void {
    if (this.needIntercept(req, res)) {
      proxyReq.removeHeader("If-Modified-Since");
      proxyReq.removeHeader("If-None-Match");
    } else {
      console.log("🚫 No intercept needed for manifest.json, destroying request.");
    }
  }
  onProxyRes(proxyRes: IncomingMessage, req: IncomingMessage, res: ServerResponse<IncomingMessage>): void {
    if(!res.headersSent)
      this.handleManifestModification(proxyRes, req, res)
  }

  private isManifest(req: IncomingMessage): boolean {
    return req?.url?.endsWith("manifest.json") || false;
  }

  private needIntercept(
    req: IncomingMessage,
    res: ServerResponse
  ): boolean {
    const eTag = req?.headers["if-none-match"];
    if (!eTag) return false;

    const hasSended = this.manifestCached.includes(eTag);
    if (hasSended) {
      res.writeHead(304, { "Content-Type": "application/json" });
      res.end();
      return false;
    }

    return true;
  }

  private handleManifestModification(
    proxyRes: IncomingMessage,
    req: IncomingMessage,
    res: ServerResponse
  ): void {
    proxyRes.pipe = (() => {}) as any;

    const sourceDomain = this.getHostName(req);
    let body = "";

    proxyRes.on("data", (chunk) => {
      body += chunk.toString();
      console.log("📦 Received chunk of manifest.json");
    });

    proxyRes.on("end", () => {
      try {
        const manifest = JSON.parse(body);
        manifest.name += " - " + sourceDomain;
        manifest.short_name = sourceDomain;

        const modifiedBody = JSON.stringify(manifest, null, 2);
        const eTag = `W/"${Buffer.byteLength(modifiedBody)}-${Date.now()}"`;
        this.manifestCached.push(eTag);

        res.writeHead(200, {
          ...proxyRes.headers,
          ETag: eTag,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(modifiedBody),
        });

        res.end(modifiedBody);

        console.log(
          "📝 Manifest.json modificado e enviado:",
          eTag,
          modifiedBody
        );
      } catch (err) {
        console.error("❌ Erro ao modificar o manifest.json:", body, err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Erro ao processar manifest.json");
      }
    });

    proxyRes.on("error", (err) => {
      console.error("❌ Erro no proxyRes:", err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Erro interno ao processar a resposta.");
      }
    });

    console.log("📝 Interceptando manifest.json from " + sourceDomain);
  }

  private getHostName(req: IncomingMessage): string {
    const host = req?.headers?.host?.split(":")[0] || "localhost";
    return (req?.headers["x-forwarded-host"] as string) || host;
  }

}

export const override: OverrideRules = new ReactManifestOverrideRules();