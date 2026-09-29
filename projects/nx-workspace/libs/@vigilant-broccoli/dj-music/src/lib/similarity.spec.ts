import { describe, expect, it } from 'vitest';
import {
  containsAllTokens,
  diceCoefficient,
  stringSimilarity,
  tokenSetRatio,
} from './similarity';

describe('diceCoefficient', () => {
  it('scores identical strings as 1', () => {
    expect(diceCoefficient('neon harbour', 'neon harbour')).toBe(1);
  });

  it('scores strings with no shared bigrams as 0', () => {
    expect(diceCoefficient('abcd', 'wxyz')).toBe(0);
  });

  it('scores a near miss between 0 and 1', () => {
    const score = diceCoefficient('neon harbour', 'neon harbor');
    expect(score).toBeGreaterThan(0.8);
    expect(score).toBeLessThan(1);
  });

  it('returns 0 for empty input', () => {
    expect(diceCoefficient('', '')).toBe(0);
    expect(diceCoefficient('neon', '')).toBe(0);
  });

  it('is symmetric', () => {
    expect(diceCoefficient('neon harbour', 'harbour lights')).toBeCloseTo(
      diceCoefficient('harbour lights', 'neon harbour'),
    );
  });
});

describe('tokenSetRatio', () => {
  it('scores identical token sets as 1', () => {
    expect(tokenSetRatio('neon harbour', 'harbour neon')).toBe(1);
  });

  it('scales a subset by the longer side', () => {
    expect(tokenSetRatio('neon harbour', 'violet static neon harbour')).toBe(
      0.5,
    );
  });

  it('scores disjoint sets as 0', () => {
    expect(tokenSetRatio('neon harbour', 'violet static')).toBe(0);
  });

  it('returns 0 when either side is empty', () => {
    expect(tokenSetRatio('', 'neon')).toBe(0);
  });
});

describe('stringSimilarity', () => {
  it('takes the better of the two measures', () => {
    const left = 'neon harbour';
    const right = 'violet static neon harbour';
    expect(stringSimilarity(left, right)).toBe(
      Math.max(diceCoefficient(left, right), tokenSetRatio(left, right)),
    );
  });
});

describe('containsAllTokens', () => {
  it('is true when every needle word appears', () => {
    expect(
      containsAllTokens('violet static neon harbour', 'violet static'),
    ).toBe(true);
  });

  it('is false when a word is missing', () => {
    expect(containsAllTokens('violet neon harbour', 'violet static')).toBe(
      false,
    );
  });

  it('is false for an empty needle', () => {
    expect(containsAllTokens('violet static', '')).toBe(false);
  });
});
