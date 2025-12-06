'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AppMode = 'personal' | 'work';

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
    if (saved === 'personal' || saved === 'work') {
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
