import { BORDER_ACTIVE, Text } from '@vigilant-broccoli/react-lib';

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

export const StatusLegend = ({ entries }: { entries: StatusLegendEntry[] }) => (
  <div className="flex flex-wrap gap-x-4 gap-y-1">
    {entries.map(({ color, label }) => (
      <div key={label} className="flex items-center gap-1">
        <StatusDot color={color} />
        <Text size="1" color="gray">
          {label}
        </Text>
      </div>
    ))}
  </div>
);
