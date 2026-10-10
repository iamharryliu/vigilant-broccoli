'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@vigilant-broccoli/react-lib';
import { DIFFICULTY_LABEL_KEY } from '../app.consts';
import { MATCH_STATUS } from '../engine/game.consts';
import { Difficulty } from '../engine/game.types';
import { useControls } from '../hooks/useControls';
import { CONNECTION, useOnlineRoom } from '../hooks/useOnlineRoom';
import { RoomListing } from '../hooks/useRoomDirectory';
import { useTranslation } from '../i18n';
import { usePageTitle } from '../use-page-title';
import { MatchView } from './MatchView';
import { RoomLobby } from './RoomLobby';

export function OnlineRoom({
  room,
  userId,
  username,
  onLeave,
  onAdvertise,
}: {
  room: string;
  userId: string;
  username: string;
  onLeave: () => void;
  onAdvertise: (listing: RoomListing | null) => void;
}) {
  const { t } = useTranslation();
  usePageTitle(t('PAGE.ROOM', { room }));

  const cpuName = useCallback(
    (difficulty: Difficulty, index: number) =>
      t('CPU.NAME', {
        number: index + 1,
        difficulty: t(DIFFICULTY_LABEL_KEY[difficulty]),
      }),
    [t],
  );

  const [controlsEnabled, setControlsEnabled] = useState(false);
  const controls = useControls(controlsEnabled);
  const {
    connection,
    members,
    seated,
    hostId,
    isHost,
    snapshot,
    snapshotReady,
    setCpus,
    startMatch,
    backToLobby,
  } = useOnlineRoom({ room, userId, username, controls, cpuName });

  const { match, cpus, wins } = snapshot;
  const playing = match?.status === MATCH_STATUS.PLAYING;
  const isSeatedInMatch = Boolean(
    match?.players.some(player => player.id === userId),
  );
  useEffect(() => {
    setControlsEnabled(playing && isSeatedInMatch);
  }, [playing, isSeatedInMatch]);

  useEffect(() => {
    onAdvertise(
      isHost
        ? { room, hostName: username, players: seated.length, playing }
        : null,
    );
  }, [isHost, room, username, seated.length, playing, onAdvertise]);
  useEffect(() => () => onAdvertise(null), [onAdvertise]);

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-xl font-bold">{t('PAGE.ROOM', { room })}</h2>
      <Button variant="outline" size="sm" onClick={onLeave}>
        {t('LOBBY.LEAVE')}
      </Button>
    </div>
  );

  const connectionNotice =
    connection === CONNECTION.CONNECTED ? null : (
      <p className="text-sm text-muted-foreground" role="status">
        {connection === CONNECTION.ERROR
          ? t('CONNECTION.ERROR')
          : t('CONNECTION.CONNECTING')}
      </p>
    );

  if (match) {
    return (
      <div className="flex flex-col gap-4">
        {header}
        {connectionNotice}
        <MatchView
          match={match}
          localPlayerId={userId}
          wins={wins}
          controls={controls}
          soundsEnabled={
            connection === CONNECTION.CONNECTED && (isHost || snapshotReady)
          }
          note={isSeatedInMatch ? undefined : t('MATCH.SPECTATING')}
          actions={
            isHost ? (
              <>
                <Button onClick={startMatch}>{t('MATCH.PLAY_AGAIN')}</Button>
                <Button variant="outline" onClick={backToLobby}>
                  {t('MATCH.BACK_TO_LOBBY')}
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t('MATCH.WAITING_FOR_HOST')}
              </p>
            )
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {header}
      {connectionNotice}
      <RoomLobby
        room={room}
        userId={userId}
        members={members}
        hostId={hostId}
        isHost={isHost}
        cpus={cpus}
        setCpus={setCpus}
        startMatch={startMatch}
        cpuName={cpuName}
      />
    </div>
  );
}
