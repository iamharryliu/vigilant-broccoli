import { useEffect, useState } from 'react';

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';
const APPEARANCE = { LIGHT: 'light', DARK: 'dark' } as const;

export const usePrefersDark = () => {
  const [prefersDark, setPrefersDark] = useState(
    () => window.matchMedia(DARK_SCHEME_QUERY).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(DARK_SCHEME_QUERY);
    const onChange = (event: MediaQueryListEvent) =>
      setPrefersDark(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return prefersDark;
};

export const useRadixAppearance = () =>
  usePrefersDark() ? APPEARANCE.DARK : APPEARANCE.LIGHT;
