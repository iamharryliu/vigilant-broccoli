import '@radix-ui/themes/styles.css';
import { useEffect, useState } from 'react';
import { Theme } from '@radix-ui/themes';
import {
  ScrollTimeline,
  ScrollTimelineEntry,
} from '@vigilant-broccoli/react-lib';

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';
const APPEARANCE = { LIGHT: 'light', DARK: 'dark' } as const;
const TIMELINE_HEIGHT = 480;

const usePrefersDark = () => {
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

interface RepoScrollTimelineProps {
  entries: ScrollTimelineEntry[];
  valueLabel: string;
  formatValue: (value: number) => string;
}

export default function RepoScrollTimeline(props: RepoScrollTimelineProps) {
  const prefersDark = usePrefersDark();

  return (
    <Theme
      appearance={prefersDark ? APPEARANCE.DARK : APPEARANCE.LIGHT}
      hasBackground={false}
      accentColor="sky"
    >
      <ScrollTimeline {...props} height={TIMELINE_HEIGHT} />
    </Theme>
  );
}
