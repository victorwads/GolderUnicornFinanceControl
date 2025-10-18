import { ClientRequest, IncomingMessage, ServerResponse } from "http";
import { __dirname, fs, OverrideRules, path } from "../commons";
import { ProxyTarget, RouteTable } from "../commons";
import { ServiceRules } from "../proxy";

export const serviceRules: ServiceRules = {
  ui: (host) => host.includes("firebase.local"),
  firestore: (_, pathname) => pathname.includes("google.firestore.v1.Firestore/"),
  functions: (_, pathname) => pathname.includes("/us-central1/"),
  auth: (_, pathname) =>
    pathname.includes("identitytoolkit.googleapis.com/") ||
    pathname.includes("securetoken.googleapis.com/") ||
    pathname.includes("emulator/auth/")
};

function getFirebaseConfig(fileName: string): FirebaseConfig {
  let tries = 4;
  let folder = __dirname;

  while (tries > 0) {
    if (fs.existsSync(fileName)) {
      console.log(`🔍 firebase.json found in ${fileName}`);
      return JSON.parse(fs.readFileSync(fileName, "utf8")) as FirebaseConfig;
    }
    fileName = path.join(folder, FIREBASE_FILENAME);
    folder = path.join(folder, "..");
    tries--;
  }

  throw new Error(
    "⚠️ firebase.json not found in the current directory or any parent directories."
  );
}

const FIREBASE_FILENAME = "firebase.json";
function getRouterFromFirebaseConfig(
  host: string = "firebase"
): RouteTable {
  const firebaseConfig = getFirebaseConfig(FIREBASE_FILENAME);
  const routeTable: Record<string, ProxyTarget> = {};

  const emulators = firebaseConfig.emulators || {};

  for (const [key, value] of Object.entries(emulators)) {
    if (value.port) {
      routeTable[key] = `http://${host}:${value.port}`;
    }
  }

  return routeTable;
}

export const routeTable: RouteTable = getRouterFromFirebaseConfig();

class FirebaseOverrideRules extends OverrideRules {
  matches(proxy: { 
    req?: ClientRequest;
    res?: IncomingMessage;
  }, req: IncomingMessage, res: ServerResponse<IncomingMessage>): boolean {
    return this.isUiConfig(req)
  }
  onProxyReq(proxyReq: ClientRequest, req: IncomingMessage, res: ServerResponse<IncomingMessage>): void {
    proxyReq.removeHeader("If-Modified-Since");
    proxyReq.removeHeader("If-None-Match");
  }
  onProxyRes(proxyRes: IncomingMessage, req: IncomingMessage, res: ServerResponse<IncomingMessage>): void {
    this.handleConfigModification(proxyRes, req, res)
  }

  private isUiConfig(req: IncomingMessage): boolean {
    return req?.url?.includes("api/config") || false;
  }

  private fixPort(config: FirebaseServiceConfig) {
    config.port = 443;
    config.listen?.forEach((listen) => {
      listen.port = 443;
    });
  }

