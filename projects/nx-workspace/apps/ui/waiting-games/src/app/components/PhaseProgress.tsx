import {
  PHASE_ORDER,
  PHASE,
  Phase,
  MS_PER_SECOND,
} from '../consts/game.consts';
import { PHASE_COLOR } from '../consts/theme.consts';
import { Settings } from '../consts/settings.consts';
import { PlayerState } from '../engine/player';
import { useTranslation } from '../i18n';

const PERCENT = 100;

const getPlannedDurationMs = (
  phase: Phase,
  state: PlayerState,
  settings: Settings,
) => {
  if (phase === state.phase) return state.phaseDurationMs;
  switch (phase) {
    case PHASE.PROMPT:
      return state.round.promptMs;
    case PHASE.THINKING:
      return settings.thinkingSeconds * MS_PER_SECOND;
    case PHASE.REVEAL:
      return settings.revealSeconds * MS_PER_SECOND;
    default:
      return settings.breakSeconds * MS_PER_SECOND;
  }
};

export const PhaseProgress = ({
  state,
  settings,
}: {
  state: PlayerState;
  settings: Settings;
}) => {
  const { t } = useTranslation();
  const currentIndex = PHASE_ORDER.indexOf(state.phase);
  const secondsLeft = Math.max(
    1,
    Math.ceil((state.phaseDurationMs - state.elapsedMs) / MS_PER_SECOND),
  );

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-5 pt-3 sm:px-8 sm:pb-8">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-2xl font-extrabold uppercase tracking-wide sm:text-3xl">
          {t(`PHASE.${state.phase.toUpperCase() as Uppercase<Phase>}`)}
        </span>
        <span
          className="text-3xl font-black tabular-nums sm:text-4xl"
          aria-label={t('STATUS.SECONDS_LEFT', { seconds: secondsLeft })}
        >
          {secondsLeft}
        </span>
      </div>
      <div className="flex h-4 w-full gap-1.5 sm:h-5" aria-hidden="true">
        {PHASE_ORDER.map((phase, index) => {
          const fill =
            index < currentIndex
              ? PERCENT
              : index === currentIndex
                ? (state.elapsedMs / state.phaseDurationMs) * PERCENT
                : 0;
          return (
            <div
              key={phase}
              className="overflow-hidden rounded-full bg-black/10 dark:bg-white/15"
              style={{
                flexGrow: getPlannedDurationMs(phase, state, settings),
                flexBasis: 0,
              }}
            >
              <div
                className={`h-full rounded-full ${PHASE_COLOR[phase].bar}`}
                style={{ width: `${Math.min(PERCENT, fill)}%` }}
              />
            </div>
          );
        })}
      </div>
      <ol
        className="mt-2 grid grid-cols-4 text-center text-sm font-bold sm:text-base"
        aria-hidden="true"
      >
        {PHASE_ORDER.map((phase, index) => (
          <li
            key={phase}
            className={`flex items-center justify-center gap-1.5 ${index === currentIndex ? 'opacity-100' : 'opacity-60'}`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${PHASE_COLOR[phase].dot}`}
            />
            {t(`PHASE.${phase.toUpperCase() as Uppercase<Phase>}`)}
          </li>
        ))}
      </ol>
    </div>
  );
};
