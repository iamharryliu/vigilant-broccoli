'use client';

import { useCallback, useState } from 'react';
import { ThemeProvider } from '@vigilant-broccoli/react-lib';
import { DIFFICULTY_LABEL_KEY, ONLINE_AVAILABLE } from '../app.consts';
import { Contender, Difficulty } from '../engine/game.types';
import { MAX_PLAYERS } from '../engine/game.consts';
import { cpuContenders, fillSeats } from '../engine/runner';
import { GameAudioProvider } from '../hooks/useGameAudio';
import { usePlayerIdentity } from '../hooks/usePlayerIdentity';
import { RoomListing, useRoomDirectory } from '../hooks/useRoomDirectory';
import { I18nProvider, useTranslation } from '../i18n';
import { CpuGame } from './CpuGame';
import { HomeScreen } from './HomeScreen';
import { OnlineRoom } from './OnlineRoom';

const LOCAL_PLAYER_SUFFIX = '-local';

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
  const localPlayerId = `${userId}${LOCAL_PLAYER_SUFFIX}`;
  const goHome = useCallback(() => setScreen({ name: SCREEN.HOME }), []);

  const startCpu = (
    opponents: number,
    difficulty: Difficulty,
    localPlayer: boolean,
  ) => {
    const humans: Contender[] = [
      { id: userId, name: username, difficulty: null },
      ...(localPlayer
        ? [{ id: localPlayerId, name: t('LOCAL.NAME'), difficulty: null }]
        : []),
    ];
    const bots = cpuContenders(
      Array.from(
        { length: Math.min(opponents, MAX_PLAYERS - humans.length) },
        () => difficulty,
      ),
      (level, index) =>
        t('CPU.NAME', {
          number: index + 1,
          difficulty: t(DIFFICULTY_LABEL_KEY[level]),
        }),
    );
    setScreen({
      name: SCREEN.CPU,
      contenders: fillSeats(humans, bots),
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
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
            localPlayerId={localPlayerId}
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
        <GameAudioProvider>
          <Balloono />
        </GameAudioProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}

export default BalloonoApp;
