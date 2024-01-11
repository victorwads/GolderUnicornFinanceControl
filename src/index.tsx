import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { firebaseConfig } from "./data/firebase/google-services";
import App from './App';
import reportWebVitals from './reportWebVitals';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals(console.log);
