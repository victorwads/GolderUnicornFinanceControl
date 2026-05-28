import { timingSafeEqual } from "crypto";
import { IncomingMessage, ServerResponse } from "http";
import { OverrideRules } from "../commons";

export const serviceRules = {};
export const routeTable = {};

const REALM = process.env.PROXY_BASIC_AUTH_REALM || "Home Proxy";

const protectedHostsRules: Array<(domain: string) => boolean> = [
  (domain) => domain.startsWith("firebase"),
];

export function shouldAskForAuth(domain: string): boolean {
  return protectedHostsRules.some((rule) => rule(domain));
}

class BasicAuthOverrideRules extends OverrideRules {
  matches(
    _proxy: {},
    req: IncomingMessage,
    _res: ServerResponse<IncomingMessage>
  ): boolean {
    const domain = this.getHostName(req);
    return shouldAskForAuth(domain);
  }

  onProxyReq(): void {}
  onProxyRes(): void {}

  onRequest(
    req: IncomingMessage,
    res: ServerResponse<IncomingMessage>
  ): boolean {
    const domain = this.getHostName(req);
    const user = process.env.PROXY_BASIC_AUTH_USER;
    const pass = process.env.PROXY_BASIC_AUTH_PASS;

    if (!user || !pass) {
      console.error(
        `🔒 Basic Auth blocked ${domain}: PROXY_BASIC_AUTH_USER/PROXY_BASIC_AUTH_PASS are not configured.`
      );
      this.deny(res, "Authentication is not configured");
      return false;
    }

    const credentials = this.readCredentials(req.headers.authorization);
    if (!credentials) {
      console.log(`🔒 Basic Auth required for ${domain}`);
      this.deny(res, "Authentication required");
      return false;
    }

    if (!this.safeEquals(credentials.user, user) || !this.safeEquals(credentials.pass, pass)) {
      console.warn(`🔒 Basic Auth rejected for ${domain}: invalid credentials.`);
      this.deny(res, "Invalid credentials");
      return false;
    }

    return true;
  }

  private deny(res: ServerResponse<IncomingMessage>, message: string): void {
    res.writeHead(401, {
      "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
      "Content-Type": "text/plain; charset=utf-8",
    });
    res.end(message);
  }

  private readCredentials(auth?: string): { user: string; pass: string } | null {
    if (!auth?.startsWith("Basic ")) return null;

    try {
      const decoded = Buffer.from(auth.slice(6), "base64").toString("utf8");
      const separatorIndex = decoded.indexOf(":");
      if (separatorIndex < 0) return null;

      return {
        user: decoded.slice(0, separatorIndex),
        pass: decoded.slice(separatorIndex + 1),
      };
    } catch {
      return null;
    }
  }

  private safeEquals(actual: string, expected: string): boolean {
    const actualBuffer = Buffer.from(actual);
    const expectedBuffer = Buffer.from(expected);

    if (actualBuffer.length !== expectedBuffer.length) return false;
    return timingSafeEqual(actualBuffer, expectedBuffer);
  }

  private getHostName(req: IncomingMessage): string {
    const host = req?.headers?.host?.split(":")[0] || "localhost";
    return ((req?.headers["x-forwarded-host"] as string) || host).split(":")[0];
  }
}

export const override: OverrideRules = new BasicAuthOverrideRules();
