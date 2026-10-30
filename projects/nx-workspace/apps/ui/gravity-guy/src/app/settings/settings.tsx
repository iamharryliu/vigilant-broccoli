'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Image as ImageIcon, Music2, Volume2 } from 'lucide-react';
import { Button } from '@vigilant-broccoli/react-lib';
import { GameCard } from '../game-card';
import { HowToPlay } from '../how-to-play';
import { useTranslation } from '../i18n';
import {
  CALM_MUSIC_SEED,
  useGameAudio,
  useUnlockOnInteraction,
} from '../audio';
import { useGameSettings } from '../preferences';

function SettingsView() {
  const { t } = useTranslation();
  const [section, setSection] = useState('preferences');
  const router = useRouter();
  const { scenery, music, sounds, updateSettings } = useGameSettings();
  const { unlock } = useGameAudio(true, music, sounds, CALM_MUSIC_SEED);
  useUnlockOnInteraction(unlock);
  return (
    <main
      className="gravity-app settings-app"
      data-scenery={scenery ? 'on' : 'off'}
    >
      <div className="shell">
        <GameCard label={t('APP.SETTINGS')}>
          <div className="settings-page">
            <header className="settings-header">
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
              <h1>{t('APP.SETTINGS')}</h1>
            </header>
            <nav className="settings-sections" aria-label={t('APP.SETTINGS')}>
              {(['preferences', 'guide'] as const).map(id => (
                <Button
                  key={id}
                  variant="outline"
                  aria-pressed={section === id}
                  aria-controls={`${id}-panel`}
                  onClick={() => setSection(id)}
                >
                  {t(
                    id === 'preferences'
                      ? 'APP.PREFERENCES'
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
                id="preferences-panel"
                hidden={section !== 'preferences'}
                className="settings preference-blocks"
              >
                {[
                  {
                    key: 'scenery',
                    label: 'APP.SCENERY' as const,
                    on: scenery,
                    icon: <ImageIcon size={26} aria-hidden="true" />,
                  },
                  {
                    key: 'music',
                    label: 'APP.BACKGROUND_MUSIC' as const,
                    on: music,
                    icon: <Music2 size={26} aria-hidden="true" />,
                  },
                  {
                    key: 'sounds',
                    label: 'APP.SOUND_EFFECTS' as const,
                    on: sounds,
                    icon: <Volume2 size={26} aria-hidden="true" />,
                  },
                ].map(({ key, label, on, icon }) => (
                  <Button
                    key={key}
                    variant="outline"
                    className="preference-block"
                    aria-pressed={on}
                    onClick={() => updateSettings({ [key]: !on })}
                  >
                    {icon}
                    {t(label)}
                  </Button>
                ))}
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
        </GameCard>
      </div>
    </main>
  );
}
export default function Settings() {
  return <SettingsView />;
}
