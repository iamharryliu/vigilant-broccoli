'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@vigilant-broccoli/react-lib';
import { HowToPlay } from '../how-to-play';
import { useTranslation } from '../i18n';
import { useGameSettings } from '../preferences';

function SettingsView() {
  const { t } = useTranslation();
  const [section, setSection] = useState('mode');
  const router = useRouter();
  const { scenery, players, music, sounds, updateSettings } = useGameSettings();
  return (
    <main className="gravity-app settings-app">
      <div className="shell settings-page">
        <header className="settings-header">
          <div>
            <p className="eyebrow">{t('APP.NAME')}</p>
            <h1>{t('APP.SETTINGS')}</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="settings-back"
            aria-label={t('APP.BACK_TO_GAME')}
            title={t('APP.BACK_TO_GAME')}
            onClick={() => router.push('/')}
          >
            <ArrowLeft size={22} aria-hidden="true" />
          </Button>
        </header>
        <p className="tagline">{t('APP.SETTINGS_COPY')}</p>
        <nav className="settings-sections" aria-label={t('APP.SETTINGS')}>
          {(['mode', 'appearance', 'audio', 'guide'] as const).map(id => (
            <Button
              key={id}
              variant="outline"
              aria-pressed={section === id}
              aria-controls={`${id}-panel`}
              onClick={() => setSection(id)}
            >
              {t(
                id === 'mode'
                  ? 'APP.MODE'
                  : id === 'appearance'
                    ? 'APP.APPEARANCE'
                    : id === 'audio'
                      ? 'APP.AUDIO'
                      : 'APP.GUIDE_TITLE',
              )}
            </Button>
          ))}
        </nav>
        <div
          className="settings-panels"
          tabIndex={0}
          role="region"
          aria-label={t('APP.SETTINGS')}
        >
          <section
            id="mode-panel"
            hidden={section !== 'mode'}
            className="settings"
            aria-labelledby="mode-title"
          >
            <h2 id="mode-title">{t('APP.MODE')}</h2>
            <fieldset aria-labelledby="mode-title">
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
          <section
            id="appearance-panel"
            hidden={section !== 'appearance'}
            className="settings"
            aria-labelledby="appearance-title"
          >
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
          <section
            id="audio-panel"
            hidden={section !== 'audio'}
            className="settings"
            aria-labelledby="audio-title"
          >
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
          <section
            id="guide-panel"
            hidden={section !== 'guide'}
            className="settings guide"
            aria-labelledby="guide-title"
          >
            <h2 id="guide-title">{t('APP.GUIDE_TITLE')}</h2>
            <HowToPlay />
          </section>
        </div>
      </div>
    </main>
  );
}
export default function Settings() {
  return <SettingsView />;
}
