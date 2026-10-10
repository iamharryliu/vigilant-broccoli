import { GAME_TYPE } from '../consts/game.consts';
import { EstimationObjectKind } from '../data/estimation.objects';

export type CupRound = {
  id: number;
  type: typeof GAME_TYPE.CUP_AND_BALL;
  promptMs: number;
  ballCup: number;
  swaps: readonly (readonly [number, number])[];
  /** `layouts[step][cup]` is the slot cup occupies after `step` swaps. */
  layouts: readonly (readonly number[])[];
  answerSlot: number;
};

export type MultipleChoiceRound = {
  id: number;
  type: typeof GAME_TYPE.MULTIPLE_CHOICE;
  promptMs: number;
  question: string;
  options: readonly string[];
  correctIndex: number;
  explanation: string;
};

export type TrueFalseRound = {
  id: number;
  type: typeof GAME_TYPE.TRUE_FALSE;
  promptMs: number;
  statement: string;
  isTrue: boolean;
  explanation: string;
};

export type EstimationObject = {
  id: number;
  kind: EstimationObjectKind;
  x: number;
  y: number;
  rotation: number;
  /** 1-based position in the reveal count, set only for target objects. */
  countIndex: number | null;
};

export type EstimationRound = {
  id: number;
  type: typeof GAME_TYPE.ESTIMATION;
  promptMs: number;
  target: EstimationObjectKind;
  objects: readonly EstimationObject[];
  answer: number;
};

export type Round =
  CupRound | MultipleChoiceRound | TrueFalseRound | EstimationRound;
