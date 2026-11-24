# Settings

- `/settings` (`src/app/settings/page.tsx`, `SettingsView` in `src/app/components/settings-view.tsx`) holds the System/Light/Dark `ThemePreferenceControl` from `react-lib`; `ThemeWrapper` supplies the `ThemeProvider` and persists the choice.
- It is the only place to change the theme: the sidebar has no dark-mode toggle ([sidebar.md](./sidebar.md)).
