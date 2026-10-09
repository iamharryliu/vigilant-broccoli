const QUANTITY_UNIT = {
  PLAIN: 'plain',
  CURRENCY: 'currency',
  PERCENT: 'percent',
  MULTIPLIER: 'multiplier',
  APPROXIMATE: 'approximate',
} as const;

type QuantityUnit = (typeof QUANTITY_UNIT)[keyof typeof QUANTITY_UNIT];

export interface Quantity {
  text: string;
  value: number;
  unit: QuantityUnit;
}

const MAGNITUDE: Record<string, number> = {
  k: 1e3,
  thousand: 1e3,
  m: 1e6,
  million: 1e6,
  b: 1e9,
  bn: 1e9,
  billion: 1e9,
};

const NUMBER_WORD: Record<string, number> = {
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  fifteen: 15,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  hundred: 100,
};

const MULTIPLIER_WORD: Record<string, number> = {
  twice: 2,
  doubled: 2,
  doubling: 2,
  tripled: 3,
  tripling: 3,
  quadrupled: 4,
};

const HALVED_WORD = 'halved';
const HALVED_PERCENT = 50;

/** The smallest amount each vague magnitude claims ("dozens" is at least two dozen). */
const APPROXIMATE_WORD: Record<string, number> = {
  tens: 10,
  dozens: 24,
  hundreds: 100,
  thousands: 1e3,
  millions: 1e6,
  billions: 1e9,
};

const CURRENCY_SYMBOLS = '$€£';
const THOUSANDS_SEPARATOR_PATTERN = /,/g;
const RELATIVE_TOLERANCE = 1e-9;

/**
 * Digits, not glued to a word or version (`S3`, `EC2`, `HTTP/2`, `v1.2` and
 * `2FA` are names, not figures), with an optional currency, magnitude and
 * percent or multiplier.
 */
const DIGIT_QUANTITY_PATTERN = new RegExp(
  `(?<![A-Za-z0-9./_-])([${CURRENCY_SYMBOLS}])?(\\d{1,3}(?:,\\d{3})+|\\d+(?:\\.\\d+)?)(?:\\s?(k|m|bn|b|thousand|million|billion)\\b)?(?:\\s?(%|percent\\b)|(x|×)(?![A-Za-z0-9]))?(?![A-Za-z0-9])`,
  'gi',
);

/** Hyphenated compounds (`two-factor`, `one-page`) are names, not counts. */
const wordPattern = (words: string[], suffix = ''): RegExp =>
  new RegExp(`\\b(${words.join('|')})${suffix}\\b(?!-)`, 'gi');

const NUMBER_WORD_PATTERN = wordPattern(
  Object.keys(NUMBER_WORD),
  '(?:\\s(percent))?',
);
const MULTIPLIER_WORD_PATTERN = wordPattern([
  ...Object.keys(MULTIPLIER_WORD),
  HALVED_WORD,
]);
const APPROXIMATE_WORD_PATTERN = wordPattern(
  Object.keys(APPROXIMATE_WORD),
  '(?=\\sof\\b)',
);

const digitQuantity = ([
  text,
  currency,
  digits,
  magnitude,
  percent,
  multiplier,
]: RegExpMatchArray): Quantity => {
  const value =
    Number(digits.replace(THOUSANDS_SEPARATOR_PATTERN, '')) *
    (magnitude ? MAGNITUDE[magnitude.toLowerCase()] : 1);
  const unit = percent
    ? QUANTITY_UNIT.PERCENT
    : multiplier
      ? QUANTITY_UNIT.MULTIPLIER
      : currency
        ? QUANTITY_UNIT.CURRENCY
        : QUANTITY_UNIT.PLAIN;
  return { text: text.trim(), value, unit };
};

const wordQuantities = (text: string): Quantity[] => [
  ...Array.from(
    text.matchAll(NUMBER_WORD_PATTERN),
    ([match, word, percent]) => ({
      text: match,
      value: NUMBER_WORD[word.toLowerCase()],
      unit: percent ? QUANTITY_UNIT.PERCENT : QUANTITY_UNIT.PLAIN,
    }),
  ),
  ...Array.from(text.matchAll(MULTIPLIER_WORD_PATTERN), ([match, word]) =>
    word.toLowerCase() === HALVED_WORD
      ? { text: match, value: HALVED_PERCENT, unit: QUANTITY_UNIT.PERCENT }
      : {
          text: match,
          value: MULTIPLIER_WORD[word.toLowerCase()],
          unit: QUANTITY_UNIT.MULTIPLIER,
        },
  ),
  ...Array.from(text.matchAll(APPROXIMATE_WORD_PATTERN), ([match, word]) => ({
    text: match,
    value: APPROXIMATE_WORD[word.toLowerCase()],
    unit: QUANTITY_UNIT.APPROXIMATE,
  })),
];

export const extractQuantities = (text: string): Quantity[] => [
  ...Array.from(text.matchAll(DIGIT_QUANTITY_PATTERN), digitQuantity),
  ...wordQuantities(text),
];

const sameValue = (a: number, b: number): boolean =>
  Math.abs(a - b) <= RELATIVE_TOLERANCE * Math.max(Math.abs(a), Math.abs(b));

const COUNT_UNITS = new Set<QuantityUnit>([
  QUANTITY_UNIT.PLAIN,
  QUANTITY_UNIT.CURRENCY,
]);

const isCount = (unit: QuantityUnit): boolean => COUNT_UNITS.has(unit);

/**
 * A figure is grounded by the same value in a compatible unit, so rewording
 * (`90 percent` for `90%`, `1,000` for `1k`, `2x` for `doubled`) passes while a
 * new or inflated figure does not. A vague magnitude ("hundreds of") only needs
 * a source at least that large, since understating is harmless, but a vague
 * source never grounds a precise figure.
 */
export const isQuantityGrounded = (
  quantity: Quantity,
  sources: Quantity[],
): boolean =>
  sources.some(source =>
    quantity.unit === QUANTITY_UNIT.APPROXIMATE
      ? (source.unit === QUANTITY_UNIT.APPROXIMATE || isCount(source.unit)) &&
        source.value >= quantity.value
      : sameValue(quantity.value, source.value) &&
        (quantity.unit === source.unit ||
          (isCount(quantity.unit) && isCount(source.unit))),
  );
