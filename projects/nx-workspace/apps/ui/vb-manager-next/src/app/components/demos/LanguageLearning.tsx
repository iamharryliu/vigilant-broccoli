'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Badge, Text } from '@radix-ui/themes';
import {
  AudioButton,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  Select,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@vigilant-broccoli/react-lib';
import { GraduationCap, Loader2, Settings } from 'lucide-react';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { HTTP_HEADERS, HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import type { LanguageLearningResult } from '@vigilant-broccoli/llm-schemas';

type Word = {
  id: number;
  word: string;
  type: string;
  definition: string;
  pinyin: string | null;
  mastered: number;
  mastered_at: string | null;
};

type Session = Omit<LanguageLearningResult, 'words'> & {
  id: number;
  language: string;
  category: string;
  created_at: string;
  words: Word[];
};

type StandaloneMasteredWord = {
  word: string;
  language: string;
  definition: string | null;
  pinyin: string | null;
  created_at: string;
};

type SelectedToken =
  | { kind: 'vocab'; word: Word }
  | { kind: 'lookup'; text: string };

type MasterAction =
  | { kind: 'vocab'; wordId: number }
  | {
      kind: 'word';
      word: string;
      language: string;
      definition: string;
      pinyin?: string;
    };

const SUPPORTED_LANGUAGES = [
  'Swedish',
  'Spanish',
  'French',
  'German',
  'Japanese',
  'Italian',
  'Chinese',
] as const;
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const LANGUAGES: Record<SupportedLanguage, { flag: string; code: string }> = {
  Swedish: { flag: '🇸🇪', code: 'sv' },
  Spanish: { flag: '🇪🇸', code: 'es' },
  French: { flag: '🇫🇷', code: 'fr' },
  German: { flag: '🇩🇪', code: 'de' },
  Japanese: { flag: '🇯🇵', code: 'ja' },
  Italian: { flag: '🇮🇹', code: 'it' },
  Chinese: { flag: '🇨🇳', code: 'zh' },
};

const CHINESE: SupportedLanguage = 'Chinese';

function languageCode(language: string): string | undefined {
  return LANGUAGES[language as SupportedLanguage]?.code;
}

function languageWithFlag(language: string) {
  const meta = LANGUAGES[language as SupportedLanguage];
  return meta ? `${meta.flag} ${language}` : language;
}

const TAB = { HISTORY: 'history', MASTERED: 'mastered' } as const;
type Tab = (typeof TAB)[keyof typeof TAB];

const TAB_STORAGE_KEY = 'language-learning-tab';
const SPEED_STORAGE_KEY = 'language-learning-speed';
const LANGUAGES_STORAGE_KEY = 'language-learning-languages';
const LABEL_GET_WORDS = 'Get Words';
const LABEL_NEW_WORDS = 'New Words';
const LABEL_LANGUAGES = 'Languages';
const LABEL_SPEED = 'Speed';
const LABEL_SETTINGS = 'Settings';
const LABEL_SETTINGS_HINT =
  'Choose one or more languages — each "Get Words" generates the same concepts in every selected language (skipping any without a good equivalent).';
const DEFAULT_LANGUAGES: SupportedLanguage[] = ['Swedish'];
const LABEL_EXAMPLE_SENTENCE = 'Example sentence';
const LABEL_HISTORY = 'History';
const LABEL_MASTERED = 'Mastered';
const LABEL_MARK_AS_MASTERED = 'Mark as mastered';
const LABEL_NO_HISTORY = 'No history yet.';
const LABEL_NO_MASTERED = 'No mastered words yet.';
const LABEL_PINYIN_LOADING = '…';

const SPEED_OPTIONS = ['0.5×', '0.75×', '1×'] as const;
type SpeedOption = (typeof SPEED_OPTIONS)[number];
const SPEED_RATE: Record<SpeedOption, number> = {
  '0.5×': 0.5,
  '0.75×': 0.75,
  '1×': 1.0,
};
const DEFAULT_SPEED: SpeedOption = '0.75×';

const SESSION_COLUMN_MIN_WIDTH = '320px';

const segmenterCache = new Map<string, Intl.Segmenter>();
function getSegmenter(locale: string) {
  let segmenter = segmenterCache.get(locale);
  if (!segmenter) {
    segmenter = new Intl.Segmenter(locale, { granularity: 'word' });
    segmenterCache.set(locale, segmenter);
  }
  return segmenter;
}

type Token = { text: string; isWord: boolean; vocabWord?: Word };

function tokenizeSentence(
  sentence: string,
  language: string,
  vocabWords: Word[],
): Token[] {
  const locale = languageCode(language) ?? 'en';
  const segments = Array.from(getSegmenter(locale).segment(sentence));
  const tokens: Token[] = [];

  let i = 0;
  while (i < segments.length) {
    let bestEnd = -1;
    let bestVocab: Word | undefined;
    let combined = '';
    for (let j = i; j < segments.length; j++) {
      if (!segments[j].isWordLike) break;
      combined += segments[j].segment;
      const match = vocabWords.find(
        w => w.word.toLowerCase() === combined.toLowerCase(),
      );
      if (match) {
        bestEnd = j;
        bestVocab = match;
      }
    }

    if (bestVocab && bestEnd >= i) {
      const text = segments
        .slice(i, bestEnd + 1)
        .map(s => s.segment)
        .join('');
      tokens.push({ text, isWord: true, vocabWord: bestVocab });
      i = bestEnd + 1;
    } else {
      const seg = segments[i];
      tokens.push({ text: seg.segment, isWord: seg.isWordLike ?? false });
      i++;
    }
  }

  return tokens;
}

function MasterButton({
  mastered,
  onClick,
}: {
  mastered: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={mastered}
      className={`p-1 rounded transition-colors ${mastered ? 'text-green-500 cursor-default' : 'hover:bg-gray-100 text-gray-400 hover:text-green-500'}`}
      aria-label={LABEL_MARK_AS_MASTERED}
      title={mastered ? LABEL_MASTERED : LABEL_MARK_AS_MASTERED}
    >
      <GraduationCap size={16} />
    </button>
  );
}

function WordContent({
  title,
  word,
  audioId,
  type,
  isMastered,
  definition,
  pinyin,
  pinyinLoading = false,
  definitionLoading = false,
  activeAudioId,
  targetLanguageCode,
  onSpeak,
  onMaster,
}: {
  title: ReactNode;
  word: string;
  audioId: string;
  type: string | null;
  isMastered: boolean;
  definition: string | null;
  pinyin?: string | null;
  pinyinLoading?: boolean;
  definitionLoading?: boolean;
  activeAudioId: string | null;
  targetLanguageCode?: string;
  onSpeak: (text: string, id: string, languageCode?: string) => void;
  onMaster: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {title}
        <AudioButton
          text={word}
          id={audioId}
          activeId={activeAudioId}
          onSpeak={(text, id) => onSpeak(text, id, targetLanguageCode)}
        />
        <MasterButton mastered={isMastered} onClick={onMaster} />
        {type && (
          <Badge
            size="1"
            color={isMastered ? 'gray' : type === 'common' ? 'green' : 'orange'}
          >
            {isMastered ? LABEL_MASTERED : type}
          </Badge>
        )}
      </div>
      {(pinyin || pinyinLoading) && (
        <Text size="2" color="gray" className="italic">
          {pinyinLoading ? LABEL_PINYIN_LOADING : pinyin}
        </Text>
      )}
      {definitionLoading ? (
        <Loader2 size={16} className="animate-spin text-gray-400" />
      ) : (
        <div className="flex items-start gap-1">
          <Text size="2" color="gray" className="flex-1">
            {definition}
          </Text>
          {definition && (
            <AudioButton
              text={definition}
              id={`${audioId}-def`}
              activeId={activeAudioId}
              onSpeak={onSpeak}
            />
          )}
        </div>
      )}
    </>
  );
}

function WordDialog({
  token,
  language,
  masteredIds,
  masteredWords,
  activeAudioId,
  onSpeak,
  onMaster,
  onClose,
}: {
  token: SelectedToken;
  language: string;
  masteredIds: Set<number>;
  masteredWords: Set<string>;
  activeAudioId: string | null;
  onSpeak: (text: string, id: string, languageCode?: string) => void;
  onMaster: (action: MasterAction) => void;
  onClose: () => void;
}) {
  const [lookedUpDefinition, setLookedUpDefinition] = useState<string | null>(
    null,
  );
  const [lookedUpPinyin, setLookedUpPinyin] = useState<string | null>(null);
  const [loadingDefinition, setLoadingDefinition] = useState(false);

  const displayText = token.kind === 'vocab' ? token.word.word : token.text;

  useEffect(() => {
    if (token.kind !== 'lookup') return;
    setLoadingDefinition(true);
    fetch(API_ENDPOINTS.LANGUAGE_LEARNING_DEFINE, {
      method: HTTP_METHOD.POST,
      headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
      body: JSON.stringify({ word: token.text, language }),
    })
      .then(r => r.json())
      .then(data => {
        setLookedUpDefinition(data.definition);
        setLookedUpPinyin(data.pinyin ?? null);
      })
      .finally(() => setLoadingDefinition(false));
  }, [token, language]);

  const isMastered =
    token.kind === 'vocab'
      ? masteredIds.has(token.word.id)
      : masteredWords.has(token.text.toLowerCase());

  const definition =
    token.kind === 'vocab' ? token.word.definition : lookedUpDefinition;
  const wordType = token.kind === 'vocab' ? token.word.type : null;
  const pinyin = token.kind === 'vocab' ? token.word.pinyin : lookedUpPinyin;
  const isChinese = language === CHINESE;

  function handleMaster() {
    if (token.kind === 'vocab') {
      onMaster({ kind: 'vocab', wordId: token.word.id });
    } else if (lookedUpDefinition) {
      onMaster({
        kind: 'word',
        word: token.text,
        language,
        definition: lookedUpDefinition,
        ...(lookedUpPinyin && { pinyin: lookedUpPinyin }),
      });
    }
  }

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <WordContent
          title={<DialogTitle>{displayText}</DialogTitle>}
          word={displayText}
          audioId={`dialog-${displayText}`}
          type={wordType}
          isMastered={isMastered}
          definition={definition}
          pinyin={pinyin}
          pinyinLoading={
            isChinese && token.kind === 'lookup' && loadingDefinition
          }
          definitionLoading={loadingDefinition}
          activeAudioId={activeAudioId}
          targetLanguageCode={languageCode(language)}
          onSpeak={onSpeak}
          onMaster={handleMaster}
        />
      </DialogContent>
    </Dialog>
  );
}

function SessionCard({
  session,
  prefix,
  activeAudioId,
  masteredIds,
  masteredWords,
  onSpeak,
  onMaster,
}: {
  session: Session;
  prefix: string;
  activeAudioId: string | null;
  masteredIds: Set<number>;
  masteredWords: Set<string>;
  onSpeak: (text: string, id: string, languageCode?: string) => void;
  onMaster: (action: MasterAction) => void;
}) {
  const [selectedToken, setSelectedToken] = useState<SelectedToken | null>(
    null,
  );
  const tokens = tokenizeSentence(
    session.exampleSentence.target,
    session.language,
    session.words,
  );
  const targetLanguageCode = languageCode(session.language);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {session.words.map(({ id, word, type, definition, pinyin }) => {
          const isMastered = masteredIds.has(id);
          return (
            <div
              key={word}
              className={`flex-1 border rounded-lg p-4 flex flex-col gap-2 ${isMastered ? 'opacity-50' : ''}`}
            >
              <WordContent
                title={
                  <Text size="6" weight="bold">
                    {word}
                  </Text>
                }
                word={word}
                audioId={`${prefix}-word-${word}`}
                type={type}
                isMastered={isMastered}
                definition={definition}
                pinyin={pinyin}
                activeAudioId={activeAudioId}
                targetLanguageCode={targetLanguageCode}
                onSpeak={onSpeak}
                onMaster={() => onMaster({ kind: 'vocab', wordId: id })}
              />
            </div>
          );
        })}
      </div>

      <div className="border rounded-lg p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Text size="2" weight="medium" color="gray">
            {LABEL_EXAMPLE_SENTENCE}
          </Text>
          <AudioButton
            text={session.exampleSentence.target}
            id={`${prefix}-example`}
            activeId={activeAudioId}
            onSpeak={(text, id) => onSpeak(text, id, targetLanguageCode)}
          />
        </div>
        <Text size="3" asChild>
          <p>
            {tokens.map(({ text, isWord, vocabWord }, i) => {
              if (!isWord) return <span key={i}>{text}</span>;
              const isMasteredWord = vocabWord
                ? masteredIds.has(vocabWord.id)
                : masteredWords.has(text.toLowerCase());
              return (
                <button
                  key={i}
                  onClick={() =>
                    setSelectedToken(
                      vocabWord
                        ? { kind: 'vocab', word: vocabWord }
                        : { kind: 'lookup', text },
                    )
                  }
                  className={`underline underline-offset-2 transition-colors hover:text-blue-500 ${vocabWord ? 'decoration-solid font-medium' : 'decoration-dotted'} ${isMasteredWord ? 'text-green-600 hover:text-green-500' : ''}`}
                >
                  {text}
                </button>
              );
            })}
          </p>
        </Text>
        {session.exampleSentence.pinyin && (
          <Text size="2" color="gray" className="italic">
            {session.exampleSentence.pinyin}
          </Text>
        )}
        <Text size="2" color="gray" className="italic">
          {session.exampleSentence.english}
        </Text>
      </div>

      {selectedToken && (
        <WordDialog
          token={selectedToken}
          language={session.language}
          masteredIds={masteredIds}
          masteredWords={masteredWords}
          activeAudioId={activeAudioId}
          onSpeak={onSpeak}
          onMaster={onMaster}
          onClose={() => setSelectedToken(null)}
        />
      )}
    </div>
  );
}

