import Database from 'better-sqlite3';
import { homedir } from 'os';
import { mkdirSync } from 'fs';
import { join } from 'path';

const DB_DIR = join(homedir(), '.vb-manager');
const DB_PATH = join(DB_DIR, 'language-learning.db');

mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH);

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS ll_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    language TEXT NOT NULL,
    category TEXT NOT NULL,
    example_target TEXT NOT NULL,
    example_english TEXT NOT NULL,
    example_pinyin TEXT,
    created_at TEXT NOT NULL
  )
`,
).run();

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS ll_words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL REFERENCES ll_sessions(id),
    word TEXT NOT NULL,
    type TEXT NOT NULL,
    definition TEXT NOT NULL,
    pinyin TEXT,
    mastered INTEGER NOT NULL DEFAULT 0,
    mastered_at TEXT
  )
`,
).run();

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS ll_mastered_words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word TEXT NOT NULL,
    language TEXT NOT NULL,
    definition TEXT,
    pinyin TEXT,
    created_at TEXT NOT NULL,
    UNIQUE(word, language)
  )
`,
).run();

const wordColumns = (
  db.prepare(`PRAGMA table_info(ll_words)`).all() as { name: string }[]
).map(r => r.name);
if (!wordColumns.includes('mastered')) {
  db.prepare(
    `ALTER TABLE ll_words ADD COLUMN mastered INTEGER NOT NULL DEFAULT 0`,
  ).run();
}
if (!wordColumns.includes('mastered_at')) {
  db.prepare(`ALTER TABLE ll_words ADD COLUMN mastered_at TEXT`).run();
}
if (!wordColumns.includes('pinyin')) {
  db.prepare(`ALTER TABLE ll_words ADD COLUMN pinyin TEXT`).run();
}

const sessionColumns = (
  db.prepare(`PRAGMA table_info(ll_sessions)`).all() as { name: string }[]
).map(r => r.name);
if (!sessionColumns.includes('example_pinyin')) {
  db.prepare(`ALTER TABLE ll_sessions ADD COLUMN example_pinyin TEXT`).run();
}

const masteredColumns = (
  db.prepare(`PRAGMA table_info(ll_mastered_words)`).all() as { name: string }[]
).map(r => r.name);
if (!masteredColumns.includes('pinyin')) {
  db.prepare(`ALTER TABLE ll_mastered_words ADD COLUMN pinyin TEXT`).run();
}

export type WordRow = {
  id: number;
  session_id: number;
  word: string;
  type: string;
  definition: string;
  pinyin: string | null;
  mastered: number;
  mastered_at: string | null;
};

export type SessionRow = {
  id: number;
  language: string;
  category: string;
  example_target: string;
  example_english: string;
  example_pinyin: string | null;
  created_at: string;
};

export type MasteredWordRow = {
  word: string;
  language: string;
  definition: string | null;
  pinyin: string | null;
  created_at: string;
};

export type SessionWithWords = SessionRow & { words: WordRow[] };

export function getMasteredWords(): string[] {
  const fromSessions = (
    db.prepare('SELECT word FROM ll_words WHERE mastered = 1').all() as {
      word: string;
    }[]
  ).map(r => r.word);
  const standalone = (
    db.prepare('SELECT word FROM ll_mastered_words').all() as { word: string }[]
  ).map(r => r.word);
  return [...fromSessions, ...standalone];
}

export function markWordAsMastered(wordId: number): void {
  db.prepare(
    'UPDATE ll_words SET mastered = 1, mastered_at = ? WHERE id = ?',
  ).run(new Date().toISOString(), wordId);
}

export function addMasteredWord(
  word: string,
  language: string,
  definition: string,
  pinyin?: string,
): void {
  db.prepare(
    `
    INSERT OR IGNORE INTO ll_mastered_words (word, language, definition, pinyin, created_at)
    VALUES (?, ?, ?, ?, ?)
  `,
  ).run(word, language, definition, pinyin ?? null, new Date().toISOString());
}

export function getStandaloneMasteredWords(): MasteredWordRow[] {
  return db
    .prepare(
      'SELECT word, language, definition, pinyin, created_at FROM ll_mastered_words',
    )
    .all() as MasteredWordRow[];
}

export function saveSession(
  language: string,
  category: string,
  words: { word: string; type: string; definition: string; pinyin?: string }[],
  exampleTarget: string,
  exampleEnglish: string,
  examplePinyin?: string,
): SessionWithWords {
  const createdAt = new Date().toISOString();

  const { lastInsertRowid } = db
    .prepare(
      `
    INSERT INTO ll_sessions (language, category, example_target, example_english, example_pinyin, created_at)
    VALUES (@language, @category, @example_target, @example_english, @example_pinyin, @created_at)
  `,
    )
    .run({
      language,
      category,
      example_target: exampleTarget,
      example_english: exampleEnglish,
      example_pinyin: examplePinyin ?? null,
      created_at: createdAt,
    });

  const sessionId = lastInsertRowid as number;

  const insertWord = db.prepare(`
    INSERT INTO ll_words (session_id, word, type, definition, pinyin)
    VALUES (@session_id, @word, @type, @definition, @pinyin)
  `);

  for (const w of words) {
    insertWord.run({
      session_id: sessionId,
      word: w.word,
      type: w.type,
      definition: w.definition,
      pinyin: w.pinyin ?? null,
    });
  }

  return getSession(sessionId)!;
}

function getSession(id: number): SessionWithWords | null {
  const session = db
    .prepare('SELECT * FROM ll_sessions WHERE id = ?')
    .get(id) as SessionRow | undefined;
  if (!session) return null;
  const words = db
    .prepare('SELECT * FROM ll_words WHERE session_id = ?')
    .all(id) as WordRow[];
  return { ...session, words };
}

export function getAllSessions(): SessionWithWords[] {
  const sessions = db
    .prepare('SELECT * FROM ll_sessions ORDER BY created_at DESC')
    .all() as SessionRow[];
  const allWords = db.prepare('SELECT * FROM ll_words').all() as WordRow[];
  const wordsBySession = allWords.reduce<Record<number, WordRow[]>>(
    (acc, w) => {
      (acc[w.session_id] ??= []).push(w);
      return acc;
    },
    {},
  );
  return sessions.map(s => ({ ...s, words: wordsBySession[s.id] ?? [] }));
}
