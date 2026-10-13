import { CSSProperties } from 'react';
import {
  ThemeScope,
  ScrollTimeline,
  ScrollTimelineEntry,
} from '@vigilant-broccoli/react-lib';
import { useThemeAppearance } from '../use-prefers-dark';

const PAGE_THEME_STYLE = {
  minHeight: 0,
  '--background': 'var(--pages-background)',
  '--primary': 'var(--pages-primary)',
  '--border': 'var(--pages-border)',
} as CSSProperties;

interface RepoScrollTimelineProps {
  entries: ScrollTimelineEntry[];
  valueLabel: string;
  formatValue: (value: number) => string;
}

export default function RepoScrollTimeline(props: RepoScrollTimelineProps) {
  const appearance = useThemeAppearance();

  return (
    <ThemeScope
      appearance={appearance}
      hasBackground={false}
      accentColor="sky"
      className="flex min-h-0 flex-1 flex-col"
      style={PAGE_THEME_STYLE}
    >
      <ScrollTimeline {...props} fill />
    </ThemeScope>
  );
}
