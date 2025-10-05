import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { connectAuthEmulator, getAuth, signOut, User } from "firebase/auth";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { clearIndexedDbPersistence, getFirestore, terminate } from "firebase/firestore";
import { CACHE_SIZE_UNLIMITED, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

declare global {
  interface Window { isDevelopment: boolean; isSsl: boolean; port: number }
}

const firebaseConfig = {
  apiKey: "AIzaSyBq_VVIcA00Tc9kc_Ew8Ve5dh9R98LICb8",
  authDomain: "goldenunicornfc.firebaseapp.com",
  projectId: "goldenunicornfc",
  storageBucket: "goldenunicornfc.firebasestorage.app",
  messagingSenderId: "171192137987",
  appId: "1:171192137987:web:f1b86ad72b7d26a0c3d136",
  measurementId: "G-BXJVEM952W"
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const functions = getFunctions(app);
export const auth = getAuth();

let firestoreAddConfig = {};
if (window.isDevelopment) {
  const port = window.port;
  const { protocol, hostname } = window.location;

  firestoreAddConfig = {
    host: `${hostname}:${port}`,
    ssl: window.isSsl,
  };

  connectFunctionsEmulator(functions, hostname, port);
  connectAuthEmulator(auth, `https://${hostname}:${port}`, { disableWarnings: true });
  (functions as any).emulatorOrigin = `${protocol}//${hostname}`;
}


if (typeof window !== 'undefined' && window.isDevelopment) {
  try {
  } catch (error) {
    console.warn('Failed to connect to Functions emulator', error);
  }
}


initializeFirestore(app, {
  localCache: persistentLocalCache({ cacheSizeBytes: CACHE_SIZE_UNLIMITED, tabManager: persistentMultipleTabManager() }),
  ...firestoreAddConfig,
});

export async function clearFirestore() {
  const db = getFirestore(app);
  await terminate(db)
  await clearIndexedDbPersistence(db);
}

auth.useDeviceLanguage();
export const AUTH_CACHE_KEY = 'firebase:authUser:synccache';
export function getCurrentUser(): User | null {
  return auth.currentUser || JSON.parse(
    localStorage.getItem(AUTH_CACHE_KEY) || 'null'
  );
}

export function saveUser(user?: User | null) {
  localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(user || null));
}