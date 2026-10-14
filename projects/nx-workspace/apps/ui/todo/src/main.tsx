'use client';

import { createRoot } from 'react-dom/client';
import { App } from './app';
import { I18nProvider } from './app/i18n';

const container = document.getElementById('app')!;
createRoot(container).render(
  <I18nProvider>
    <App />
  </I18nProvider>
);
