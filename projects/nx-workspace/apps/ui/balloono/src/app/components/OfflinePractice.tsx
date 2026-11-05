'use client';

import { useState } from 'react';
import {
  Button,
  CardContainer,
  SegmentedControl,
} from '@vigilant-broccoli/react-lib';
import { DIFFICULTY_LABEL_KEY } from '../app.consts';
import { DIFFICULTIES, DIFFICULTY, MAX_PLAYERS } from '../engine/game.consts';
import { Difficulty } from '../engine/game.types';
import { useTranslation } from '../i18n';
import { RulesHelpDialog } from './RulesHelpDialog';

const DEFAULT_OPPONENTS = '3';

export function OfflinePractice({
  onStartCpu,
}: {
  onStartCpu: (
    opponents: number,
    difficulty: Difficulty,
    localPlayer: boolean,
  ) => void;
}) {
  const { t } = useTranslation();
  const [opponents, setOpponents] = useState(DEFAULT_OPPONENTS);
  const [difficulty, setDifficulty] = useState<Difficulty>(DIFFICULTY.MEDIUM);
  const [localPlayer, setLocalPlayer] = useState(false);
  const counts = Array.from(
    { length: MAX_PLAYERS - (localPlayer ? 2 : 1) },
    (_, index) => String(index + 1),
  );
  const selectedOpponents = counts.includes(opponents)
    ? opponents
    : counts[counts.length - 1];

  return (
    <CardContainer
      title={`🎮 ${t('HOME.OFFLINE_MODE')}`}
      headerAction={<RulesHelpDialog hasLocalPlayer={localPlayer} />}
    >
      <p className="text-sm text-muted-foreground">{t('CPU.DESCRIPTION')}</p>
      <div id="offline-settings" className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{t('CPU.OPPONENTS')}</span>
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
          <span className="text-sm font-medium">{t('CPU.DIFFICULTY')}</span>
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
      </div>
    </CardContainer>
  );
}
