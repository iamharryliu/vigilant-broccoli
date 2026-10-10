'use client';

import { Button } from '@vigilant-broccoli/react-lib';
import { Contender } from '../engine/game.types';
import { useControls } from '../hooks/useControls';
import { useCpuMatch } from '../hooks/useCpuMatch';
import { useTranslation } from '../i18n';
import { usePageTitle } from '../use-page-title';
import { MatchView } from './MatchView';

export function CpuGame({
  contenders,
  playerId,
  onQuit,
}: {
  contenders: Contender[];
  playerId: string;
  onQuit: () => void;
}) {
  const { t } = useTranslation();
  usePageTitle(t('PAGE.CPU'));
  const controls = useControls(true);
  const { match, wins, restart } = useCpuMatch(contenders, playerId, controls);

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
        controls={controls}
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
