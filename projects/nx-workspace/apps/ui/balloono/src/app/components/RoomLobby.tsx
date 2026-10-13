'use client';

import { useState } from 'react';
import {
  Badge,
  Button,
  CardContainer,
  SegmentedControl,
} from '@vigilant-broccoli/react-lib';
import { DIFFICULTY_LABEL_KEY } from '../app.consts';
import { DIFFICULTIES, DIFFICULTY, MAX_PLAYERS } from '../engine/game.consts';
import { Difficulty } from '../engine/game.types';
import { cpuContenders } from '../engine/runner';
import { RoomMember } from '../hooks/useOnlineRoom';
import { useTranslation } from '../i18n';

export function RoomLobby({
  room,
  userId,
  members,
  hostId,
  isHost,
  cpus,
  setCpus,
  startMatch,
  cpuName,
}: {
  room: string;
  userId: string;
  members: RoomMember[];
  hostId: string | null;
  isHost: boolean;
  cpus: Difficulty[];
  setCpus: (cpus: Difficulty[]) => void;
  startMatch: () => void;
  cpuName: (difficulty: Difficulty, index: number) => string;
}) {
  const { t } = useTranslation();
  const [cpuDraft, setCpuDraft] = useState<Difficulty>(DIFFICULTY.MEDIUM);
  const seated = members.slice(0, MAX_PLAYERS);
  const hostName =
    members.find(member => member.userId === hostId)?.username ?? '';
  const cpuSeats = Math.max(0, MAX_PLAYERS - seated.length);
  const lobbyCpus = cpuContenders(cpus, cpuName);
  const canStart = seated.length + Math.min(cpus.length, cpuSeats) >= 2;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {t('LOBBY.SHARE_HINT', { room })}
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        <CardContainer title={t('LOBBY.PLAYERS')}>
          <ul className="flex flex-col gap-2">
            {members.map((member, index) => (
              <li key={member.userId} className="flex items-center gap-2">
                <span className="truncate">{member.username}</span>
                {member.userId === hostId && (
                  <Badge size="1" variant="soft" color="purple">
                    {t('LOBBY.HOST_BADGE')}
                  </Badge>
                )}
                {member.userId === userId && (
                  <Badge size="1" variant="soft" color="blue">
                    {t('LOBBY.YOU_BADGE')}
                  </Badge>
                )}
                {index >= MAX_PLAYERS && (
                  <Badge size="1" variant="soft" color="gray">
                    {t('LOBBY.SPECTATOR_BADGE')}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
          {members.length >= MAX_PLAYERS && (
            <p className="text-xs text-muted-foreground">
              {t('LOBBY.SEATS_FULL', { count: MAX_PLAYERS })}
            </p>
          )}
        </CardContainer>
        <CardContainer title={t('LOBBY.CPUS')}>
          {lobbyCpus.length ? (
            <ul className="flex flex-col gap-2">
              {lobbyCpus.map((cpu, index) => (
                <li
                  key={cpu.id}
                  className={`flex items-center justify-between gap-2 ${index < cpuSeats ? '' : 'opacity-50'}`}
                >
                  <span className="truncate">{cpu.name}</span>
                  {isHost && (
                    <Button
                      variant="destructive-ghost"
                      size="xs"
                      onClick={() =>
                        setCpus(cpus.filter((_, i) => i !== index))
                      }
                    >
                      {t('LOBBY.REMOVE_CPU', { name: cpu.name })}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('LOBBY.NO_CPUS')}
            </p>
          )}
          {isHost && (
            <div className="flex flex-wrap items-center gap-2">
              <SegmentedControl
                label={t('CPU.DIFFICULTY')}
                value={cpuDraft}
                size="sm"
                options={DIFFICULTIES.map(value => ({
                  value,
                  label: t(DIFFICULTY_LABEL_KEY[value]),
                }))}
                onChange={setCpuDraft}
              />
              <Button
                variant="outline"
                size="sm"
                disabled={cpus.length >= cpuSeats}
                onClick={() => setCpus([...cpus, cpuDraft])}
              >
                {t('LOBBY.ADD_CPU')}
              </Button>
            </div>
          )}
        </CardContainer>
      </div>
      {isHost ? (
        <div className="flex flex-col items-start gap-2">
          <Button disabled={!canStart} onClick={startMatch}>
            {t('LOBBY.START')}
          </Button>
          {!canStart && (
            <p className="text-sm text-muted-foreground">
              {t('LOBBY.NEED_PLAYERS')}
            </p>
          )}
        </div>
      ) : (
        hostName && (
          <p className="text-sm text-muted-foreground">
            {t('LOBBY.WAITING_FOR_HOST', { name: hostName })}
          </p>
        )
      )}
    </div>
  );
}
