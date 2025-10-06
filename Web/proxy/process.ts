import { ProxyManager } from "./proxy";

export function logProccessHelp(): void {
  console.log(`
  Usage: node run.js [options]
  Options:
    --certsDir <path>             Directory for certificates (default: ./certs)
    --certPath <path>             Path to the certificate file (default: ./certs/localhost.pem)
    --certKeyPath <path>          Path to the key file (default: ./certs/localhost-key.pem)
    --domains <domains>           Comma-separated list of extra domains
  
  Configs:
    - certs/.domains: (Comma|Line)-separated list of extra domains
  `);

  process.exit(0);
}

export function parseArgs(): Record<string, string> {
  const args = process.argv.slice(2);
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--help" || args[i] === "-h") {
      logProccessHelp();
    } else if (args[i] === "--version" || args[i] === "-v") {
      console.log("Version: 1.0.0");
      process.exit(0);
    }
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      const value = args[i + 1];
      result[key] = value;
      i++;
    }
  }
  return result;
}

const shutdownHandler = (): void => {
  console.log("\n Request per domain:", ProxyManager.requestPerDomain);
  console.log("\n🔻 Gracefully shutting down...");
  process.exit(0);
};

process.on("SIGINT", shutdownHandler);
process.on("SIGTERM", shutdownHandler);
