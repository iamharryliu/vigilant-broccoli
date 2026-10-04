import {
  ThemeScope,
  ScrollTimeline,
  ScrollTimelineEntry,
} from '@vigilant-broccoli/react-lib';
import { useThemeAppearance } from '../use-prefers-dark';

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
      style={{ minHeight: 0 }}
    >
      <ScrollTimeline {...props} fill />
    </ThemeScope>
  );
}
