import { CSSProperties } from 'react';
import { ESTIMATION, PHASE } from '../../consts/game.consts';
import { ESTIMATION_OBJECT } from '../../data/estimation.objects';
import { EstimationRound } from '../../engine/types';
import { useTranslation } from '../../i18n';
import { GameViewProps } from './game.types';

const DENSE_COUNT = 24;
const MEDIUM_COUNT = 16;
const PROMPT_POP_STAGGER_MS = 45;

const getObjectSizeClass = (total: number) =>
  total > DENSE_COUNT
    ? 'text-2xl sm:text-4xl'
    : total > MEDIUM_COUNT
      ? 'text-3xl sm:text-5xl'
      : 'text-4xl sm:text-6xl';

export const EstimationGame = ({
  round,
  phase,
  elapsedMs,
  phaseDurationMs,
}: GameViewProps<EstimationRound>) => {
  const { t } = useTranslation();
  const objectsName = t(`ESTIMATION.OBJECT.${round.target}`);
  const glyph = ESTIMATION_OBJECT[round.target].glyph;
  const showObjects = phase !== PHASE.THINKING;
  const answered = phase === PHASE.REVEAL || phase === PHASE.BREAK;

  const staggerMs = Math.min(
    ESTIMATION.COUNT_STAGGER_MAX_MS,
    (phaseDurationMs * ESTIMATION.COUNT_SHARE_OF_REVEAL) / round.answer,
  );
  const countedSoFar =
    phase === PHASE.REVEAL
      ? Math.min(round.answer, Math.floor(elapsedMs / staggerMs))
      : phase === PHASE.BREAK
        ? round.answer
        : 0;
  const countingDone = answered && countedSoFar >= round.answer;

  const headline =
    phase === PHASE.PROMPT
      ? t('ESTIMATION.PROMPT_TARGET', { objects: `${glyph} ${objectsName}` })
      : phase === PHASE.THINKING
        ? t('ESTIMATION.THINK', { objects: objectsName })
        : countingDone
          ? t('ESTIMATION.REVEAL', {
              count: round.answer,
              objects: objectsName,
            })
          : t('ESTIMATION.REVEAL_COUNTING');

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-5 text-center">
      <h2
        className="text-3xl font-extrabold leading-tight sm:text-5xl"
        role={countingDone ? 'status' : undefined}
      >
        {headline}
      </h2>
      <div
        role="img"
        aria-label={t('ESTIMATION.OBJECTS_LABEL', { objects: objectsName })}
        className="relative aspect-[4/3] w-full rounded-3xl bg-white/70 shadow-inner ring-4 ring-white/70 dark:bg-slate-800/70 dark:ring-slate-600"
      >
        {showObjects &&
          round.objects.map(object => {
            const isTarget = object.countIndex !== null;
            const counted =
              answered &&
              object.countIndex !== null &&
              object.countIndex <= countedSoFar;
            return (
              <span
                key={object.id}
                aria-hidden="true"
                className={`wg-pop absolute -translate-x-1/2 -translate-y-1/2 leading-none transition-opacity duration-500 ${getObjectSizeClass(round.objects.length)} ${answered && !isTarget ? 'opacity-25' : ''}`}
                style={
                  {
                    left: `${object.x}%`,
                    top: `${object.y}%`,
                    rotate: `${object.rotation}deg`,
                    animationDelay:
                      phase === PHASE.PROMPT
                        ? `${object.id * PROMPT_POP_STAGGER_MS}ms`
                        : '0ms',
                  } as CSSProperties
                }
              >
                {ESTIMATION_OBJECT[object.kind].glyph}
                {counted && (
                  <span
                    className="wg-pop absolute -bottom-2 -right-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-emerald-600 px-1 text-xs font-black text-white sm:h-8 sm:min-w-8 sm:text-base"
                    style={{ rotate: `${-object.rotation}deg` }}
                  >
                    {object.countIndex}
                  </span>
                )}
              </span>
            );
          })}
        {phase === PHASE.THINKING && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <span
              aria-hidden="true"
              className="wg-bob text-7xl font-black text-indigo-600 sm:text-9xl dark:text-indigo-300"
            >
              ?
            </span>
            <p className="text-xl font-semibold opacity-80 sm:text-3xl">
              {t('ESTIMATION.THINK_HINT')}
            </p>
          </div>
        )}
        {answered && (
          <div
            aria-hidden="true"
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-6 py-1 text-4xl font-black text-white shadow-xl sm:text-6xl"
          >
            {countedSoFar}
          </div>
        )}
      </div>
    </div>
  );
};
