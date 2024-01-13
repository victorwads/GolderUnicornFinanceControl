import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { CACHE_SIZE_UNLIMITED, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

import './global'
import App from './App';
import reportWebVitals from './reportWebVitals';
import { firebaseConfig } from "./data/firebase/google-services";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);
initializeFirestore(app, {localCache: persistentLocalCache({
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  tabManager: persistentMultipleTabManager()
})});

ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals(console.log);