  private handleConfigModification(
    proxyRes: IncomingMessage,
    req: IncomingMessage,
    res: ServerResponse
  ): void {
    proxyRes.pipe = (() => {}) as any;

    const sourceDomain = this.getHostName(req);
    let body = "";

    proxyRes.on("data", (chunk) => {
      body += chunk.toString();
      console.log("📦 Received chunk of api/config");
    });

    proxyRes.on("end", () => {
      try {
        const config = JSON.parse(body) as UIConfig;
        this.fixPort(config.auth)
        this.fixPort(config.firestore)
        this.fixPort(config.logging)
        this.fixPort(config.hub)
        this.fixPort(config.extensions)
        this.fixPort(config.functions)
        this.fixPort(config.tasks)
        this.fixPort(config.eventarc)
        this.fixPort(config.hosting)
        this.fixPort(config.ui)
        const modifiedConfig = JSON.stringify(config, null, 2);

        res.writeHead(200, {
          ...proxyRes.headers,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(modifiedConfig),
        });

        res.end(modifiedConfig);
      } catch (err) {
        console.error("❌ Erro ao modificar o api/config:", body, err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Erro ao processar api/config");
      }
    });

    proxyRes.on("error", (err) => {
      console.error("❌ Erro no proxyRes:", err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Erro interno ao processar a resposta.");
      }
    });

    console.log("📝 Interceptando api/config from " + sourceDomain);
  }

  private getHostName(req: IncomingMessage): string {
    const host = req?.headers?.host?.split(":")[0] || "localhost";
    return (req?.headers["x-forwarded-host"] as string) || host;
  }

}

export const override: OverrideRules = new FirebaseOverrideRules();

export function setFirebaseHost(host: string) {
  const newRouteTable: RouteTable = getRouterFromFirebaseConfig(host);
  for (const key in newRouteTable) {
    if (newRouteTable.hasOwnProperty(key)) {
      routeTable[key] = newRouteTable[key];
      console.log(`🔄 Updated route for ${key}: ${newRouteTable[key]}`);
    }
  }
}

type FirebaseConfig = {
  emulators?: {
    [key: string]: {
      port?: number | string;
    };
  };
};

type FirebaseServiceConfig = {
  listen?: Array<{
    address: string;
    family: string;
    port: number;
  }>;
  name: string;
  host: string;
  port: number;
}

type UIConfig = {
  ui: FirebaseServiceConfig
  hub: FirebaseServiceConfig
  logging: FirebaseServiceConfig
  extensions: FirebaseServiceConfig
  auth: FirebaseServiceConfig
  functions: FirebaseServiceConfig
  firestore: FirebaseServiceConfig
  hosting: FirebaseServiceConfig
  eventarc: FirebaseServiceConfig
  tasks: FirebaseServiceConfig
}

/*
{
  "projectId": "goldenunicornfc",
  "experiments": [
    "functionsv2deployoptimizations",
    "dangerouslyAllowFunctionsConfig",
    "pintags",
    "apphosting",
    "genkit",
    "mcp"
  ],
  "hub": {
    "listen": [
      {
        "address": "0.0.0.0",
        "family": "IPv4",
        "port": 4400
      }
    ],
    "name": "hub",
    "host": "127.0.0.1",
    "port": 4400
  },
  "ui": {
    "listen": [
      {
        "address": "0.0.0.0",
        "family": "IPv4",
        "port": 4000
      }
    ],
    "name": "ui",
    "host": "127.0.0.1",
    "port": 4000
  },
  "logging": {
    "listen": [
      {
        "address": "0.0.0.0",
        "family": "IPv4",
        "port": 4500
      }
    ],
    "name": "logging",
    "host": "127.0.0.1",
    "port": 4500
  },
  "extensions": {
    "name": "extensions",
    "host": "127.0.0.1",
    "port": 8006
  },
  "auth": {
    "listen": [
      {
        "address": "0.0.0.0",
        "family": "IPv4",
        "port": 8004
      }
    ],
    "name": "auth",
    "host": "127.0.0.1",
    "port": 8004
  },
  "functions": {
    "name": "functions",
    "host": "127.0.0.1",
    "port": 8006
  },
  "firestore": {
    "listen": [
      {
        "address": "0.0.0.0",
        "family": "IPv4",
        "port": 8008
      }
    ],
    "name": "firestore",
    "host": "127.0.0.1",
    "port": 8008,
    "pid": 35,
    "reservedPorts": [
      9150
    ],
    "webSocketHost": "0.0.0.0",
    "webSocketPort": 9150
  },
  "hosting": {
    "listen": [
      {
        "address": "0.0.0.0",
        "family": "IPv4",
        "port": 8010
      }
    ],
    "name": "hosting",
    "host": "127.0.0.1",
    "port": 8010
  },
  "eventarc": {
    "name": "eventarc",
    "host": "127.0.0.1",
    "port": 9299
  },
  "tasks": {
    "name": "tasks",
    "host": "127.0.0.1",
    "port": 9499
  }
}
*/