import { GAME_TYPE, GameType } from '../consts/game.consts';
import { MULTIPLE_CHOICE_BANK } from '../data/multiple-choice.bank';
import { TRUE_FALSE_BANK } from '../data/true-false.bank';
import { buildCupRound } from './cup-round';
import { buildEstimationRound } from './estimation-round';
import { Rng, createShuffleBag } from './random';
import { buildMultipleChoiceRound, buildTrueFalseRound } from './quiz-rounds';
import { Round } from './types';

const GAME_TYPES: readonly GameType[] = Object.values(GAME_TYPE);

export const createRoundGenerator = (rng: Rng = Math.random) => {
  const nextType = createShuffleBag(GAME_TYPES, rng);
  const nextQuestion = createShuffleBag(MULTIPLE_CHOICE_BANK, rng);
  const nextStatement = createShuffleBag(TRUE_FALSE_BANK, rng);
  let roundId = 0;

  return (): Round => {
    const id = ++roundId;
    switch (nextType()) {
      case GAME_TYPE.CUP_AND_BALL:
        return buildCupRound(id, rng);
      case GAME_TYPE.MULTIPLE_CHOICE:
        return buildMultipleChoiceRound(id, nextQuestion(), rng);
      case GAME_TYPE.TRUE_FALSE:
        return buildTrueFalseRound(id, nextStatement());
      default:
        return buildEstimationRound(id, rng);
    }
  };
};
