import './index.css';
import ReactDOM from 'react-dom/client';

import './global'
import "./data/firebase/google-services";
import './data/repositories/UserRepository';
import { VarsProvider } from './components/Vars';
import App from './App';


ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
).render(
  <VarsProvider>
    <App />
  </VarsProvider>
);
