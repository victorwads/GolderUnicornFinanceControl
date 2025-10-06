import { getCerts, RouteTable } from "./commons";
import { parseArgs } from "./process";
import { ProxyManager, Plugin, ServiceRules } from "./proxy";

const isDocker = !process.argv.includes("--local");
const defaultConfig = Promise.resolve({
  routeTable: {
    default: `http://${isDocker ? "web" : "localhost"}:3000`,
  },
  serviceRules: {},
});

async function start(): Promise<void> {
  const extraDomains = (args.domains || "").split(",");
  const cert = await getCerts(
    extraDomains,
    args.certsDir,
    args.certPath,
    args.certKeyPath
  );

  const manager = new ProxyManager(defaultConfig, cert);
  manager.addRedirect(8080, 4433);
  manager.addMultiplexedProxy(4433);
}

const args = parseArgs();
start();
