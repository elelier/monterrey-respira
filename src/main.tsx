import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App.tsx';

const element = document.getElementById('root');

if (!element) {
  throw new Error('Root element was not found');
}

createRoot(element).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>,
);
