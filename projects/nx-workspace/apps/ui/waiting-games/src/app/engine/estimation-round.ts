import { ESTIMATION, GAME_TYPE } from '../consts/game.consts';
import {
  ESTIMATION_OBJECT_KINDS,
  EstimationObjectKind,
} from '../data/estimation.objects';
import { Rng, pickOne, randomInt, shuffle } from './random';
import { EstimationObject, EstimationRound } from './types';

type Point = { x: number; y: number };

const distance = (a: Point, b: Point) =>
  Math.hypot((a.x - b.x) * ESTIMATION.ASPECT, a.y - b.y);

const placePoints = (count: number, rng: Rng): Point[] => {
  const { MARGIN, ASPECT, PLACEMENT_ATTEMPTS, SPACING_FACTOR, SPACING_RELAX } =
    ESTIMATION;
  const span = 100 - MARGIN * 2;
  const area = span * ASPECT * span;
  let minDistance = SPACING_FACTOR * Math.sqrt(area / count);
  const points: Point[] = [];
  while (points.length < count) {
    const spacing = minDistance;
    let placed: Point | null = null;
    for (let attempt = 0; attempt < PLACEMENT_ATTEMPTS && !placed; attempt++) {
      const candidate = {
        x: MARGIN + rng() * span,
        y: MARGIN + rng() * span,
      };
      if (points.every(point => distance(point, candidate) >= spacing)) {
        placed = candidate;
      }
    }
    if (placed) points.push(placed);
    else minDistance *= SPACING_RELAX;
  }
  return points;
};

export const buildEstimationRound = (id: number, rng: Rng): EstimationRound => {
  const target = pickOne(ESTIMATION_OBJECT_KINDS, rng);
  const targetCount = randomInt(
    rng,
    ESTIMATION.TARGET_MIN,
    ESTIMATION.TARGET_MAX,
  );
  const distractor: EstimationObjectKind | null =
    rng() < ESTIMATION.DISTRACTOR_CHANCE
      ? pickOne(
          ESTIMATION_OBJECT_KINDS.filter(kind => kind !== target),
          rng,
        )
      : null;
  const distractorCount = distractor
    ? randomInt(rng, ESTIMATION.DISTRACTOR_MIN, ESTIMATION.DISTRACTOR_MAX)
    : 0;

  const kinds = shuffle(
    [
      ...Array<EstimationObjectKind>(targetCount).fill(target),
      ...Array<EstimationObjectKind>(distractorCount).fill(
        distractor ?? target,
      ),
    ],
    rng,
  );
  const points = placePoints(kinds.length, rng);

  let counted = 0;
  const objects: EstimationObject[] = kinds.map((kind, index) => ({
    id: index,
    kind,
    x: points[index].x,
    y: points[index].y,
    rotation: Math.round((rng() - 0.5) * 50),
    countIndex: kind === target ? ++counted : null,
  }));

  return {
    id,
    type: GAME_TYPE.ESTIMATION,
    promptMs: Math.min(
      ESTIMATION.PROMPT_MAX_MS,
      ESTIMATION.PROMPT_BASE_MS +
        objects.length * ESTIMATION.PROMPT_PER_OBJECT_MS,
    ),
    target,
    objects,
    answer: objects.filter(object => object.kind === target).length,
  };
};
