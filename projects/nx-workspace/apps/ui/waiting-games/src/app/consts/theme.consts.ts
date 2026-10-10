import { GAME_TYPE, GameType, PHASE, Phase } from './game.consts';

export const GAME_ACCENT: Record<
  GameType,
  { stage: string; chip: string; glyph: string }
> = {
  [GAME_TYPE.CUP_AND_BALL]: {
    stage:
      'from-amber-100 via-orange-50 to-rose-100 dark:from-slate-950 dark:via-amber-950 dark:to-slate-900',
    chip: 'bg-orange-500 text-white',
    glyph: '🥤',
  },
  [GAME_TYPE.MULTIPLE_CHOICE]: {
    stage:
      'from-sky-100 via-indigo-50 to-violet-100 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900',
    chip: 'bg-indigo-600 text-white',
    glyph: '🧠',
  },
  [GAME_TYPE.TRUE_FALSE]: {
    stage:
      'from-fuchsia-100 via-pink-50 to-amber-100 dark:from-slate-950 dark:via-fuchsia-950 dark:to-slate-900',
    chip: 'bg-fuchsia-600 text-white',
    glyph: '⚖️',
  },
  [GAME_TYPE.ESTIMATION]: {
    stage:
      'from-emerald-100 via-teal-50 to-cyan-100 dark:from-slate-950 dark:via-emerald-950 dark:to-slate-900',
    chip: 'bg-teal-600 text-white',
    glyph: '🔢',
  },
};

export const PHASE_COLOR: Record<Phase, { bar: string; dot: string }> = {
  [PHASE.PROMPT]: { bar: 'bg-sky-500', dot: 'bg-sky-500' },
  [PHASE.THINKING]: { bar: 'bg-amber-500', dot: 'bg-amber-500' },
  [PHASE.REVEAL]: { bar: 'bg-emerald-500', dot: 'bg-emerald-500' },
  [PHASE.BREAK]: { bar: 'bg-violet-500', dot: 'bg-violet-500' },
};
