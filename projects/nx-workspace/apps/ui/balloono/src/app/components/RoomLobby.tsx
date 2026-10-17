'use client';

import { useEffect, useState } from 'react';
import { Badge, CardContainer } from '@vigilant-broccoli/react-lib';
import { MAX_PLAYERS } from '../engine/game.consts';
import { MIN_ONLINE_PLAYERS, RoomMember } from '../hooks/useOnlineRoom';
import { useTranslation } from '../i18n';

export function RoomLobby({
  room,
  userId,
  members,
  hostId,
  startsAt,
}: {
  room: string;
  userId: string;
  members: RoomMember[];
  hostId: string | null;
  startsAt: number | null;
}) {
  const { t } = useTranslation();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (startsAt === null) return;
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, [startsAt]);
  const seconds = Math.max(0, Math.ceil(((startsAt ?? now) - now) / 1000));

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {t('LOBBY.SHARE_HINT', { room })}
      </p>
      <div className="flex flex-col gap-4">
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
      </div>
      <p role="status" className="text-sm text-muted-foreground">
        {startsAt === null
          ? t('LOBBY.NEED_PLAYERS', { count: MIN_ONLINE_PLAYERS })
          : t('LOBBY.COUNTDOWN', { seconds })}
      </p>
      <p className="text-xs text-muted-foreground">
        {t('LOBBY.COUNTDOWN_HINT')}
      </p>
    </div>
  );
}
