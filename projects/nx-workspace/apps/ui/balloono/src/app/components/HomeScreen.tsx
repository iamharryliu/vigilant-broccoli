'use client';

import { FormEvent, useState } from 'react';
import {
  Badge,
  Button,
  CardContainer,
  Input,
  SegmentedControl,
} from '@vigilant-broccoli/react-lib';
import {
  DIFFICULTY_LABEL_KEY,
  normalizeRoomName,
  ONLINE_AVAILABLE,
} from '../app.consts';
import { DIFFICULTIES, DIFFICULTY, MAX_PLAYERS } from '../engine/game.consts';
import { Difficulty } from '../engine/game.types';
import { MAX_NAME_LENGTH, randomPhrase } from '../hooks/usePlayerIdentity';
import { RoomListing } from '../hooks/useRoomDirectory';
import { useTranslation } from '../i18n';
import { usePageTitle } from '../use-page-title';

const RANDOMIZE_ICON = '🎲';
const opponentCounts = (humans: number) =>
  Array.from({ length: MAX_PLAYERS - humans }, (_, index) => String(index + 1));
const DEFAULT_OPPONENTS = '3';

const STEP = {
  GAMES: 'games',
  START: 'start',
} as const;

const MODE = {
  CPU: 'cpu',
  ONLINE: 'online',
} as const;

type Step = (typeof STEP)[keyof typeof STEP];
type Mode = (typeof MODE)[keyof typeof MODE];

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
  const [opponents, setOpponents] = useState(DEFAULT_OPPONENTS);
  const [difficulty, setDifficulty] = useState<Difficulty>(DIFFICULTY.MEDIUM);
  const [step, setStep] = useState<Step>(STEP.GAMES);
  const [mode, setMode] = useState<Mode>(MODE.CPU);
  const [localPlayer, setLocalPlayer] = useState(false);
  const counts = opponentCounts(localPlayer ? 2 : 1);
  const selectedOpponents = counts.includes(opponents)
    ? opponents
    : counts[counts.length - 1];
  const [roomDraft, setRoomDraft] = useState('');

  const joinDraft = (event: FormEvent) => {
    event.preventDefault();
    const room = normalizeRoomName(roomDraft);
    if (room) onJoinRoom(room);
  };

  return (
    <div className="flex flex-col gap-6">
      <CardContainer title={t('PROFILE.NAME_LABEL')}>
        <div className="flex gap-2">
          <Input
            aria-label={t('PROFILE.NAME_LABEL')}
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
      </CardContainer>

      {step === STEP.GAMES && (
        <CardContainer
          title={t('GAMES.TITLE')}
          headerAction={
            <Button onClick={() => setStep(STEP.START)}>
              {t('START.BUTTON')}
            </Button>
          }
        >
          {rooms.length ? (
            <ul className="flex flex-col gap-2">
              {rooms.map(listing => (
                <li key={listing.room}>
                  <button
                    type="button"
                    onClick={() => onJoinRoom(listing.room)}
                    className="flex w-full items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-left hover:bg-accent"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {listing.room}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {t('ONLINE.HOSTED_BY', { name: listing.hostName })}
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-xs">
                        {t('ONLINE.ROOM_PLAYERS', {
                          count: listing.players,
                          max: MAX_PLAYERS,
                        })}
                      </span>
                      <Badge
                        size="1"
                        variant="soft"
                        color={listing.playing ? 'amber' : 'green'}
                      >
                        {listing.playing
                          ? t('ONLINE.ROOM_PLAYING')
                          : t('ONLINE.ROOM_WAITING')}
                      </Badge>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">{t('GAMES.EMPTY')}</p>
          )}
        </CardContainer>
      )}

      {step === STEP.START && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setStep(STEP.GAMES)}>
              {t('START.BACK')}
            </Button>
            <SegmentedControl
              label={t('START.MODE')}
              value={mode}
              options={[
                { value: MODE.CPU, label: t('CPU.TITLE') },
                { value: MODE.ONLINE, label: t('ONLINE.TITLE') },
              ]}
              onChange={setMode}
            />
          </div>

          {mode === MODE.CPU && (
            <CardContainer title={t('CPU.TITLE')}>
              <p className="text-sm text-muted-foreground">
                {t('CPU.DESCRIPTION')}
              </p>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">
                  {t('CPU.OPPONENTS')}
                </span>
                <SegmentedControl
                  label={t('CPU.OPPONENTS')}
                  value={selectedOpponents}
                  options={counts.map(count => ({
                    value: count,
                    label: count,
                  }))}
                  onChange={setOpponents}
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">
                  {t('CPU.DIFFICULTY')}
                </span>
                <SegmentedControl
                  label={t('CPU.DIFFICULTY')}
                  value={difficulty}
                  options={DIFFICULTIES.map(value => ({
                    value,
                    label: t(DIFFICULTY_LABEL_KEY[value]),
                  }))}
                  onChange={setDifficulty}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={localPlayer}
                  onChange={event => setLocalPlayer(event.target.checked)}
                />
                <span>
                  <span className="font-medium">{t('LOCAL.ADD')}</span>
                  <span className="block text-xs text-muted-foreground">
                    {t('LOCAL.DESCRIPTION')}
                  </span>
                </span>
              </label>
              <Button
                onClick={() =>
                  onStartCpu(Number(selectedOpponents), difficulty, localPlayer)
                }
              >
                {t('CPU.START')}
              </Button>
            </CardContainer>
          )}

          {mode === MODE.ONLINE && (
            <CardContainer title={t('ONLINE.TITLE')}>
              {ONLINE_AVAILABLE ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {t('ONLINE.DESCRIPTION')}
                  </p>
                  <form className="flex gap-2" onSubmit={joinDraft}>
                    <Input
                      aria-label={t('ONLINE.ROOM_LABEL')}
                      placeholder={t('ONLINE.ROOM_PLACEHOLDER')}
                      value={roomDraft}
                      onChange={event => setRoomDraft(event.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label={t('ONLINE.RANDOM_ROOM')}
                      title={t('ONLINE.RANDOM_ROOM')}
                      onClick={() => setRoomDraft(randomPhrase())}
                    >
                      {RANDOMIZE_ICON}
                    </Button>
                    <Button
                      type="submit"
                      disabled={!normalizeRoomName(roomDraft)}
                    >
                      {t('ONLINE.JOIN')}
                    </Button>
                  </form>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t('ONLINE.UNAVAILABLE')}
                </p>
              )}
            </CardContainer>
          )}
        </div>
      )}
    </div>
  );
}
