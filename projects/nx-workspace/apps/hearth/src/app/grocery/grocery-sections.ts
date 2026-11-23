import {
  GROCERY_SECTION,
  GROCERY_SECTIONS,
  GROCERY_SECTION_KEYWORDS,
  type GrocerySection,
} from './grocery-sections.consts';

type KeywordEntry = { keyword: string; section: GrocerySection };

const KEYWORD_ENTRIES: KeywordEntry[] = (
  Object.entries(GROCERY_SECTION_KEYWORDS) as [GrocerySection, string[]][]
).flatMap(([section, keywords]) =>
  keywords.map(keyword => ({ keyword, section })),
);
const PHRASE_ENTRIES = KEYWORD_ENTRIES.filter(({ keyword }) =>
  keyword.includes(' '),
);
const WORD_ENTRIES = KEYWORD_ENTRIES.filter(
  ({ keyword }) => !keyword.includes(' '),
);

const TOKEN_SPLIT = /[^a-z]+/;
const PLURAL_SUFFIXES = ['s', 'es'];

const matchesWord = (token: string, keyword: string) =>
  token === keyword ||
  PLURAL_SUFFIXES.some(suffix => token === `${keyword}${suffix}`);

export const getGrocerySection = (name: string): GrocerySection => {
  const text = name.toLowerCase();
  const phrase = PHRASE_ENTRIES.find(({ keyword }) => text.includes(keyword));
  if (phrase) return phrase.section;
  const tokens = text.split(TOKEN_SPLIT).filter(Boolean);
  const word = WORD_ENTRIES.find(({ keyword }) =>
    tokens.some(token => matchesWord(token, keyword)),
  );
  return word?.section ?? GROCERY_SECTION.OTHER;
};

export const compareGrocerySections = (a: GrocerySection, b: GrocerySection) =>
  GROCERY_SECTIONS.indexOf(a) - GROCERY_SECTIONS.indexOf(b);