function SettingsDialog({
  open,
  languages,
  speed,
  onToggleLanguage,
  onSpeedChange,
  onClose,
}: {
  open: boolean;
  languages: SupportedLanguage[];
  speed: SpeedOption;
  onToggleLanguage: (language: SupportedLanguage) => void;
  onSpeedChange: (speed: SpeedOption) => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent>
        <DialogTitle>{LABEL_SETTINGS}</DialogTitle>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Text size="2" weight="medium">
              {LABEL_LANGUAGES}
            </Text>
            <Text size="1" color="gray">
              {LABEL_SETTINGS_HINT}
            </Text>
            <div className="flex flex-col gap-2">
              {SUPPORTED_LANGUAGES.map(lang => {
                const checked = languages.includes(lang);
                const isLast = checked && languages.length === 1;
                return (
                  <label
                    key={lang}
                    className={`flex items-center gap-2 ${isLast ? 'opacity-60' : 'cursor-pointer'}`}
                  >
                    <Checkbox
                      checked={checked}
                      disabled={isLast}
                      onCheckedChange={() => onToggleLanguage(lang)}
                    />
                    <Text size="2">{languageWithFlag(lang)}</Text>
                  </label>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Text size="2" weight="medium">
              {LABEL_SPEED}
            </Text>
            <Select
              options={[...SPEED_OPTIONS]}
              selectedOption={speed}
              setValue={onSpeedChange}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function LanguageLearning() {
  const [languages, setLanguages] =
    useState<SupportedLanguage[]>(DEFAULT_LANGUAGES);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentSessions, setCurrentSessions] = useState<Session[]>([]);
  const [history, setHistory] = useState<Session[]>([]);
  const [masteredIds, setMasteredIds] = useState<Set<number>>(new Set());
  const [standaloneMastered, setStandaloneMastered] = useState<
    StandaloneMasteredWord[]
  >([]);
  const [activeTab, setActiveTab] = useState<Tab>(TAB.HISTORY);
  const [speed, setSpeed] = useState<SpeedOption>(DEFAULT_SPEED);
  const [fetching, setFetching] = useState(false);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const { speak, isLoading: isSpeaking } = useTextToSpeech();

  const masteredWords = new Set(
    standaloneMastered.map(r => r.word.toLowerCase()),
  );

  useEffect(() => {
    const storedTab = localStorage.getItem(TAB_STORAGE_KEY);
    if (storedTab === TAB.HISTORY || storedTab === TAB.MASTERED)
      setActiveTab(storedTab);

    const storedSpeed = localStorage.getItem(SPEED_STORAGE_KEY);
    if (storedSpeed && SPEED_OPTIONS.includes(storedSpeed as SpeedOption))
      setSpeed(storedSpeed as SpeedOption);

    const storedLanguages = localStorage.getItem(LANGUAGES_STORAGE_KEY);
    if (storedLanguages) {
      const parsed = JSON.parse(storedLanguages).filter(
        (l: string): l is SupportedLanguage =>
          SUPPORTED_LANGUAGES.includes(l as SupportedLanguage),
      );
      if (parsed.length > 0) setLanguages(parsed);
    }

    Promise.all([
      fetch(API_ENDPOINTS.LANGUAGE_LEARNING_HISTORY).then(r => r.json()),
      fetch(API_ENDPOINTS.LANGUAGE_LEARNING_MASTERED).then(r => r.json()),
    ]).then(([sessions, standalone]: [Session[], StandaloneMasteredWord[]]) => {
      setHistory(sessions);
      setMasteredIds(
        new Set(
          sessions.flatMap(s => s.words.filter(w => w.mastered).map(w => w.id)),
        ),
      );
      setStandaloneMastered(standalone);
    });
  }, []);

  function handleTabChange(tab: string) {
    const t = tab as Tab;
    setActiveTab(t);
    localStorage.setItem(TAB_STORAGE_KEY, t);
  }

  function handleSpeedChange(s: SpeedOption) {
    setSpeed(s);
    localStorage.setItem(SPEED_STORAGE_KEY, s);
  }

  function handleToggleLanguage(language: SupportedLanguage) {
    setLanguages(prev => {
      const next = prev.includes(language)
        ? prev.filter(l => l !== language)
        : [...prev, language];
      if (next.length === 0) return prev;
      localStorage.setItem(LANGUAGES_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  async function fetchWords() {
    setFetching(true);
    const res = await fetch(API_ENDPOINTS.LANGUAGE_LEARNING_WORDS, {
      method: HTTP_METHOD.POST,
      headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
      body: JSON.stringify({ languages }),
    });
    const { sessions } = (await res.json()) as { sessions?: Session[] };
    const safeSessions = sessions ?? [];
    setCurrentSessions(safeSessions);
    const newIds = new Set(safeSessions.map(s => s.id));
    setHistory(prev => [
      ...safeSessions,
      ...prev.filter(s => !newIds.has(s.id)),
    ]);
    setFetching(false);
    const first = safeSessions[0];
    if (!first) return;
    setActiveAudioId(`current-${first.id}-example`);
    const firstCode = languageCode(first.language);
    await speak(first.exampleSentence.target, {
      playbackRate: SPEED_RATE[speed],
      ...(firstCode && { languageCode: firstCode }),
    });
    setActiveAudioId(null);
  }

  async function handleMaster(action: MasterAction) {
    await fetch(API_ENDPOINTS.LANGUAGE_LEARNING_MASTERED, {
      method: HTTP_METHOD.POST,
      headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
      body: JSON.stringify(
        action.kind === 'vocab'
          ? { wordId: action.wordId }
          : {
              word: action.word,
              language: action.language,
              definition: action.definition,
              ...(action.pinyin && { pinyin: action.pinyin }),
            },
      ),
    });
    if (action.kind === 'vocab') {
      setMasteredIds(prev => new Set([...prev, action.wordId]));
    } else {
      setStandaloneMastered(prev => [
        ...prev,
        {
          word: action.word,
          language: action.language,
          definition: action.definition,
          pinyin: action.pinyin ?? null,
          created_at: new Date().toISOString(),
        },
      ]);
    }
  }

  async function handleSpeak(text: string, id: string, languageCode?: string) {
    setActiveAudioId(id);
    await speak(text, {
      playbackRate: SPEED_RATE[speed],
      ...(languageCode && { languageCode }),
    });
    setActiveAudioId(null);
  }

  const currentActiveId = isSpeaking ? activeAudioId : null;
  const currentIds = new Set(currentSessions.map(s => s.id));
  const pastSessions = history.filter(s => !currentIds.has(s.id));

  const masteredVocabWords = history.flatMap(s =>
    s.words
      .filter(w => masteredIds.has(w.id))
      .map(w => ({ ...w, language: s.language })),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Button onClick={fetchWords} loading={fetching} size="lg">
          {currentSessions.length > 0 ? LABEL_NEW_WORDS : LABEL_GET_WORDS}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings size={16} />
          {LABEL_SETTINGS}
        </Button>
        <Text size="2" color="gray">
          {languages.map(languageWithFlag).join(', ')} · {speed}
        </Text>
      </div>

      <SettingsDialog
        open={settingsOpen}
        languages={languages}
        speed={speed}
        onToggleLanguage={handleToggleLanguage}
        onSpeedChange={handleSpeedChange}
        onClose={() => setSettingsOpen(false)}
      />

      {currentSessions.length > 0 && (
        <div
          className="grid gap-4 items-start"
          style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(${SESSION_COLUMN_MIN_WIDTH}, 1fr))`,
          }}
        >
          {currentSessions.map(session => (
            <div key={session.id} className="flex flex-col gap-2 min-w-0">
              <div className="flex items-center gap-2">
                <Text size="2" weight="medium">
                  {languageWithFlag(session.language)}
                </Text>
                <Text size="1" color="gray" className="capitalize">
                  · {session.category}
                </Text>
                <Text size="1" color="gray">
                  · {new Date(session.created_at).toLocaleDateString()}
                </Text>
              </div>
              <SessionCard
                session={session}
                prefix={`current-${session.id}`}
                activeAudioId={currentActiveId}
                masteredIds={masteredIds}
                masteredWords={masteredWords}
                onSpeak={handleSpeak}
                onMaster={handleMaster}
              />
            </div>
          ))}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value={TAB.HISTORY}>{LABEL_HISTORY}</TabsTrigger>
          <TabsTrigger value={TAB.MASTERED}>
            {LABEL_MASTERED} (
            {masteredVocabWords.length + standaloneMastered.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={TAB.HISTORY}>
          <div className="flex flex-col gap-4">
            {pastSessions.map(session => (
              <div key={session.id} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Text size="2" weight="medium">
                    {languageWithFlag(session.language)}
                  </Text>
                  <Text size="1" color="gray" className="capitalize">
                    · {session.category}
                  </Text>
                  <Text size="1" color="gray">
                    · {new Date(session.created_at).toLocaleDateString()}
                  </Text>
                </div>
                <SessionCard
                  session={session}
                  prefix={`history-${session.id}`}
                  activeAudioId={currentActiveId}
                  masteredIds={masteredIds}
                  masteredWords={masteredWords}
                  onSpeak={handleSpeak}
                  onMaster={handleMaster}
                />
              </div>
            ))}
            {pastSessions.length === 0 && (
              <Text size="2" color="gray">
                {LABEL_NO_HISTORY}
              </Text>
            )}
          </div>
        </TabsContent>

        <TabsContent value={TAB.MASTERED}>
          <div className="flex flex-col gap-3">
            {masteredVocabWords.length === 0 &&
              standaloneMastered.length === 0 && (
                <Text size="2" color="gray">
                  {LABEL_NO_MASTERED}
                </Text>
              )}
            {[
              ...masteredVocabWords.map(w => ({
                word: w.word,
                language: w.language,
                type: w.type,
                definition: w.definition,
                pinyin: w.pinyin,
                audioId: `mastered-vocab-${w.id}`,
                mastered_at: w.mastered_at,
              })),
              ...standaloneMastered.map(w => ({
                word: w.word,
                language: w.language,
                type: null,
                definition: w.definition,
                pinyin: w.pinyin,
                audioId: `mastered-standalone-${w.word}`,
                mastered_at: w.created_at,
              })),
            ]
              .sort((a, b) =>
                (b.mastered_at ?? '').localeCompare(a.mastered_at ?? ''),
              )
              .map(
                ({
                  word,
                  language,
                  type,
                  definition,
                  pinyin,
                  audioId,
                  mastered_at,
                }) => (
                  <div
                    key={audioId}
                    className="border rounded-lg p-4 flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Text size="1" color="gray">
                        {languageWithFlag(language)}
                      </Text>
                      {mastered_at && (
                        <Text size="1" color="gray">
                          · mastered{' '}
                          {new Date(mastered_at).toLocaleDateString()}
                        </Text>
                      )}
                    </div>
                    <WordContent
                      title={
                        <Text size="5" weight="bold">
                          {word}
                        </Text>
                      }
                      word={word}
                      audioId={audioId}
                      type={type}
                      isMastered
                      definition={definition}
                      pinyin={pinyin}
                      activeAudioId={currentActiveId}
                      targetLanguageCode={languageCode(language)}
                      onSpeak={handleSpeak}
                      onMaster={() => undefined}
                    />
                  </div>
                ),
              )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
