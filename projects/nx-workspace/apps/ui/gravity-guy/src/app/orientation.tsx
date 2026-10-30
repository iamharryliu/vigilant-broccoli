'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { RotateCw } from 'lucide-react';
import { ThemeProvider } from '@vigilant-broccoli/react-lib';
import { I18nProvider, useTranslation } from './i18n';

const PORTRAIT = '(any-pointer: coarse) and (orientation: portrait)';
export const isLandscapeBlocked = () => window.matchMedia(PORTRAIT).matches;
const LandscapeContext = createContext(false);
export const useNeedsLandscape = () => useContext(LandscapeContext);

function OrientationGate({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [blocked, setBlocked] = useState(false);
  const notice = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const query = window.matchMedia(PORTRAIT);
    const update = () => setBlocked(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!blocked) return;
    const previous = document.activeElement;
    notice.current?.focus();
    return () => {
      if (previous instanceof HTMLElement && previous.isConnected)
        previous.focus({ preventScroll: true });
    };
  }, [blocked]);
  return (
    <LandscapeContext.Provider value={blocked}>
      <div
        className="orientation-content"
        inert={blocked}
        aria-hidden={blocked || undefined}
      >
        {children}
      </div>
      {blocked && (
        <div
          ref={notice}
          className="gravity-app orientation-notice"
          role="alert"
          tabIndex={-1}
        >
          <RotateCw size={52} aria-hidden="true" />
          <h2>{t('APP.ROTATE_TITLE')}</h2>
          <p>{t('APP.ROTATE_COPY')}</p>
        </div>
      )}
    </LandscapeContext.Provider>
  );
}

export function LandscapeLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider keybind={false}>
      <I18nProvider>
        <OrientationGate>{children}</OrientationGate>
      </I18nProvider>
    </ThemeProvider>
  );
}
