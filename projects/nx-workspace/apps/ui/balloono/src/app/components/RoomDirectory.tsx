'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@vigilant-broccoli/react-lib';
import { MAX_PLAYERS } from '../engine/game.consts';
import { MIN_ONLINE_PLAYERS } from '../hooks/useOnlineRoom';
import { RoomListing } from '../hooks/useRoomDirectory';
import { useTranslation } from '../i18n';

export function RoomDirectory({
  rooms,
  onJoinRoom,
}: {
  rooms: RoomListing[];
  onJoinRoom: (room: string) => void;
}) {
  const { t } = useTranslation();
  const [now, setNow] = useState(() => Date.now());
  const hasCountdown = rooms.some(
    room => !room.playing && room.startsAt != null,
  );
  useEffect(() => {
    if (!hasCountdown) return;
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [hasCountdown]);

  return (
    <div className="mt-2 border-t border-border pt-4">
      <h2 className="mb-3 text-sm font-semibold">
        {t('HOME.AVAILABLE_ROOMS')}
      </h2>
      {rooms.length ? (
        <ul className="flex flex-col gap-2">
          {rooms.map(room => {
            const status = room.playing
              ? t('HOME.IN_PROGRESS')
              : room.startsAt != null
                ? t('HOME.STARTING', {
                    seconds: Math.max(
                      0,
                      Math.ceil((room.startsAt - now) / 1000),
                    ),
                  })
                : room.players < MIN_ONLINE_PLAYERS
                  ? t('HOME.NEEDS_PLAYERS', {
                      count: MIN_ONLINE_PLAYERS - room.players,
                    })
                  : t('ONLINE.ROOM_WAITING');
            const watching = room.playing || room.players >= MAX_PLAYERS;
            return (
              <li
                key={room.room}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{room.room}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {t('ONLINE.HOSTED_BY', { name: room.hostName })}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge
                    size="1"
                    variant="soft"
                    color={room.playing ? 'amber' : 'green'}
                  >
                    {status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {t('ONLINE.ROOM_PLAYERS', {
                      count: room.players,
                      max: MAX_PLAYERS,
                    })}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={t(
                    watching ? 'HOME.WATCH_ROOM' : 'HOME.JOIN_ROOM',
                    { room: room.room },
                  )}
                  onClick={() => onJoinRoom(room.room)}
                >
                  {t(watching ? 'HOME.WATCH' : 'HOME.JOIN')}
                </Button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          {t('HOME.NO_ROOMS')}
        </p>
      )}
    </div>
  );
}
