'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AppMode = 'personal' | 'work';

// App mode constants
export const APP_MODE = {
  PERSONAL: 'personal' as const,
  WORK: 'work' as const,
};

interface AppModeContextType {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

export function AppModeProvider({ children }: { children: ReactNode }) {
  const [appMode, setAppModeState] = useState<AppMode>('personal');

  // Load app mode from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('appMode') as AppMode | null;
    if (saved === APP_MODE.PERSONAL || saved === APP_MODE.WORK) {
      setAppModeState(saved);
    }
  }, []);

  const setAppMode = (mode: AppMode) => {
    setAppModeState(mode);
    sessionStorage.setItem('appMode', mode);
  };

  return (
    <AppModeContext.Provider value={{ appMode, setAppMode }}>
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  const context = useContext(AppModeContext);
  if (context === undefined) {
    throw new Error('useAppMode must be used within an AppModeProvider');
  }
  return context;
}
