import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const MOBILE_BREAKPOINT_PX = 768;

type AppContextValue = {
  isMobile: boolean;
  isBrowser: boolean;
};

const AppContext = createContext<AppContextValue>({
  isMobile: false,
  isBrowser: true,
});

export const useAppContext = () => useContext(AppContext);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined'
      ? window.innerWidth < MOBILE_BREAKPOINT_PX
      : false,
  );

  useEffect(() => {
    const onResize = () =>
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT_PX);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const value = useMemo(() => ({ isMobile, isBrowser: !isMobile }), [isMobile]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
