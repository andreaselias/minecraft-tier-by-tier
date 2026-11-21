import React from 'react';
import ReactDOM from 'react-dom/client';
import BellaceraApp from './bellacera/App.tsx';
import './bellacera/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><BellaceraApp /></React.StrictMode>
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(import.meta.env.BASE_URL+'sw.js').catch(() => {
      // A interface continua funcional quando o offline não está disponível.
    });
  });
}
