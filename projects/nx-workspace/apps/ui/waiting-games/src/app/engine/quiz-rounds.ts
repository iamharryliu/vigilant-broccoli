import {
  GAME_TYPE,
  MULTIPLE_CHOICE_PROMPT_MS,
  TRUE_FALSE_PROMPT_MS,
} from '../consts/game.consts';
import { MultipleChoiceQuestion } from '../data/multiple-choice.bank';
import { TrueFalseStatement } from '../data/true-false.bank';
import { Rng, clamp, shuffle } from './random';
import { MultipleChoiceRound, TrueFalseRound } from './types';

const countWords = (...texts: string[]) =>
  texts.join(' ').split(/\s+/).filter(Boolean).length;

export const buildMultipleChoiceRound = (
  id: number,
  entry: MultipleChoiceQuestion,
  rng: Rng,
): MultipleChoiceRound => {
  const options = shuffle([entry.answer, ...entry.distractors], rng);
  const words = countWords(entry.question, ...options);
  return {
    id,
    type: GAME_TYPE.MULTIPLE_CHOICE,
    promptMs: clamp(
      MULTIPLE_CHOICE_PROMPT_MS.BASE +
        words * MULTIPLE_CHOICE_PROMPT_MS.PER_WORD,
      MULTIPLE_CHOICE_PROMPT_MS.MIN,
      MULTIPLE_CHOICE_PROMPT_MS.MAX,
    ),
    question: entry.question,
    options,
    correctIndex: options.indexOf(entry.answer),
    explanation: entry.explanation,
  };
};

export const buildTrueFalseRound = (
  id: number,
  entry: TrueFalseStatement,
): TrueFalseRound => ({
  id,
  type: GAME_TYPE.TRUE_FALSE,
  promptMs: clamp(
    TRUE_FALSE_PROMPT_MS.BASE +
      countWords(entry.statement) * TRUE_FALSE_PROMPT_MS.PER_WORD,
    TRUE_FALSE_PROMPT_MS.MIN,
    TRUE_FALSE_PROMPT_MS.MAX,
  ),
  statement: entry.statement,
  isTrue: entry.isTrue,
  explanation: entry.explanation,
});
