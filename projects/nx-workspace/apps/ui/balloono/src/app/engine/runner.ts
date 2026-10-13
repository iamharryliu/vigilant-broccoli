import { BotMemory, decideCpuInput } from './cpu';
import { DIFFICULTIES, MAX_PLAYERS } from './game.consts';
import { Contender, Difficulty, MatchState, PlayerInput } from './game.types';
import { advanceMatch } from './match';

const CPU_ID_PREFIX = 'cpu-';

export const cpuContenders = (
  difficulties: Difficulty[],
  nameFor: (difficulty: Difficulty, index: number) => string,
): Contender[] =>
  difficulties.map((difficulty, index) => ({
    id: `${CPU_ID_PREFIX}${index}`,
    name: nameFor(difficulty, index),
    difficulty,
  }));

export const fillSeats = (humans: Contender[], cpus: Contender[]) =>
  [...humans, ...cpus].slice(0, MAX_PLAYERS);

export const isDifficulty = (value: unknown): value is Difficulty =>
  DIFFICULTIES.includes(value as Difficulty);

export const runTick = (
  state: MatchState,
  humanInputs: Record<string, PlayerInput>,
  botMemory: BotMemory,
): MatchState => {
  const inputs = { ...humanInputs };
  state.players
    .filter(player => player.difficulty)
    .forEach(player => {
      inputs[player.id] = decideCpuInput(state, player, botMemory);
    });
  return advanceMatch(state, inputs);
};
