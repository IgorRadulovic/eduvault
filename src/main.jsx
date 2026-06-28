// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider, ThemeProvider, CartProvider, ToastProvider } from './context';
import CookieBanner from './components/layout/CookieBanner';
import ErrorBoundary from './components/layout/ErrorBoundary';
import { validateEnv } from './utils/env';
import './styles/global.css';

// Validate env vars at startup — fails loudly in dev if something is missing
validateEnv();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <ToastProvider>
                <App />
                <CookieBanner />
              </ToastProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
