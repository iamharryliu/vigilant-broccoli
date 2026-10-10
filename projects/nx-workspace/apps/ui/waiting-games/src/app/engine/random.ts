export type Rng = () => number;

export const randomInt = (rng: Rng, min: number, max: number) =>
  min + Math.floor(rng() * (max - min + 1));

export const pickOne = <T>(items: readonly T[], rng: Rng): T =>
  items[Math.floor(rng() * items.length)];

export const shuffle = <T>(items: readonly T[], rng: Rng): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * Draws every item once per refill in random order. A refill never starts with
 * the item that ended the previous one, so no item repeats back to back.
 */
export const createShuffleBag = <T>(items: readonly T[], rng: Rng) => {
  let queue: T[] = [];
  let last: T | undefined;
  return (): T => {
    if (!queue.length) {
      queue = shuffle(items, rng);
      const top = queue.length - 1;
      if (items.length > 1 && queue[top] === last) {
        [queue[0], queue[top]] = [queue[top], queue[0]];
      }
    }
    last = queue.pop() as T;
    return last;
  };
};
