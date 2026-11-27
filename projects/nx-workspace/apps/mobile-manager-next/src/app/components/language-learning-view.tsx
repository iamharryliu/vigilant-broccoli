'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSeenWords } from '../hooks/use-seen-words';
import {
  SPEECH_LANGUAGE_ATTRIBUTE,
  useSpeakOnSelect,
} from '../hooks/use-speak-on-select';
import { HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { AudioButton } from '@vigilant-broccoli/react-lib-media';
import {
  DeleteItemConfirmationDialog,
  ToggleGroup,
  ToggleGroupItem,
  useTextToSpeech,
} from '@vigilant-broccoli/react-lib';
import {
  ArrowLeftRight,
  Loader2,
  MessageSquareText,
  RefreshCw,
  X,
} from 'lucide-react';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import {
  LANGUAGE,
  LANGUAGE_META,
  LANGUAGE_ORDER,
  WORD_TYPE,
  type Language,
  type SentenceResult,
  type WordResult,
  type WordType,
} from '../constants/language-learning-words';
import { authFetch } from '../providers/auth-provider';

const SPEECH_RATE = 0.75;
// Caps the prompt size; older seen words stay stored but are no longer sent.
const EXCLUDE_LIMIT = 300;
const SEEN_LABEL = 'Seen words';
const CLEAR_ALL_LABEL = 'Clear all';
const CLEAR_CONFIRM = 'Clear all seen words? They can come up again.';
const ANTONYM_LABEL = 'Opposite';
const COPY_LABEL = 'Copy';
const COPIED_LABEL = 'Copied';
const COPIED_DURATION_MS = 1500;
const SENTENCE_LABEL = 'Example sentence';
const ID_SEPARATOR = ':';
const SENTENCE_ID_SUFFIX = `${ID_SEPARATOR}sentence`;
// Matches no speaker button, so speaking a selection lights none of them up.
const SELECTION_ID_SUFFIX = `${ID_SEPARATOR}selection`;
const ERROR_MESSAGE = 'Could not load a word. Tap refresh to try again.';

const TAB_ALL = 'All';
const TAB_SEEN = 'Seen';
type WordTab = typeof TAB_ALL | WordType;
type Tab = WordTab | typeof TAB_SEEN;

const TABS: { tab: Tab; label: string }[] = [
  { tab: TAB_ALL, label: 'All' },
  { tab: WORD_TYPE.NOUN, label: 'Nouns' },
  { tab: WORD_TYPE.ADJECTIVE, label: 'Adjectives' },
  { tab: WORD_TYPE.VERB, label: 'Verbs' },
  { tab: WORD_TYPE.PHRASE, label: 'Phrases' },
  { tab: TAB_SEEN, label: 'Seen' },
];

export const LanguageLearningView = () => {
  const [result, setResult] = useState<WordResult | null>(null);
  const [tab, setTab] = useState<Tab>(TAB_ALL);
  const [wordTab, setWordTab] = useState<WordTab>(TAB_ALL);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [sentences, setSentences] = useState<
    Partial<Record<Language, SentenceResult>>
  >({});
  const [sentenceLoading, setSentenceLoading] = useState<Language | null>(null);
  const [copiedLanguage, setCopiedLanguage] = useState<Language | null>(null);
  const copiedTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { seen, seenRef, hydrate, add, remove, clear } = useSeenWords();
  const requestId = useRef(0);
  const listRef = useRef<HTMLUListElement>(null);
  const { speak } = useTextToSpeech({
    authFetch,
    endpoint: API_ENDPOINTS.TEXT_TO_SPEECH,
  });

  // `word` loads that specific English word instead of a random one.
  const loadWord = useCallback(
    async (nextTab: WordTab, word?: string) => {
      const id = ++requestId.current;
      setIsLoading(true);
      setHasError(false);
      try {
        const res = await authFetch(API_ENDPOINTS.LANGUAGE_LEARNING_WORD, {
          method: HTTP_METHOD.POST,
          body: JSON.stringify({
            type: nextTab === TAB_ALL ? undefined : nextTab,
            exclude: seenRef.current.slice(-EXCLUDE_LIMIT),
            word,
          }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const next = (await res.json()) as WordResult;
        if (id !== requestId.current) return;
        add(next.entry[LANGUAGE.ENGLISH].word);
        setResult(next);
        setSentences({});
      } catch {
        if (id === requestId.current) setHasError(true);
      } finally {
        if (id === requestId.current) setIsLoading(false);
      }
    },
    [add, seenRef],
  );

  // Hydrate before the first load so the stored list reaches the LLM.
  useEffect(() => {
    hydrate();
    loadWord(TAB_ALL);
  }, [hydrate, loadWord]);

  const selectTab = (next: Tab) => {
    setTab(next);
    if (next === TAB_SEEN) return;
    setWordTab(next);
    loadWord(next);
  };

  const copyWord = async (language: Language, word: string) => {
    await navigator.clipboard.writeText(word);
    setCopiedLanguage(language);
    clearTimeout(copiedTimeout.current);
    copiedTimeout.current = setTimeout(
      () => setCopiedLanguage(null),
      COPIED_DURATION_MS,
    );
  };

  // Ids are a language, or `<language>:sentence` / `<language>:selection`.
  const handleSpeak = async (text: string, id: string) => {
    setActiveId(id);
    const [language] = id.split(ID_SEPARATOR);
    await speak(text, {
      playbackRate: SPEECH_RATE,
      languageCode: LANGUAGE_META[language as Language].code,
    });
    setActiveId(null);
  };

  const loadSentence = async (language: Language, word: string) => {
    const wordRequestId = requestId.current;
    setSentenceLoading(language);
    let loaded: SentenceResult | null = null;
    try {
      const res = await authFetch(API_ENDPOINTS.LANGUAGE_LEARNING_SENTENCE, {
        method: HTTP_METHOD.POST,
        body: JSON.stringify({ language, word }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const sentence = (await res.json()) as SentenceResult;
      // A new word arrived while this was loading; its sentence no longer fits.
      if (wordRequestId !== requestId.current) return;
      setSentences(current => ({ ...current, [language]: sentence }));
      loaded = sentence;
    } catch {
      setHasError(true);
    } finally {
      setSentenceLoading(null);
    }
    if (loaded) {
      await handleSpeak(loaded.sentence, `${language}${SENTENCE_ID_SUFFIX}`);
    }
  };

  useSpeakOnSelect(listRef, (text, language) =>
    handleSpeak(text, `${language}${SELECTION_ID_SUFFIX}`),
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex shrink-0 items-center justify-between gap-2">
        <div className="min-w-0 overflow-x-auto">
          <ToggleGroup
            label="Word type"
            value={tab}
            onValueChange={value => selectTab(value as Tab)}
          >
            {TABS.map(({ tab: name, label }) => (
              <ToggleGroupItem
                key={name}
                value={name}
                label={label}
                className="px-3 py-1.5"
              >
                {label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        {tab !== TAB_SEEN && (
          <button
            type="button"
            onClick={() => loadWord(wordTab)}
            disabled={isLoading}
            aria-label="New word"
            className="flex h-11 w-11 shrink-0 items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-40 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        )}
      </div>
      {tab !== TAB_SEEN && hasError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {ERROR_MESSAGE}
        </p>
      )}
      {tab !== TAB_SEEN && result && (
        <ul
          ref={listRef}
          className={`flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-[env(safe-area-inset-bottom)] transition-opacity ${isLoading ? 'opacity-40' : ''}`}
        >
          {LANGUAGE_ORDER.map(language => {
            const { word, pinyin, synonyms } = result.entry[language];
            const sentence = sentences[language];
            return (
              <li
                key={language}
                className="flex flex-col gap-1"
                {...{ [SPEECH_LANGUAGE_ATTRIBUTE]: language }}
              >
                <div className="flex items-baseline gap-2">
                  <span
                    role="img"
                    aria-label={language}
                    className="shrink-0 text-base"
                  >
                    {LANGUAGE_META[language].flag}
                  </span>
                  <p className="min-w-0 flex-1 text-gray-500 dark:text-gray-400">
                    <button
                      type="button"
                      onClick={() => copyWord(language, word)}
                      title={COPY_LABEL}
                      className="text-left text-xl font-semibold text-gray-900 dark:text-gray-100"
                    >
                      {word}
                    </button>
                    {copiedLanguage === language && (
                      <span role="status" className="ml-2 text-xs">
                        {COPIED_LABEL}
                      </span>
                    )}
                    {pinyin && <span className="ml-2 text-sm">{pinyin}</span>}
                    <span className="ml-2 text-xs">{synonyms.join(' · ')}</span>
                  </p>
                  <AudioButton
                    text={word}
                    id={language}
                    activeId={activeId}
                    onSpeak={handleSpeak}
                  />
                  <button
                    type="button"
                    onClick={() => loadSentence(language, word)}
                    disabled={sentenceLoading !== null}
                    aria-label={`${SENTENCE_LABEL} (${language})`}
                    title={SENTENCE_LABEL}
                    className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
                  >
                    {sentenceLoading === language ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <MessageSquareText size={16} />
                    )}
                  </button>
                </div>
                {sentence && (
                  <div className="ml-7 flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <p className="min-w-0 flex-1">
                      <span className="text-gray-900 dark:text-gray-100">
                        {sentence.sentence}
                      </span>
                      {sentence.pinyin && (
                        <span className="block text-xs">{sentence.pinyin}</span>
                      )}
                      {language !== LANGUAGE.ENGLISH && (
                        <span className="block text-xs">
                          {sentence.english}
                        </span>
                      )}
                    </p>
                    <AudioButton
                      text={sentence.sentence}
                      id={`${language}${SENTENCE_ID_SUFFIX}`}
                      activeId={activeId}
                      onSpeak={handleSpeak}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {tab !== TAB_SEEN && result?.antonym && (
        <button
          type="button"
          onClick={() => loadWord(wordTab, result.antonym)}
          disabled={isLoading}
          className="flex shrink-0 items-center gap-2 self-start rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-40 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <ArrowLeftRight size={16} />
          {ANTONYM_LABEL}: {result.antonym}
        </button>
      )}
      {tab === TAB_SEEN && (
        <div className="flex min-h-0 flex-1 flex-col gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex shrink-0 items-center justify-between gap-4">
            <span>
              {SEEN_LABEL} ({seen.length})
            </span>
            {seen.length > 0 && (
              <button
                type="button"
                onClick={() => setIsClearing(true)}
                className="py-1 hover:text-gray-900 dark:hover:text-gray-100"
              >
                {CLEAR_ALL_LABEL}
              </button>
            )}
          </div>
          <ul className="flex min-h-0 flex-1 flex-wrap content-start gap-x-4 gap-y-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
            {[...seen].reverse().map(word => (
              <li key={word} className="flex items-center gap-1">
                {word}
                <button
                  type="button"
                  onClick={() => remove(word)}
                  aria-label={`Remove ${word}`}
                  className="p-1 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <DeleteItemConfirmationDialog
        open={isClearing}
        onOpenChange={setIsClearing}
        title={CLEAR_ALL_LABEL}
        description={CLEAR_CONFIRM}
        confirmLabel={CLEAR_ALL_LABEL}
        deleteItem={async () => clear()}
      />
    </div>
  );
};
