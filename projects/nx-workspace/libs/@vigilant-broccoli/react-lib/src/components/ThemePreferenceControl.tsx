'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import type { ThemePreference } from '../hooks/useThemePreference';
import {
  SegmentedControl,
  type SegmentedControlOption,
  type SegmentedControlSize,
} from './SegmentedControl';
import { useTheme } from './ThemeProvider';

export type ThemePreferenceLabels = Record<ThemePreference, string>;

const DEFAULT_LABEL = 'Theme';
const DEFAULT_LABELS: ThemePreferenceLabels = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};
const ICON_SIZE = 14;
const PREFERENCE_ICON = { system: Monitor, light: Sun, dark: Moon } as const;
const PREFERENCE_ORDER: ThemePreference[] = ['system', 'light', 'dark'];

// System/Light/Dark picker bound to the surrounding ThemeProvider; System
// follows the OS and clears the saved override.
export function ThemePreferenceControl({
  label = DEFAULT_LABEL,
  labels = DEFAULT_LABELS,
  size,
  fullWidth = false,
  className,
}: {
  label?: string;
  labels?: ThemePreferenceLabels;
  size?: SegmentedControlSize;
  fullWidth?: boolean;
  className?: string;
}) {
  const { preference, setPreference } = useTheme();
  const options: SegmentedControlOption<ThemePreference>[] =
    PREFERENCE_ORDER.map(value => {
      const Icon = PREFERENCE_ICON[value];
      return {
        value,
        label: labels[value],
        icon: <Icon size={ICON_SIZE} />,
      };
    });
  return (
    <SegmentedControl
      label={label}
      value={preference}
      options={options}
      onChange={setPreference}
      size={size}
      fullWidth={fullWidth}
      className={className}
    />
  );
}
