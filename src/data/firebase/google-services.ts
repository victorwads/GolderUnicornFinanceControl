import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { CACHE_SIZE_UNLIMITED, connectFirestoreEmulator, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

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
export const firestore = initializeFirestore(app, {localCache: persistentLocalCache({
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  tabManager: persistentMultipleTabManager()
})});

if (window.location.hostname === 'localhost') {
  connectFirestoreEmulator(firestore, 'localhost', 8008);
}