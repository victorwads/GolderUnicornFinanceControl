import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { CACHE_SIZE_UNLIMITED, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBq_VVIcA00Tc9kc_Ew8Ve5dh9R98LICb8",
  authDomain: "goldenunicornfc.firebaseapp.com",
  projectId: "goldenunicornfc",
  storageBucket: "goldenunicornfc.firebasestorage.app",
  messagingSenderId: "171192137987",
  appId: "1:171192137987:web:f1b86ad72b7d26a0c3d136",
  measurementId: "G-BXJVEM952W"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

const host = window.location.hostname;
let firestoreAddConfig = {};
if (host === 'localhost' || host.includes('.local') || host.startsWith('192.168') || host.startsWith('10.0')) {
  const ssl = window.location.protocol.includes('https');
  const port: number = ssl ? 443 : 8008;
  firestoreAddConfig = {
    host: `${host}:${port}`,
    ssl,
  };
  console.log('Connected to Firestore Emulator at', host, port, { ssl });
}

export const firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({ cacheSizeBytes: CACHE_SIZE_UNLIMITED, tabManager: persistentMultipleTabManager() }),
  ...firestoreAddConfig,
});

