import { PHASE } from '../../consts/game.consts';
import { TrueFalseRound } from '../../engine/types';
import { useTranslation } from '../../i18n';
import { GameViewProps } from './game.types';

export const TrueFalseGame = ({
  round,
  phase,
}: GameViewProps<TrueFalseRound>) => {
  const { t } = useTranslation();
  const answered = phase === PHASE.REVEAL || phase === PHASE.BREAK;

  const choices = [
    { isTrue: true, label: t('TRUE_FALSE.TRUE'), tone: 'emerald' },
    { isTrue: false, label: t('TRUE_FALSE.FALSE'), tone: 'rose' },
  ] as const;

  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-6 text-center sm:gap-8">
      <h2 className="wg-rise rounded-3xl bg-white/80 px-5 py-6 text-3xl font-extrabold leading-tight shadow-lg sm:px-10 sm:py-10 sm:text-5xl dark:bg-slate-800/80">
        {round.statement}
      </h2>
      <div className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:gap-5">
        {choices.map(({ isTrue, label, tone }) => {
          const correct = isTrue === round.isTrue;
          const state = !answered
            ? tone === 'emerald'
              ? 'border-emerald-500 text-emerald-800 dark:border-emerald-400 dark:text-emerald-200'
              : 'border-rose-500 text-rose-800 dark:border-rose-400 dark:text-rose-200'
            : correct
              ? tone === 'emerald'
                ? 'scale-105 border-emerald-600 bg-emerald-600 text-white shadow-xl shadow-emerald-500/40'
                : 'scale-105 border-rose-600 bg-rose-600 text-white shadow-xl shadow-rose-500/40'
              : 'border-transparent opacity-30';
          return (
            <div
              key={label}
              className={`rounded-2xl border-4 bg-white/70 py-5 text-3xl font-black uppercase tracking-wide transition-all duration-500 sm:py-8 sm:text-5xl dark:bg-slate-800/70 ${state}`}
            >
              {answered && correct ? '✓ ' : ''}
              {label}
            </div>
          );
        })}
      </div>
      <div className="min-h-20 sm:min-h-24" role="status">
        {answered && (
          <p className="wg-rise max-w-3xl text-xl font-semibold leading-snug sm:text-3xl">
            <span className="font-extrabold">
              {round.isTrue
                ? t('TRUE_FALSE.REVEAL_TRUE')
                : t('TRUE_FALSE.REVEAL_FALSE')}
            </span>{' '}
            {round.explanation}
          </p>
        )}
        {phase === PHASE.THINKING && (
          <p className="wg-bob text-2xl font-bold opacity-80 sm:text-3xl">
            {t('TRUE_FALSE.THINK')}
          </p>
        )}
      </div>
    </div>
  );
};
