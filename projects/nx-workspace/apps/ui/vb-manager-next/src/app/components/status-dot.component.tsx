import { CircleHelp } from 'lucide-react';
import { useState } from 'react';
import {
  BORDER_ACTIVE,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@vigilant-broccoli/react-lib';

export type DotColor = 'green' | 'yellow' | 'red' | 'blue' | 'gray';

export interface StatusLegendEntry {
  color: DotColor;
  label: string;
}

const DOT_COLOR: Record<DotColor, string> = {
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
  blue: '#3b82f6',
  gray: '#9ca3af',
};

const BORDER_WARNING =
  'border-yellow-400 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-600';
const BORDER_ERROR =
  'border-red-400 bg-red-50 dark:bg-red-950 dark:border-red-700';

const DOT_BORDER: Record<DotColor, string | undefined> = {
  green: BORDER_ACTIVE,
  yellow: BORDER_WARNING,
  red: BORDER_ERROR,
  blue: undefined,
  gray: undefined,
};

export const getDotBorder = (color: DotColor) => DOT_BORDER[color];

export const StatusDot = ({
  color,
  title,
}: {
  color: DotColor;
  title?: string;
}) => (
  <span
    title={title}
    className="inline-block h-3 w-3 shrink-0 rounded-full mt-0.5"
    style={{ backgroundColor: DOT_COLOR[color] }}
  />
);

export const StatusLegendButton = ({
  entries,
}: {
  entries: StatusLegendEntry[];
}) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Show status legend"
        title="Show status legend"
        className="shrink-0 text-muted-foreground hover:text-foreground"
      >
        <CircleHelp className="h-4 w-4" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Status legend</DialogTitle>
          </DialogHeader>
          <ul className="space-y-3 text-sm">
            {entries.map(({ color, label }) => (
              <li key={label} className="flex items-center gap-3">
                <StatusDot color={color} />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
};
