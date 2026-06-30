import { getDb } from '../../../lib/mongo';

const COLLECTION = 'll_data';

export type WordRow = {
  id: string;
  session_id: string;
  word: string;
  type: string;
  definition: string;
  pinyin: string | null;
  mastered: boolean;
  mastered_at: string | null;
};

export type SessionRow = {
  id: string;
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

interface LLDoc {
  userEmail: string;
  sessions: (SessionRow & { words: WordRow[] })[];
  masteredWords: MasteredWordRow[];
  updatedAt: string;
}

const getCollection = async () => (await getDb()).collection<LLDoc>(COLLECTION);

const getDoc = async (userEmail: string): Promise<LLDoc> => {
  const collection = await getCollection();
  const doc = await collection.findOne({ userEmail });
  return (
    doc ?? {
      userEmail,
      sessions: [],
      masteredWords: [],
      updatedAt: new Date().toISOString(),
    }
  );
};

export const getMasteredWords = async (
  userEmail: string,
): Promise<string[]> => {
  const doc = await getDoc(userEmail);
  const fromSessions = doc.sessions.flatMap(s =>
    s.words.filter(w => w.mastered).map(w => w.word),
  );
  const standalone = doc.masteredWords.map(w => w.word);
  return [...fromSessions, ...standalone];
};

export const markWordAsMastered = async (
  userEmail: string,
  wordId: string,
): Promise<void> => {
  const collection = await getCollection();
  const masteredAt = new Date().toISOString();
  await collection.updateOne(
    { userEmail, 'sessions.words.id': wordId },
    {
      $set: {
        'sessions.$[].words.$[word].mastered': true,
        'sessions.$[].words.$[word].mastered_at': masteredAt,
        updatedAt: masteredAt,
      },
    },
    { arrayFilters: [{ 'word.id': wordId }] },
  );
};

export const addMasteredWord = async (
  userEmail: string,
  word: string,
  language: string,
  definition: string,
  pinyin?: string,
): Promise<void> => {
  const collection = await getCollection();
  const createdAt = new Date().toISOString();
  await collection.updateOne(
    { userEmail },
    {
      $addToSet: {
        masteredWords: {
          word,
          language,
          definition,
          pinyin: pinyin ?? null,
          created_at: createdAt,
        },
      },
      $set: { updatedAt: createdAt },
    },
    { upsert: true },
  );
};

export const unmarkWordAsMastered = async (
  userEmail: string,
  wordId: string,
): Promise<void> => {
  const collection = await getCollection();
  await collection.updateOne(
    { userEmail, 'sessions.words.id': wordId },
    {
      $set: {
        'sessions.$[].words.$[word].mastered': false,
        'sessions.$[].words.$[word].mastered_at': null,
        updatedAt: new Date().toISOString(),
      },
    },
    { arrayFilters: [{ 'word.id': wordId }] },
  );
};

export const removeMasteredWord = async (
  userEmail: string,
  word: string,
): Promise<void> => {
  const collection = await getCollection();
  await collection.updateOne(
    { userEmail },
    {
      $pull: { masteredWords: { word } },
      $set: { updatedAt: new Date().toISOString() },
    },
  );
};

export const getStandaloneMasteredWords = async (
  userEmail: string,
): Promise<MasteredWordRow[]> => {
  const doc = await getDoc(userEmail);
  return doc.masteredWords;
};

export const saveSession = async (
  userEmail: string,
  language: string,
  category: string,
  words: { word: string; type: string; definition: string; pinyin?: string }[],
  exampleTarget: string,
  exampleEnglish: string,
  examplePinyin?: string,
): Promise<SessionWithWords> => {
  const collection = await getCollection();
  const createdAt = new Date().toISOString();
  const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const sessionWords: WordRow[] = words.map((w, i) => ({
    id: `${sessionId}-${i}`,
    session_id: sessionId,
    word: w.word,
    type: w.type,
    definition: w.definition,
    pinyin: w.pinyin ?? null,
    mastered: false,
    mastered_at: null,
  }));

  const session: SessionRow & { words: WordRow[] } = {
    id: sessionId,
    language,
    category,
    example_target: exampleTarget,
    example_english: exampleEnglish,
    example_pinyin: examplePinyin ?? null,
    created_at: createdAt,
    words: sessionWords,
  };

  await collection.updateOne(
    { userEmail },
    {
      $push: { sessions: session },
      $set: { updatedAt: createdAt },
      $setOnInsert: { masteredWords: [] },
    } as Parameters<typeof collection.updateOne>[1],
    { upsert: true },
  );

  return session;
};

export const resetUserData = async (userEmail: string): Promise<void> => {
  const collection = await getCollection();
  await collection.deleteOne({ userEmail });
};

export const getAllSessions = async (
  userEmail: string,
): Promise<SessionWithWords[]> => {
  const doc = await getDoc(userEmail);
  return [...doc.sessions].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
};
