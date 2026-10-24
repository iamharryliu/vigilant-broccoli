import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@vigilant-broccoli/react-lib';
import { Toaster } from '@vigilant-broccoli/react-lib/toaster';
import { AuthProvider } from './libs/auth';
import { App } from './app/app';
import './app/global.css';

const THEME_STORAGE_KEY = 'vb-manager-local-react-theme';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider
          storageKey={THEME_STORAGE_KEY}
          style={{ fontSize: '0.9rem' }}
        >
          <App />
          <Toaster richColors closeButton position="bottom-right" />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
