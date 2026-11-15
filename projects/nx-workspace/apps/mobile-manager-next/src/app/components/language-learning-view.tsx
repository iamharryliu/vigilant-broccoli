'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSeenWords } from '../hooks/use-seen-words';
import { HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { AudioButton } from '@vigilant-broccoli/react-lib-media';
import { useTextToSpeech } from '@vigilant-broccoli/react-lib';
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
const SENTENCE_ID_SUFFIX = ':sentence';
const ERROR_MESSAGE = 'Could not load a word. Tap refresh to try again.';

const TAB_ALL = 'All';
type Tab = typeof TAB_ALL | WordType;

const TABS: { tab: Tab; label: string }[] = [
  { tab: TAB_ALL, label: 'All' },
  { tab: WORD_TYPE.NOUN, label: 'Nouns' },
  { tab: WORD_TYPE.ADJECTIVE, label: 'Adjectives' },
  { tab: WORD_TYPE.VERB, label: 'Verbs' },
  { tab: WORD_TYPE.PHRASE, label: 'Phrases' },
];

export const LanguageLearningView = () => {
  const [result, setResult] = useState<WordResult | null>(null);
  const [tab, setTab] = useState<Tab>(TAB_ALL);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showSeen, setShowSeen] = useState(false);
  const [sentences, setSentences] = useState<
    Partial<Record<Language, SentenceResult>>
  >({});
  const [sentenceLoading, setSentenceLoading] = useState<Language | null>(null);
  const [copiedLanguage, setCopiedLanguage] = useState<Language | null>(null);
  const copiedTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { seen, seenRef, hydrate, add, remove, clear } = useSeenWords();
  const requestId = useRef(0);
  const { speak } = useTextToSpeech({
    authFetch,
    endpoint: API_ENDPOINTS.TEXT_TO_SPEECH,
  });

  // `word` loads that specific English word instead of a random one.
  const loadWord = useCallback(
    async (nextTab: Tab, word?: string) => {
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
    loadWord(next);
  };

  const handleClearSeen = () => {
    if (window.confirm(CLEAR_CONFIRM)) clear();
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

  const loadSentence = async (language: Language, word: string) => {
    const wordRequestId = requestId.current;
    setSentenceLoading(language);
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
    } catch {
      setHasError(true);
    } finally {
      setSentenceLoading(null);
    }
  };

  // Ids are a language, or `<language>:sentence` for its example sentence.
  const handleSpeak = async (text: string, id: string) => {
    setActiveId(id);
    const [language] = id.split(SENTENCE_ID_SUFFIX);
    await speak(text, {
      playbackRate: SPEECH_RATE,
      languageCode: LANGUAGE_META[language as Language].code,
    });
    setActiveId(null);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex shrink-0 items-center justify-between gap-2">
        <div role="tablist" className="flex gap-4 overflow-x-auto">
          {TABS.map(({ tab: name, label }) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={tab === name}
              onClick={() => selectTab(name)}
              className={`whitespace-nowrap py-2 text-sm ${tab === name ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => loadWord(tab)}
          disabled={isLoading}
          aria-label="New word"
          className="flex h-11 w-11 items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-40 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>
      {hasError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {ERROR_MESSAGE}
        </p>
      )}
      {result?.antonym && (
        <button
          type="button"
          onClick={() => loadWord(tab, result.antonym)}
          disabled={isLoading}
          className="flex shrink-0 items-center gap-2 self-start text-sm text-gray-500 hover:text-gray-900 disabled:opacity-40 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <ArrowLeftRight size={16} />
          {ANTONYM_LABEL}: {result.antonym}
        </button>
      )}
      {result && (
        <ul
          className={`flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-[env(safe-area-inset-bottom)] transition-opacity ${isLoading ? 'opacity-40' : ''}`}
        >
          {LANGUAGE_ORDER.map(language => {
            const { word, pinyin, synonyms } = result.entry[language];
            const sentence = sentences[language];
            return (
              <li key={language} className="flex flex-col gap-1">
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
      {seen.length > 0 && (
        <div className="shrink-0 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowSeen(open => !open)}
              aria-expanded={showSeen}
              className="py-1 hover:text-gray-900 dark:hover:text-gray-100"
            >
              {SEEN_LABEL} ({seen.length})
            </button>
            {showSeen && (
              <button
                type="button"
                onClick={handleClearSeen}
                className="py-1 hover:text-gray-900 dark:hover:text-gray-100"
              >
                {CLEAR_ALL_LABEL}
              </button>
            )}
          </div>
          {showSeen && (
            <ul className="mt-2 flex max-h-40 flex-wrap gap-x-4 gap-y-1 overflow-y-auto">
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
          )}
        </div>
      )}
    </div>
  );
};
