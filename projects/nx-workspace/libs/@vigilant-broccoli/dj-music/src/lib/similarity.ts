/**
 * Similarity primitives. Every function here compares the strings exactly as
 * given — callers pass output of `normalizeForMatch`, so normalisation happens
 * once per comparison set rather than once per pair.
 */

const bigrams = (value: string): string[] => {
  const pairs: string[] = [];
  for (let index = 0; index < value.length - 1; index += 1) {
    pairs.push(value.slice(index, index + 2));
  }
  return pairs;
};

/** Sørensen–Dice over character bigrams: robust to word order and typos. */
export const diceCoefficient = (left: string, right: string): number => {
  if (left === right) {
    return left ? 1 : 0;
  }
  if (left.length < 2 || right.length < 2) {
    return 0;
  }

  const leftPairs = bigrams(left);
  const rightCounts = new Map<string, number>();
  for (const pair of bigrams(right)) {
    rightCounts.set(pair, (rightCounts.get(pair) ?? 0) + 1);
  }

  let intersection = 0;
  for (const pair of leftPairs) {
    const available = rightCounts.get(pair) ?? 0;
    if (available > 0) {
      rightCounts.set(pair, available - 1);
      intersection += 1;
    }
  }

  return (2 * intersection) / (leftPairs.length + bigrams(right).length);
};

/**
 * Overlap of whole words, scaled by the longer side. Complements Dice by
 * staying high when one string is the other plus extra words — the usual shape
 * of an upload title that appends a version marker or a channel name.
 */
export const tokenSetRatio = (left: string, right: string): number => {
  const leftTokens = new Set(left.split(' ').filter(Boolean));
  const rightTokens = new Set(right.split(' ').filter(Boolean));
  if (!leftTokens.size || !rightTokens.size) {
    return 0;
  }

  let shared = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      shared += 1;
    }
  }

  return shared / Math.max(leftTokens.size, rightTokens.size);
};

/** Best of the two measures — they fail on different inputs. */
export const stringSimilarity = (left: string, right: string): number =>
  Math.max(diceCoefficient(left, right), tokenSetRatio(left, right));

/** 1 when every word of `needle` appears in `haystack`, else 0. */
export const containsAllTokens = (
  haystack: string,
  needle: string,
): boolean => {
  const haystackTokens = new Set(haystack.split(' ').filter(Boolean));
  const needleTokens = needle.split(' ').filter(Boolean);
  return (
    needleTokens.length > 0 &&
    needleTokens.every(token => haystackTokens.has(token))
  );
};
