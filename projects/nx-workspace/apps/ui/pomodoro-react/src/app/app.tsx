import { useEffect, useState } from 'react';
import { Button, Input, ThemeProvider } from '@vigilant-broccoli/react-lib';
import { I18nProvider, useTranslation } from './i18n';
import {
  formatTime,
  MODE,
  usePomodoro,
  type Mode,
  type Settings,
} from './use-pomodoro';

const MODE_LABEL = {
  [MODE.WORK]: 'MODE_WORK',
  [MODE.SHORT_BREAK]: 'MODE_SHORT_BREAK',
  [MODE.LONG_BREAK]: 'MODE_LONG_BREAK',
} as const;

const MINUTE_FIELDS = [
  { key: MODE.WORK, label: 'WORK_MINUTES' },
  { key: MODE.SHORT_BREAK, label: 'SHORT_BREAK_MINUTES' },
  { key: MODE.LONG_BREAK, label: 'LONG_BREAK_MINUTES' },
] as const;

function PomodoroPage() {
  const { t } = useTranslation();
  const [permission, setPermission] = useState(
    'Notification' in window ? Notification.permission : 'unsupported',
  );
  const notify = (target: Mode) =>
    target === MODE.WORK
      ? t('NOTIFY_BREAK_OVER')
      : t('NOTIFY_WORK_OVER', { mode: t(MODE_LABEL[target]).toLowerCase() });
  const timer = usePomodoro(notify);
  const { settings, mode, running, remaining, completed } = timer;
  const time = formatTime(remaining);

  useEffect(() => {
    document.title = `${time} ${t(MODE_LABEL[mode])} | ${t('TITLE')}`;
  }, [time, mode, t]);

  const toggleNotifications = async (enabled: boolean) => {
    if (enabled && permission === 'default') {
      setPermission(await Notification.requestPermission());
    }
    timer.updateSettings({ notifications: enabled });
  };
  const untilLong =
    settings.longBreakEvery - (completed % settings.longBreakEvery);

  return (
    <main className="min-h-dvh bg-background p-4 text-foreground sm:p-8">
      <div className="mx-auto max-w-md space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">{t('TITLE')}</h1>
          <p className="text-muted-foreground">{t('INTRO')}</p>
        </header>
        {timer.storageError && <p role="status">{t('STORAGE_ERROR')}</p>}
        <section
          aria-label={t(MODE_LABEL[mode])}
          className="space-y-4 rounded-lg border border-border p-6 text-center"
        >
          <p className="font-medium text-muted-foreground">
            {t(MODE_LABEL[mode])}
          </p>
          <p
            className="text-6xl font-bold tabular-nums sm:text-7xl"
            role="timer"
          >
            {time}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {running ? (
              <Button onClick={timer.pause}>{t('PAUSE')}</Button>
            ) : (
              <Button onClick={timer.start}>{t('START')}</Button>
            )}
            <Button variant="outline" onClick={timer.reset}>
              {t('RESET')}
            </Button>
            <Button variant="outline" onClick={timer.skip}>
              {t('SKIP')}
            </Button>
          </div>
          <p>{t('COMPLETED', { count: completed })}</p>
          <p className="text-sm text-muted-foreground">
            {t('NEXT_LONG_BREAK', { count: untilLong })}
          </p>
          <Button variant="outline" onClick={timer.resetAll}>
            {t('RESET_ALL')}
          </Button>
        </section>
        <section className="space-y-3">
          <h2 className="font-semibold">{t('SETTINGS')}</h2>
          {MINUTE_FIELDS.map(({ key, label }) => (
            <label key={key} className="block">
              {t(label)}
              <Input
                type="number"
                min={1}
                max={180}
                value={settings[key]}
                onChange={e => {
                  const value = Math.floor(Number(e.target.value));
                  if (value >= 1 && value <= 180)
                    timer.updateSettings({ [key]: value } as Partial<Settings>);
                }}
              />
            </label>
          ))}
          <label className="block">
            {t('LONG_BREAK_EVERY')}
            <Input
              type="number"
              min={1}
              max={12}
              value={settings.longBreakEvery}
              onChange={e => {
                const value = Math.floor(Number(e.target.value));
                if (value >= 1 && value <= 12)
                  timer.updateSettings({ longBreakEvery: value });
              }}
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.sound}
              onChange={e => timer.updateSettings({ sound: e.target.checked })}
            />
            {t('SOUND')}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              disabled={permission === 'unsupported' || permission === 'denied'}
              checked={settings.notifications && permission === 'granted'}
              onChange={e => toggleNotifications(e.target.checked)}
            />
            {t('NOTIFICATIONS')}
          </label>
          {permission === 'denied' && (
            <p className="text-sm text-muted-foreground">
              {t('NOTIFICATIONS_DENIED')}
            </p>
          )}
          {permission === 'unsupported' && (
            <p className="text-sm text-muted-foreground">
              {t('NOTIFICATIONS_UNSUPPORTED')}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

export function App() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <PomodoroPage />
      </ThemeProvider>
    </I18nProvider>
  );
}
export default App;
