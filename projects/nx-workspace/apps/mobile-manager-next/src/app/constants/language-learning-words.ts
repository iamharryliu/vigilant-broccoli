export const LANGUAGE = {
  ENGLISH: 'English',
  SWEDISH: 'Swedish',
  FRENCH: 'French',
  SPANISH: 'Spanish',
  CHINESE: 'Chinese',
} as const;

export type Language = (typeof LANGUAGE)[keyof typeof LANGUAGE];

export const LANGUAGE_META: Record<Language, { flag: string; code: string }> = {
  [LANGUAGE.ENGLISH]: { flag: '🇬🇧', code: 'en' },
  [LANGUAGE.SWEDISH]: { flag: '🇸🇪', code: 'sv' },
  [LANGUAGE.FRENCH]: { flag: '🇫🇷', code: 'fr' },
  [LANGUAGE.SPANISH]: { flag: '🇪🇸', code: 'es' },
  [LANGUAGE.CHINESE]: { flag: '🇨🇳', code: 'zh' },
};

export const LANGUAGE_ORDER: Language[] = [
  LANGUAGE.ENGLISH,
  LANGUAGE.SWEDISH,
  LANGUAGE.FRENCH,
  LANGUAGE.SPANISH,
  LANGUAGE.CHINESE,
];

export type Translation = {
  word: string;
  synonyms: string[];
  // Empty for every language except Chinese.
  pinyin: string;
};

export type WordEntry = Record<Language, Translation>;

export const WORD_TYPE = {
  NOUN: 'noun',
  ADJECTIVE: 'adjective',
  VERB: 'verb',
  PHRASE: 'phrase',
} as const;

export type WordType = (typeof WORD_TYPE)[keyof typeof WORD_TYPE];

export const WORD_TYPE_ORDER: WordType[] = [
  WORD_TYPE.NOUN,
  WORD_TYPE.ADJECTIVE,
  WORD_TYPE.VERB,
  WORD_TYPE.PHRASE,
];

export type WordResult = {
  entry: WordEntry;
  type: WordType;
  // English antonym; empty when the word has none.
  antonym: string;
};

export type SentenceResult = {
  sentence: string;
  english: string;
  // Empty for every language except Chinese.
  pinyin: string;
};
