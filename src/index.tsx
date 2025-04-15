import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';

import "./data/firebase/google-services";
import './global'
import App from './App';


ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
