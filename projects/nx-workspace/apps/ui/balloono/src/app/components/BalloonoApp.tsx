'use client';

import { useCallback, useState } from 'react';
import { ThemeProvider } from '@vigilant-broccoli/react-lib';
import { DIFFICULTY_LABEL_KEY, ONLINE_AVAILABLE } from '../app.consts';
import { Contender, Difficulty } from '../engine/game.types';
import { cpuContenders } from '../engine/runner';
import { usePlayerIdentity } from '../hooks/usePlayerIdentity';
import { RoomListing, useRoomDirectory } from '../hooks/useRoomDirectory';
import { I18nProvider, useTranslation } from '../i18n';
import { CpuGame } from './CpuGame';
import { HomeScreen } from './HomeScreen';
import { OnlineRoom } from './OnlineRoom';

const SCREEN = {
  HOME: 'home',
  CPU: 'cpu',
  ROOM: 'room',
} as const;

type Screen =
  | { name: typeof SCREEN.HOME }
  | { name: typeof SCREEN.CPU; contenders: Contender[] }
  | { name: typeof SCREEN.ROOM; room: string };

function Balloono() {
  const { t } = useTranslation();
  const { userId, username, setUsername } = usePlayerIdentity();
  const [screen, setScreen] = useState<Screen>({ name: SCREEN.HOME });
  const [advertisement, setAdvertisement] = useState<RoomListing | null>(null);
  const rooms = useRoomDirectory(ONLINE_AVAILABLE, userId, advertisement);
  const goHome = useCallback(() => setScreen({ name: SCREEN.HOME }), []);

  const startCpu = (opponents: number, difficulty: Difficulty) => {
    const bots = cpuContenders(
      Array.from({ length: opponents }, () => difficulty),
      (level, index) =>
        t('CPU.NAME', {
          number: index + 1,
          difficulty: t(DIFFICULTY_LABEL_KEY[level]),
        }),
    );
    setScreen({
      name: SCREEN.CPU,
      contenders: [{ id: userId, name: username, difficulty: null }, ...bots],
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
        <header className="flex flex-col gap-1">
          <button
            type="button"
            onClick={goHome}
            className="w-fit text-3xl font-black tracking-tight"
          >
            🎈 {t('APP.TITLE')}
          </button>
          <p className="text-sm text-muted-foreground">{t('APP.TAGLINE')}</p>
        </header>
        {screen.name === SCREEN.HOME && (
          <HomeScreen
            username={username}
            onUsernameChange={setUsername}
            rooms={rooms}
            onStartCpu={startCpu}
            onJoinRoom={room => setScreen({ name: SCREEN.ROOM, room })}
          />
        )}
        {screen.name === SCREEN.CPU && (
          <CpuGame
            contenders={screen.contenders}
            playerId={userId}
            onQuit={goHome}
          />
        )}
        {screen.name === SCREEN.ROOM && (
          <OnlineRoom
            room={screen.room}
            userId={userId}
            username={username}
            onLeave={goHome}
            onAdvertise={setAdvertisement}
          />
        )}
      </main>
    </div>
  );
}

export function BalloonoApp() {
  return (
    <I18nProvider>
      <ThemeProvider followSystem>
        <Balloono />
      </ThemeProvider>
    </I18nProvider>
  );
}

export default BalloonoApp;
