'use client';

import { FormEvent, useState } from 'react';
import { Dices, Gamepad2, Globe, Settings } from 'lucide-react';
import {
  Button,
  CardContainer,
  Card,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@vigilant-broccoli/react-lib';
import { APP_NAME, normalizeRoomName, ONLINE_AVAILABLE } from '../app.consts';
import { Difficulty } from '../engine/game.types';
import { MAX_NAME_LENGTH, randomPhrase } from '../hooks/usePlayerIdentity';
import { RoomListing } from '../hooks/useRoomDirectory';
import { useTranslation } from '../i18n';
import { usePageTitle } from '../use-page-title';
import { AccountControl } from './AccountControl';
import { PracticeArena } from './PracticeArena';
import { StatsPanel } from './StatsPanel';
import { LeaderboardPanel } from './LeaderboardPanel';
import { OfflinePractice } from './OfflinePractice';
import { RoomDirectory } from './RoomDirectory';
import { KeyBindingsDialog } from './KeyBindingsDialog';
import { RulesHelpDialog } from './RulesHelpDialog';

const HOME_TAB = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  SETTINGS: 'settings',
} as const;

export function HomeScreen({
  onPracticeActiveChange,
  username,
  onUsernameChange,
  rooms,
  onStartCpu,
  onJoinRoom,
}: {
  onPracticeActiveChange: (active: boolean) => void;
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
    <div className="flex h-[calc(100dvh-3rem)] min-h-[32rem] flex-col gap-6">
      <header className="flex items-center justify-between gap-6 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('HOME.TAGLINE')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AccountControl />
        </div>
      </header>
      <Tabs
        defaultValue={HOME_TAB.ONLINE}
        className="flex min-h-0 flex-1 flex-col"
      >
        <TabsList
          aria-label={t('HOME.NAVIGATION')}
          className="h-11 w-full shrink-0"
        >
          <TabsTrigger value={HOME_TAB.ONLINE}>
            <Globe className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t('HOME.ONLINE_MODE')}
          </TabsTrigger>
          <TabsTrigger value={HOME_TAB.OFFLINE}>
            <Gamepad2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t('HOME.OFFLINE_MODE')}
          </TabsTrigger>
          <TabsTrigger value={HOME_TAB.SETTINGS}>
            <Settings className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t('SETTINGS.TITLE')}
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value={HOME_TAB.ONLINE}
          className="min-h-0 flex-1 grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6 data-[state=active]:grid"
        >
          <div className="min-h-0 min-w-0 [&>div]:h-full [&>div]:overflow-y-auto">
            <CardContainer
              title={`🌐 ${t('HOME.ONLINE_MODE')}`}
              headerAction={<RulesHelpDialog />}
            >
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
          </div>
          <aside className="flex min-h-0 min-w-0 flex-col gap-6">
            <div className="min-h-0 flex-1 [&>div]:h-full [&>div]:overflow-y-auto">
              <LeaderboardPanel />
            </div>
            <div className="max-h-[40%] shrink-0 overflow-y-auto empty:hidden">
              <StatsPanel />
            </div>
          </aside>
        </TabsContent>
        <TabsContent
          value={HOME_TAB.OFFLINE}
          className="min-h-0 flex-1 [&>div]:h-full [&>div]:overflow-y-auto"
        >
          <OfflinePractice onStartCpu={onStartCpu} />
        </TabsContent>
        <TabsContent
          value={HOME_TAB.SETTINGS}
          className="min-h-0 flex-1 [&>div]:h-full [&>div]:overflow-y-auto"
        >
          <Card className="flex flex-col gap-4 p-4">
            <section className="flex flex-col gap-4 pb-6">
              <div className="flex items-center gap-3">
                <label
                  htmlFor="player-name"
                  className="shrink-0 text-sm font-medium"
                >
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
                    <Dices className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </div>
            </section>
            <KeyBindingsDialog />
            <PracticeArena onActiveChange={onPracticeActiveChange} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
