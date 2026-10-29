'use client';

import { useRouter } from 'next/navigation';
import { Button, ThemeProvider } from '@vigilant-broccoli/react-lib';
import { HowToPlay } from '../how-to-play';
import { I18nProvider, useTranslation } from '../i18n';
import { useGameSettings } from '../preferences';

function SettingsView() {
  const { t } = useTranslation();
  const router = useRouter();
  const { scenery, players, music, sounds, updateSettings } = useGameSettings();
  return (
    <main className="gravity-app">
      <div className="shell settings-page">
        <p className="eyebrow">{t('APP.NAME')}</p>
        <h1>{t('APP.SETTINGS')}</h1>
        <p className="tagline">{t('APP.SETTINGS_COPY')}</p>
        <section className="settings" aria-labelledby="mode-title">
          <h2 id="mode-title">{t('APP.MODE')}</h2>
          <fieldset>
            <legend className="sr-only">{t('APP.MODE')}</legend>
            {([1, 2] as const).map(count => (
              <label key={count}>
                <input
                  type="radio"
                  name="players"
                  checked={players === count}
                  onChange={() => updateSettings({ players: count })}
                />
                {t(count === 1 ? 'APP.SINGLE_PLAYER' : 'APP.TWO_PLAYERS')}
              </label>
            ))}
          </fieldset>
          <p>{t('APP.MULTIPLAYER_HINT')}</p>
        </section>
        <section className="settings" aria-labelledby="appearance-title">
          <h2 id="appearance-title">{t('APP.APPEARANCE')}</h2>
          <label>
            <input
              type="checkbox"
              checked={scenery}
              onChange={event =>
                updateSettings({ scenery: event.target.checked })
              }
            />
            {t('APP.SCENERY')}
          </label>
          <p>{t('APP.SCENERY_HINT')}</p>
        </section>
        <section className="settings" aria-labelledby="audio-title">
          <h2 id="audio-title">{t('APP.AUDIO')}</h2>
          <label>
            <input
              type="checkbox"
              checked={music}
              onChange={event =>
                updateSettings({ music: event.target.checked })
              }
            />
            {t('APP.BACKGROUND_MUSIC')}
          </label>
          <label>
            <input
              type="checkbox"
              checked={sounds}
              onChange={event =>
                updateSettings({ sounds: event.target.checked })
              }
            />
            {t('APP.SOUND_EFFECTS')}
          </label>
          <p>{t('APP.AUDIO_HINT')}</p>
        </section>
        <section className="settings guide" aria-labelledby="guide-title">
          <h2 id="guide-title">{t('APP.GUIDE_TITLE')}</h2>
          <HowToPlay />
        </section>
        <Button
          size="lg"
          className="action settings-back"
          onClick={() => router.push('/')}
        >
          {t('APP.BACK_TO_GAME')}
        </Button>
      </div>
    </main>
  );
}
export default function Settings() {
  return (
    <ThemeProvider keybind={false}>
      <I18nProvider>
        <SettingsView />
      </I18nProvider>
    </ThemeProvider>
  );
}
