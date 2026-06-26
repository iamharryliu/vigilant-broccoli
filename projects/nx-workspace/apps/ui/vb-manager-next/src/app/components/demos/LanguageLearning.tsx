'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Badge, Text } from '@radix-ui/themes';
import {
  AudioButton,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Select,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@vigilant-broccoli/react-lib';
import { GraduationCap, Loader2 } from 'lucide-react';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { HTTP_HEADERS, HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import type { LanguageLearningResult } from '@vigilant-broccoli/llm-schemas';

type Word = {
  id: number;
  word: string;
  type: string;
  definition: string;
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
  created_at: string;
};

type SelectedToken =
  | { kind: 'vocab'; word: Word }
  | { kind: 'lookup'; text: string };

type MasterAction =
  | { kind: 'vocab'; wordId: number }
  | { kind: 'word'; word: string; language: string; definition: string };

const SUPPORTED_LANGUAGES = [
  'Swedish',
  'Spanish',
  'French',
  'German',
  'Japanese',
  'Italian',
] as const;
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const TAB = { HISTORY: 'history', MASTERED: 'mastered' } as const;
type Tab = (typeof TAB)[keyof typeof TAB];

const TAB_STORAGE_KEY = 'language-learning-tab';
const SPEED_STORAGE_KEY = 'language-learning-speed';
const LABEL_GET_WORDS = 'Get Words';
const LABEL_NEW_WORDS = 'New Words';
const LABEL_LANGUAGE = 'Language:';
const LABEL_SPEED = 'Speed:';
const LABEL_EXAMPLE_SENTENCE = 'Example sentence';
const LABEL_HISTORY = 'History';
const LABEL_MASTERED = 'Mastered';
const LABEL_MARK_AS_MASTERED = 'Mark as mastered';
const LABEL_NO_HISTORY = 'No history yet.';
const LABEL_NO_MASTERED = 'No mastered words yet.';

const SPEED_OPTIONS = ['0.5×', '0.75×', '1×'] as const;
type SpeedOption = (typeof SPEED_OPTIONS)[number];
const SPEED_RATE: Record<SpeedOption, number> = {
  '0.5×': 0.5,
  '0.75×': 0.75,
  '1×': 1.0,
};
const DEFAULT_SPEED: SpeedOption = '0.75×';

const WORD_REGEX = /([A-Za-zÀ-ÖØ-öø-ÿ]+)/;

function tokenizeSentence(sentence: string, vocabWords: Word[]) {
  return sentence.split(WORD_REGEX).map(part => ({
    text: part,
    isWord: WORD_REGEX.test(part),
    vocabWord: vocabWords.find(
      w => w.word.toLowerCase() === part.toLowerCase(),
    ),
  }));
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
  definitionLoading = false,
  activeAudioId,
  onSpeak,
  onMaster,
}: {
  title: ReactNode;
  word: string;
  audioId: string;
  type: string | null;
  isMastered: boolean;
  definition: string | null;
  definitionLoading?: boolean;
  activeAudioId: string | null;
  onSpeak: (text: string, id: string) => void;
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
          onSpeak={onSpeak}
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
  onSpeak: (text: string, id: string) => void;
  onMaster: (action: MasterAction) => void;
  onClose: () => void;
}) {
  const [lookedUpDefinition, setLookedUpDefinition] = useState<string | null>(
    null,
  );
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
      .then(data => setLookedUpDefinition(data.definition))
      .finally(() => setLoadingDefinition(false));
  }, [token, language]);

  const isMastered =
    token.kind === 'vocab'
      ? masteredIds.has(token.word.id)
      : masteredWords.has(token.text.toLowerCase());

  const definition =
    token.kind === 'vocab' ? token.word.definition : lookedUpDefinition;
  const wordType = token.kind === 'vocab' ? token.word.type : null;

  function handleMaster() {
    if (token.kind === 'vocab') {
      onMaster({ kind: 'vocab', wordId: token.word.id });
    } else if (lookedUpDefinition) {
      onMaster({
        kind: 'word',
        word: token.text,
        language,
        definition: lookedUpDefinition,
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
          definitionLoading={loadingDefinition}
          activeAudioId={activeAudioId}
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
  onSpeak: (text: string, id: string) => void;
  onMaster: (action: MasterAction) => void;
}) {
  const [selectedToken, setSelectedToken] = useState<SelectedToken | null>(
    null,
  );
  const tokens = tokenizeSentence(
    session.exampleSentence.target,
    session.words,
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {session.words.map(({ id, word, type, definition }) => {
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
                activeAudioId={activeAudioId}
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
            onSpeak={onSpeak}
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

export function LanguageLearning() {
  const [language, setLanguage] = useState<SupportedLanguage>('Swedish');
  const [current, setCurrent] = useState<Session | null>(null);
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

  async function fetchWords() {
    setFetching(true);
    const res = await fetch(API_ENDPOINTS.LANGUAGE_LEARNING_WORDS, {
      method: HTTP_METHOD.POST,
      headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
      body: JSON.stringify({ language }),
    });
    const data: Session = await res.json();
    setCurrent(data);
    setHistory(prev => [data, ...prev.filter(s => s.id !== data.id)]);
    setFetching(false);
    setActiveAudioId(`current-${data.id}-example`);
    await speak(data.exampleSentence.target, {
      playbackRate: SPEED_RATE[speed],
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
          created_at: new Date().toISOString(),
        },
      ]);
    }
  }

  async function handleSpeak(text: string, id: string) {
    setActiveAudioId(id);
    await speak(text, { playbackRate: SPEED_RATE[speed] });
    setActiveAudioId(null);
  }

  const currentActiveId = isSpeaking ? activeAudioId : null;
  const pastSessions = history.filter(s => s.id !== current?.id);

  const masteredVocabWords = history.flatMap(s =>
    s.words
      .filter(w => masteredIds.has(w.id))
      .map(w => ({ ...w, language: s.language })),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-3">
          <Text size="2" weight="medium">
            {LABEL_LANGUAGE}
          </Text>
          <Select
            options={[...SUPPORTED_LANGUAGES]}
            selectedOption={language}
            setValue={setLanguage}
          />
        </div>
        <div className="flex items-center gap-3">
          <Text size="2" weight="medium">
            {LABEL_SPEED}
          </Text>
          <Select
            options={[...SPEED_OPTIONS]}
            selectedOption={speed}
            setValue={handleSpeedChange}
          />
        </div>
      </div>

      <Button onClick={fetchWords} loading={fetching} size="lg">
        {current ? LABEL_NEW_WORDS : LABEL_GET_WORDS}
      </Button>

      {current && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Text size="2" weight="medium">
              {current.language}
            </Text>
            <Text size="1" color="gray" className="capitalize">
              · {current.category}
            </Text>
            <Text size="1" color="gray">
              · {new Date(current.created_at).toLocaleDateString()}
            </Text>
          </div>
          <SessionCard
            session={current}
            prefix={`current-${current.id}`}
            activeAudioId={currentActiveId}
            masteredIds={masteredIds}
            masteredWords={masteredWords}
            onSpeak={handleSpeak}
            onMaster={handleMaster}
          />
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
                    {session.language}
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
                audioId: `mastered-vocab-${w.id}`,
                mastered_at: w.mastered_at,
              })),
              ...standaloneMastered.map(w => ({
                word: w.word,
                language: w.language,
                type: null,
                definition: w.definition,
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
                  audioId,
                  mastered_at,
                }) => (
                  <div
                    key={audioId}
                    className="border rounded-lg p-4 flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Text size="1" color="gray">
                        {language}
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
                      activeAudioId={currentActiveId}
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
