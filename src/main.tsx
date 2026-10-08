import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { CartProvider } from './lib/cart';
import { AuthProvider } from './lib/auth';
import './index.css';
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><BrowserRouter><AuthProvider><CartProvider><App />
    <Toaster position="top-center" toastOptions={{ style: { background: '#111', color: '#fff', border: '1px solid #D4AF5A' } }} />
  </CartProvider></AuthProvider></BrowserRouter></React.StrictMode>);
