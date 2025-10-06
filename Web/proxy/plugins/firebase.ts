import { __dirname, fs, path } from "../commons";
import { ProxyTarget, RouteTable } from "../commons";
import { ServiceRules } from "../proxy";

export const serviceRules: ServiceRules = {
  ui: (_, host) => host.includes("firebase.local"),
  firestore: (pathname) => pathname.includes("google.firestore.v1.Firestore/"),
  functions: (pathname) => pathname.includes("/us-central1/"),
  auth: (pathname) =>
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

export function setFirebaseHost(host: string) {
  const newRouteTable: RouteTable = getRouterFromFirebaseConfig(host);
  for (const key in newRouteTable) {
    if (newRouteTable.hasOwnProperty(key)) {
      routeTable[key] = newRouteTable[key];
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

