import { CSSProperties } from 'react';
import {
  MULTIPLE_CHOICE_OPTION_STAGGER_MS,
  OPTION_LETTERS,
  PHASE,
} from '../../consts/game.consts';
import { MultipleChoiceRound } from '../../engine/types';
import { useTranslation } from '../../i18n';
import { GameViewProps } from './game.types';

export const MultipleChoiceGame = ({
  round,
  phase,
}: GameViewProps<MultipleChoiceRound>) => {
  const { t } = useTranslation();
  const answered = phase === PHASE.REVEAL || phase === PHASE.BREAK;

  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-5 text-center sm:gap-8">
      <h2 className="wg-rise text-3xl font-extrabold leading-tight sm:text-5xl">
        {round.question}
      </h2>
      <ul className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {round.options.map((option, index) => {
          const correct = index === round.correctIndex;
          const state = !answered
            ? 'border-white/70 bg-white/80 dark:border-slate-600 dark:bg-slate-800/80'
            : correct
              ? 'scale-[1.03] border-emerald-500 bg-emerald-100 text-emerald-950 shadow-xl shadow-emerald-500/30 dark:border-emerald-400 dark:bg-emerald-900 dark:text-emerald-50'
              : 'border-transparent bg-white/50 opacity-40 dark:bg-slate-800/50';
          return (
            <li
              key={option}
              className={`wg-pop flex items-center gap-3 rounded-2xl border-4 px-4 py-3 text-left text-xl font-bold transition-all duration-500 sm:gap-4 sm:px-6 sm:py-5 sm:text-3xl ${state}`}
              style={
                {
                  animationDelay: `${(index + 1) * MULTIPLE_CHOICE_OPTION_STAGGER_MS}ms`,
                } as CSSProperties
              }
            >
              <span
                aria-hidden="true"
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg font-black sm:h-12 sm:w-12 sm:text-2xl ${answered && correct ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white dark:bg-indigo-400 dark:text-slate-950'}`}
              >
                {answered && correct ? '✓' : OPTION_LETTERS[index]}
              </span>
              <span>
                {option}
                {answered && correct && (
                  <span className="sr-only"> ({t('QUIZ.CORRECT_ANSWER')})</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="min-h-20 sm:min-h-24" role="status">
        {answered && (
          <p className="wg-rise max-w-3xl text-xl font-semibold leading-snug sm:text-3xl">
            <span className="font-extrabold text-emerald-700 dark:text-emerald-300">
              {round.options[round.correctIndex]}.
            </span>{' '}
            {round.explanation}
          </p>
        )}
        {phase === PHASE.THINKING && (
          <p className="wg-bob text-2xl font-bold opacity-80 sm:text-3xl">
            {t('QUIZ.THINK')}
          </p>
        )}
      </div>
    </div>
  );
};
