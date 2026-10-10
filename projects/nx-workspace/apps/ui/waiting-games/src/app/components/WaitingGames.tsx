import { useCallback, useEffect, useRef, useState } from 'react';
import { GAME_TYPE } from '../consts/game.consts';
import { GAME_ACCENT } from '../consts/theme.consts';
import { Round } from '../engine/types';
import { PlayerState } from '../engine/player';
import { useReducedMotion } from '../hooks/useMediaQuery';
import { usePageVisible } from '../hooks/usePageVisible';
import { useSettings } from '../hooks/useSettings';
import { useWaitingGame } from '../hooks/useWaitingGame';
import { useTranslation } from '../i18n';
import { usePageTitle } from '../use-page-title';
import { CupAndBallGame } from './games/CupAndBallGame';
import { EstimationGame } from './games/EstimationGame';
import { MultipleChoiceGame } from './games/MultipleChoiceGame';
import { TrueFalseGame } from './games/TrueFalseGame';
import { GameControls } from './GameControls';
import { PhaseProgress } from './PhaseProgress';

const AWAKE_TIMEOUT_MS = 4000;
const TOUCH_POINTERS = ['touch', 'pen'];

const GAME_LABEL_KEY = {
  [GAME_TYPE.CUP_AND_BALL]: 'GAME.CUP_AND_BALL',
  [GAME_TYPE.MULTIPLE_CHOICE]: 'GAME.MULTIPLE_CHOICE',
  [GAME_TYPE.TRUE_FALSE]: 'GAME.TRUE_FALSE',
  [GAME_TYPE.ESTIMATION]: 'GAME.ESTIMATION',
} as const;

const renderGame = (
  state: PlayerState,
  reducedMotion: boolean,
  round: Round,
) => {
  const view = {
    phase: state.phase,
    elapsedMs: state.elapsedMs,
    phaseDurationMs: state.phaseDurationMs,
    reducedMotion,
  };
  switch (round.type) {
    case GAME_TYPE.CUP_AND_BALL:
      return <CupAndBallGame key={round.id} round={round} {...view} />;
    case GAME_TYPE.MULTIPLE_CHOICE:
      return <MultipleChoiceGame key={round.id} round={round} {...view} />;
    case GAME_TYPE.TRUE_FALSE:
      return <TrueFalseGame key={round.id} round={round} {...view} />;
    default:
      return <EstimationGame key={round.id} round={round} {...view} />;
  }
};

export const WaitingGames = () => {
  const { t } = useTranslation();
  usePageTitle(t('APP.PAGE_GAMES'));

  const { settings, updateSetting, resetSettings } = useSettings();
  const [paused, setPaused] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [awake, setAwake] = useState(false);
  const awakeTimer = useRef<number | undefined>(undefined);
  const pageVisible = usePageVisible();
  const reducedMotion = useReducedMotion();

  const running = !paused && !settingsOpen && pageVisible;
  const { state, skip } = useWaitingGame(settings, running);
  const { round } = state;
  const accent = GAME_ACCENT[round.type];

  useEffect(() => () => window.clearTimeout(awakeTimer.current), []);

  const wakeControls = useCallback((pointerType: string) => {
    if (!TOUCH_POINTERS.includes(pointerType)) return;
    setAwake(true);
    window.clearTimeout(awakeTimer.current);
    awakeTimer.current = window.setTimeout(
      () => setAwake(false),
      AWAKE_TIMEOUT_MS,
    );
  }, []);

  const gameLabel = t(GAME_LABEL_KEY[round.type]);

  return (
    <main
      className={`group relative flex min-h-dvh flex-col bg-gradient-to-br text-slate-900 transition-colors duration-700 dark:text-white ${accent.stage}`}
      onPointerDown={event => wakeControls(event.pointerType)}
    >
      <GameControls
        paused={paused}
        awake={awake}
        settings={settings}
        onTogglePause={() => setPaused(value => !value)}
        onSkip={skip}
        onSettingChange={updateSetting}
        onSettingsReset={resetSettings}
        onSettingsOpenChange={setSettingsOpen}
      />
      <header className="flex items-center gap-3 px-4 pt-4 sm:px-8 sm:pt-6">
        <span
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-lg font-extrabold shadow-md sm:text-2xl ${accent.chip}`}
        >
          <span aria-hidden="true">{accent.glyph}</span>
          {gameLabel}
        </span>
        <span className="text-base font-semibold opacity-70 sm:text-xl">
          {t('STATUS.ROUND', { round: round.id })}
        </span>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 py-4 sm:px-8">
        {renderGame(state, reducedMotion, round)}
      </div>
      <PhaseProgress state={state} settings={settings} />
      <p className="sr-only" role="status">
        {t('STATUS.PHASE_ANNOUNCEMENT', {
          game: gameLabel,
          phase: t(
            `PHASE.${state.phase.toUpperCase() as Uppercase<typeof state.phase>}`,
          ),
        })}
      </p>
    </main>
  );
};
