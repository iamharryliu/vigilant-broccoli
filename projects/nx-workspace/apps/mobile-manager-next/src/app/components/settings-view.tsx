'use client';

import { Text, ThemePreferenceControl } from '@vigilant-broccoli/react-lib';

export const SettingsView = () => (
  <div className="mx-auto min-h-0 w-full max-w-2xl flex-1 space-y-8 overflow-y-auto">
    <section className="space-y-3">
      <Text size="3" weight="medium">
        Theme
      </Text>
      <ThemePreferenceControl fullWidth />
    </section>
  </div>
);
