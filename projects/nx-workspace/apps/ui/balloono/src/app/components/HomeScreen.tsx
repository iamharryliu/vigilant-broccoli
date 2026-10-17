'use client';

import { FormEvent, useState } from 'react';
import { Button, CardContainer, Input } from '@vigilant-broccoli/react-lib';
import { APP_NAME, normalizeRoomName, ONLINE_AVAILABLE } from '../app.consts';
import { Difficulty } from '../engine/game.types';
import { MAX_NAME_LENGTH, randomPhrase } from '../hooks/usePlayerIdentity';
import { RoomListing } from '../hooks/useRoomDirectory';
import { useTranslation } from '../i18n';
import { usePageTitle } from '../use-page-title';
import { AccountControl } from './AccountControl';
import { StatsPanel } from './StatsPanel';
import { LeaderboardPanel } from './LeaderboardPanel';
import { OfflinePractice } from './OfflinePractice';
import { RoomDirectory } from './RoomDirectory';

const RANDOMIZE_ICON = '🎲';

export function HomeScreen({
  username,
  onUsernameChange,
  rooms,
  onStartCpu,
  onJoinRoom,
}: {
  username: string;
  onUsernameChange: (name: string) => void;
  rooms: RoomListing[];
  onStartCpu: (
    opponents: number,
    difficulty: Difficulty,
    localPlayer: boolean,
  ) => void;
  onJoinRoom: (room: string) => void;
}) {
  const { t } = useTranslation();
  usePageTitle(t('PAGE.HOME'));
  const [roomDraft, setRoomDraft] = useState('');
  const joinDraft = (event: FormEvent) => {
    event.preventDefault();
    const room = normalizeRoomName(roomDraft);
    if (room) onJoinRoom(room);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-6 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('HOME.TAGLINE')}
          </p>
        </div>
        <AccountControl />
      </header>
      <div className="flex items-center gap-3">
        <label htmlFor="player-name" className="shrink-0 text-sm font-medium">
          {t('PROFILE.NAME_LABEL')}
        </label>
        <div className="flex w-80 gap-2">
          <Input
            id="player-name"
            placeholder={t('PROFILE.NAME_PLACEHOLDER')}
            value={username}
            maxLength={MAX_NAME_LENGTH}
            onChange={event => onUsernameChange(event.target.value)}
          />
          <Button
            variant="outline"
            size="icon"
            aria-label={t('PROFILE.RANDOM_NAME')}
            title={t('PROFILE.RANDOM_NAME')}
            onClick={() => onUsernameChange(randomPhrase())}
          >
            {RANDOMIZE_ICON}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_22rem] items-start gap-6">
        <section
          className="flex min-w-0 flex-col gap-6"
          aria-label={t('HOME.PLAY')}
        >
          <CardContainer title={t('HOME.ONLINE')}>
            <p className="text-sm text-muted-foreground">
              {t('HOME.ONLINE_HINT')}
            </p>
            {ONLINE_AVAILABLE ? (
              <>
                <form onSubmit={joinDraft} className="flex gap-2">
                  <Input
                    aria-label={t('ONLINE.ROOM_LABEL')}
                    placeholder={t('ONLINE.ROOM_PLACEHOLDER')}
                    value={roomDraft}
                    onChange={event => setRoomDraft(event.target.value)}
                  />
                  <Button
                    variant="outline"
                    type="submit"
                    disabled={!normalizeRoomName(roomDraft)}
                  >
                    {t('ONLINE.JOIN')}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => onJoinRoom(randomPhrase())}
                  >
                    {t('HOME.CREATE_ROOM')}
                  </Button>
                </form>
                <RoomDirectory rooms={rooms} onJoinRoom={onJoinRoom} />
              </>
            ) : (
              <p role="status" className="text-sm text-muted-foreground">
                {t('ONLINE.UNAVAILABLE')}
              </p>
            )}
          </CardContainer>
          <OfflinePractice onStartCpu={onStartCpu} />
        </section>
        <aside
          className="flex min-w-0 flex-col gap-6"
          aria-label={t('HOME.PROGRESS')}
        >
          <StatsPanel />
          <LeaderboardPanel />
          <CardContainer title={t('HOME.HOW_TO_PLAY')}>
            <p className="text-sm text-muted-foreground">{t('HOME.GOAL')}</p>
            <p className="text-xs text-muted-foreground">
              {t('MATCH.CONTROLS_HINT')}
            </p>
          </CardContainer>
        </aside>
      </div>
    </div>
  );
}
