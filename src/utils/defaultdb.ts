import { initializeApp, cert } from "firebase-admin/app";
import { Firestore, getFirestore } from "firebase-admin/firestore";

import serviceAccountKey from "../serviceAccountKey";

const prodApp = initializeApp({ credential: cert(serviceAccountKey as any) }, 'prod');
export const prod = getFirestore(prodApp);
prod.settings({ ignoreUndefinedProperties: true });

let db: Firestore;
if (process.argv.includes('--prod')) {
  db = prod;
  console.warn("Using production database");
} else {
  console.log("Using local database");
  const local = initializeApp({ credential: cert(serviceAccountKey as any) }, 'local');
  db = getFirestore(local);
  db.settings({
    ignoreUndefinedProperties: true,
    host: "localhost:8008",
    ssl: false,
  });
}

export const current = db;

