import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';

import "./data/firebase/google-services";
import './global'
import './data/repositories/UserRepository';
import App from './App';
import { VarsProvider } from './components/Vars';


ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
).render(
  <VarsProvider>
    <App />
  </VarsProvider>
);
