import { Phase } from '../../consts/game.consts';

export type GameViewProps<R> = {
  round: R;
  phase: Phase;
  elapsedMs: number;
  phaseDurationMs: number;
  reducedMotion: boolean;
};
