'use client';

import { useMemo } from 'react';
import { Button } from '@vigilant-broccoli/react-lib';
import { Contender } from '../engine/game.types';
import { useControls } from '../hooks/useControls';
import { usePlayerKeyMaps } from '../hooks/useKeyBindings';
import { useCpuMatch } from '../hooks/useCpuMatch';
import { useTranslation } from '../i18n';
import { usePageTitle } from '../use-page-title';
import { MatchView } from './MatchView';

export function CpuGame({
  contenders,
  playerId,
  localPlayerId,
  onQuit,
}: {
  contenders: Contender[];
  playerId: string;
  localPlayerId: string;
  onQuit: () => void;
}) {
  const { t } = useTranslation();
  usePageTitle(t('PAGE.CPU'));
  const hasLocalPlayer = contenders.some(({ id }) => id === localPlayerId);
  const keyMaps = usePlayerKeyMaps(hasLocalPlayer);
  const controls = useControls(true, keyMaps.one);
  const localControls = useControls(hasLocalPlayer, keyMaps.two);
  const localPlayer = useMemo(
    () =>
      hasLocalPlayer
        ? { id: localPlayerId, controls: localControls }
        : undefined,
    [hasLocalPlayer, localPlayerId, localControls],
  );
  const { match, wins, restart } = useCpuMatch(
    contenders,
    playerId,
    controls,
    localPlayer,
  );

  if (!match) return null;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onQuit}>
          {t('MATCH.QUIT')}
        </Button>
      </div>
      <MatchView
        match={match}
        localPlayerId={playerId}
        wins={wins}
        hasLocalPlayer={hasLocalPlayer}
        actions={
          <>
            <Button onClick={restart}>{t('MATCH.PLAY_AGAIN')}</Button>
            <Button variant="outline" onClick={onQuit}>
              {t('MATCH.QUIT')}
            </Button>
          </>
        }
      />
    </div>
  );
}
