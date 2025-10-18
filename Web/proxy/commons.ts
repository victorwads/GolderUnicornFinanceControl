import { createCA, createCert } from "mkcert";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";
export { fs, path };

import { fileURLToPath } from "url";
import { ClientRequest, IncomingMessage, ServerResponse } from "http";

// Get the equivalent of __dirname in ES modules
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
const CERT_DEFAULT_DIR = path.join(__dirname, "certs");
const CERT_DEFAULT_NAME = "localhost.pem";
const CERT_DEFAULT_KEY_NAME = "localhost-key.pem";
const CERT_CUSTOM_DOMAINS_NAME = path.join(CERT_DEFAULT_DIR, ".domains");

type CA = { key: string; cert: string };
type CertPaths = { certPath: string; keyPath: string };

export type Domain = string;
export type ProxyTarget = string;
export type RouteTable = Record<string, ProxyTarget>;
export type CertResult = {
  cert: Buffer;
  key: Buffer;
  domains: Domain[];
  generated: boolean;
};
export abstract class OverrideRules {
  abstract matches(proxy: {
    req?: ClientRequest
    res?: IncomingMessage
  }, req: IncomingMessage, res: ServerResponse<IncomingMessage>): boolean;
  abstract onProxyReq?(proxyReq: ClientRequest, req: IncomingMessage, res: ServerResponse<IncomingMessage>): void;
  abstract onProxyRes?(proxyRes: IncomingMessage, req: IncomingMessage, res: ServerResponse<IncomingMessage>): void;
}

function getDomainsConfigFile(existingDomains: Domain[] = []): Domain[] {
  const domains: Domain[] = existingDomains;
  domains.push("localhost");
  if (fs.existsSync(CERT_CUSTOM_DOMAINS_NAME)) {
    fs.readFileSync(CERT_CUSTOM_DOMAINS_NAME, "utf-8")
      .replaceAll("\n", ",")
      .replaceAll(/[\s]]/g, "")
      .split(",")
      .map((d) => d.trim())
      .filter((d) => d !== "")
      .forEach((d) => domains.push(d));

    console.log(`🔍 Domains loaded from ${CERT_CUSTOM_DOMAINS_NAME}:`);
  }

  return domains.reduce<Domain[]>((acc, domain) => {
    if (!acc.includes(domain) && domain.trim() !== "") {
      acc.push(domain);
    }
    return acc;
  }, []);
}

export function addDomainsToConfigFile(domains: Domain[]): void {
  const existingDomains = getDomainsConfigFile(domains);
  fs.writeFileSync(
    CERT_CUSTOM_DOMAINS_NAME,
    existingDomains.join("\n"),
    "utf-8"
  );
}

async function ensureCert(
  domains: Domain[],
  certDir: string
): Promise<CertPaths> {
  const certPath = path.join(certDir, CERT_DEFAULT_NAME);
  const keyPath = path.join(certDir, CERT_DEFAULT_KEY_NAME);

  if (!fs.existsSync(certDir)) {
    console.log(`⚠️ Cert directory ${certDir} does not exist. Creating...`);
    fs.mkdirSync(certDir, { recursive: true });
  }

  const caKeyPath = path.join(certDir, "rootCA-key.pem");
  const caCertPath = path.join(certDir, "rootCA.pem");

  let ca: CA = { key: "", cert: "" };
  if (fs.existsSync(caKeyPath) && fs.existsSync(caCertPath)) {
    ca.key = fs.readFileSync(caKeyPath, "utf-8");
    ca.cert = fs.readFileSync(caCertPath, "utf-8");
    console.log("🔐 Loaded existing CA");
  } else {
    ca = await createCA({
      organization: "Hedwig Proxy - Local Brick Dev CA",
      countryCode: "BR",
      state: "Dev",
      locality: "Localhost",
      validity: 3650,
    });
    fs.writeFileSync(caKeyPath, ca.key);
    fs.writeFileSync(caCertPath, ca.cert);
    console.log("🔐🆕 New CA created.");
  }

  let regenerate = true;
  if (fs.existsSync(certPath)) {
    try {
      const output = execSync(
        `openssl x509 -in ${certPath} -noout -text`
      ).toString();
      const missing = domains.filter((d) => !output.includes(d));
      regenerate = missing.length > 0;
    } catch (e) {
      console.warn(
        "⚠️ Verification failed for existing certificate, will regenerate."
      );
    }
  }

  if (regenerate) {
    const cert = await createCert({
      ca,
      domains,
      validity: 365,
    });
    fs.writeFileSync(certPath, cert.cert);
    fs.writeFileSync(keyPath, cert.key);
    console.log("  📄🆕 New certificate generated for domains:");
  } else {
    console.log("  📄 Current certificate already covers all domains:");
  }
  domains.forEach((d) => console.log(`    🔧 ${d}`));

  return { certPath, keyPath };
}

export async function getCerts(
  domains: Domain[] = [],
  certDir?: string,
  certPath?: string,
  keyPath?: string
): Promise<CertResult> {
  console.log("🔍 Checking certificates...");
  domains = getDomainsConfigFile(domains);

  let generated = false;
  if ((certPath || keyPath) && (!certPath || !keyPath)) {
    throw new Error("⚠️ Cert and key path must be provided together.\n");
  }
  if (certPath && keyPath) {
    certPath = path.resolve(certPath);
    keyPath = path.resolve(keyPath);

    let error = "";
    if (!fs.existsSync(certPath))
      error += `⚠️ Cert ${certPath} does not exist.\n`;
    if (!fs.existsSync(keyPath)) error += `⚠️ Key ${keyPath} does not exist.\n`;
    if (error) {
      throw new Error(error);
    }
  } else {
    certDir = certDir ? path.resolve(certDir) : CERT_DEFAULT_DIR;
    const cert = await ensureCert(domains, certDir);
    certPath = cert.certPath;
    keyPath = cert.keyPath;
    generated = true;
  }

  const cert = fs.readFileSync(certPath);
  const key = fs.readFileSync(keyPath);

  return { cert, key, domains, generated };
}
