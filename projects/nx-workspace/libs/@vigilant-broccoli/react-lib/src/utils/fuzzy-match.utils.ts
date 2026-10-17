export type FuzzyMatchResult = {
  matched: boolean;
  score: number;
};

export const fuzzyMatch = (query: string, target: string): FuzzyMatchResult => {
  const queryLower = query.toLowerCase();
  const targetLower = target.toLowerCase();

  let queryIndex = 0;
  let score = 0;
  let previousMatchIndex = -1;

  for (
    let i = 0;
    i < targetLower.length && queryIndex < queryLower.length;
    i++
  ) {
    if (targetLower[i] === queryLower[queryIndex]) {
      const gap = previousMatchIndex === -1 ? i : i - previousMatchIndex - 1;
      const gapPenalty = gap * 0.1;
      const positionBonus = Math.max(0, 10 - i);
      score += 10 - gapPenalty + positionBonus;
      previousMatchIndex = i;
      queryIndex++;
    }
  }

  const matched = queryIndex === queryLower.length;

  if (matched) {
    if (targetLower.startsWith(queryLower)) {
      score += 50;
    } else if (targetLower.includes(' ' + queryLower)) {
      score += 30;
    }
  }

  return { matched, score };
};
