import { CSSProperties } from 'react';
import {
  CUP_COUNT,
  CUP_TIMING,
  PHASE,
  SLOT_NAME,
} from '../../consts/game.consts';
import { getCupStep, isCupSwapMoving } from '../../engine/cup-round';
import { CupRound } from '../../engine/types';
import { useTranslation } from '../../i18n';
import { GameViewProps } from './game.types';

const SLOT_WIDTH_PERCENT = 100 / CUP_COUNT;
const CUP_CLIP_PATH = 'polygon(14% 0, 86% 0, 100% 100%, 0 100%)';

export const CupAndBallGame = ({
  round,
  phase,
  elapsedMs,
  reducedMotion,
}: GameViewProps<CupRound>) => {
  const { t } = useTranslation();
  const inPrompt = phase === PHASE.PROMPT;
  const answered = phase === PHASE.REVEAL || phase === PHASE.BREAK;
  const step = inPrompt ? getCupStep(round, elapsedMs) : round.swaps.length;
  const layout = round.layouts[step];
  const previousLayout = round.layouts[Math.max(0, step - 1)];
  const ballShown = inPrompt && elapsedMs < CUP_TIMING.SHOW_BALL_MS;
  const moving = inPrompt && isCupSwapMoving(round, elapsedMs);

  const positionName = (slot: number) => t(`CUPS.POSITION.${SLOT_NAME[slot]}`);

  const movingCups = layout
    .map((slot, cup) => (slot !== previousLayout[cup] ? cup : -1))
    .filter(cup => cup >= 0);

  const headline = answered
    ? t('CUPS.REVEAL', { position: positionName(round.answerSlot) })
    : phase === PHASE.THINKING
      ? t('CUPS.GUESS')
      : ballShown
        ? t('CUPS.WATCH_BALL')
        : t('CUPS.SHUFFLING');

  const swapCaption =
    reducedMotion && moving && step > 0
      ? t('CUPS.SWAP_CAPTION', {
          first: positionName(round.swaps[step - 1][0]),
          second: positionName(round.swaps[step - 1][1]),
        })
      : null;

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-6 text-center">
      <h2
        className="text-3xl font-extrabold leading-tight sm:text-5xl"
        role={answered ? 'status' : undefined}
      >
        {headline}
      </h2>
      <div
        role="img"
        aria-label={t('CUPS.REGION_LABEL')}
        className="relative h-48 w-full sm:h-72"
        style={{ '--wg-swap-ms': `${CUP_TIMING.SWAP_MS}ms` } as CSSProperties}
      >
        {Array.from({ length: CUP_COUNT }, (_, cup) => {
          const isBallCup = cup === round.ballCup;
          const lifted = isBallCup && (ballShown || answered);
          const dimmed = answered && !isBallCup;
          const hop =
            moving && movingCups.includes(cup)
              ? movingCups.indexOf(cup) === 0
                ? 'wg-hop-up'
                : 'wg-hop-down'
              : '';
          return (
            <div
              key={cup}
              className="absolute left-0 top-0 h-full px-2 transition-transform ease-in-out sm:px-4"
              style={{
                width: `${SLOT_WIDTH_PERCENT}%`,
                transform: `translateX(${layout[cup] * 100}%)`,
                transitionDuration: `${CUP_TIMING.SWAP_MS}ms`,
              }}
            >
              <div
                key={hop ? step : 'idle'}
                className={`relative flex h-full flex-col items-center justify-end transition-opacity duration-500 ${hop} ${dimmed ? 'opacity-40' : ''}`}
              >
                <div
                  aria-hidden="true"
                  className={`absolute bottom-1 h-10 w-10 rounded-full bg-gradient-to-br from-yellow-200 to-red-500 shadow-lg transition-opacity duration-300 sm:h-16 sm:w-16 ${lifted ? 'opacity-100' : 'opacity-0'}`}
                />
                <div
                  aria-hidden="true"
                  className={`relative flex h-32 w-full items-center justify-center bg-gradient-to-b from-rose-400 to-orange-500 text-4xl font-black text-white shadow-xl transition-transform duration-500 ease-out sm:h-52 sm:text-6xl ${lifted ? '-translate-y-[70%]' : ''}`}
                  style={{ clipPath: CUP_CLIP_PATH }}
                >
                  <span
                    className={
                      phase === PHASE.THINKING && !reducedMotion ? 'wg-bob' : ''
                    }
                  >
                    {phase === PHASE.THINKING ? '?' : ''}
                  </span>
                  <span className="absolute inset-x-0 top-5 h-3 bg-white/30 sm:h-5" />
                </div>
              </div>
            </div>
          );
        })}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-3 rounded-full bg-black/10 dark:bg-white/10"
        />
      </div>
      <div className="grid w-full grid-cols-3 text-lg font-bold uppercase tracking-wide opacity-80 sm:text-2xl">
        {SLOT_NAME.map(slot => (
          <span key={slot}>
            {phase === PHASE.THINKING || answered
              ? t(`CUPS.POSITION.${slot}`)
              : ''}
          </span>
        ))}
      </div>
      <p className="min-h-8 text-xl font-semibold sm:text-2xl" aria-live="off">
        {swapCaption ?? (phase === PHASE.THINKING ? t('CUPS.GUESS_HINT') : '')}
      </p>
    </div>
  );
};
