import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import {
  ScrollTimeline,
  ScrollTimelineEntry,
} from '@vigilant-broccoli/react-lib';
import { useRadixAppearance } from '../use-prefers-dark';

interface RepoScrollTimelineProps {
  entries: ScrollTimelineEntry[];
  valueLabel: string;
  formatValue: (value: number) => string;
}

export default function RepoScrollTimeline(props: RepoScrollTimelineProps) {
  const appearance = useRadixAppearance();

  return (
    <Theme
      appearance={appearance}
      hasBackground={false}
      accentColor="sky"
      className="flex min-h-0 flex-1 flex-col"
    >
      <ScrollTimeline {...props} fill />
    </Theme>
  );
}
