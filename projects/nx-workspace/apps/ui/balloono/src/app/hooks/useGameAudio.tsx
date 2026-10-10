'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { MatchEvent, MatchState } from '../engine/game.types';
import { createGameAudio } from '../game-audio';

const MUTE_STORAGE_KEY = 'balloono-muted';
const POINTER_EVENT = 'pointerdown';
const KEY_EVENT = 'keydown';
const VISIBILITY_EVENT = 'visibilitychange';

interface GameAudio {
  muted: boolean;
  toggleMuted: () => void;
  play: (type: MatchEvent['type']) => void;
}

const GameAudioContext = createContext<GameAudio | null>(null);

export function GameAudioProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(
    () => localStorage.getItem(MUTE_STORAGE_KEY) === 'true',
  );
  const mutedRef = useRef(muted);
  mutedRef.current = muted;
  const audioRef = useRef<ReturnType<typeof createGameAudio> | null>(null);

  useEffect(() => {
    const audio = createGameAudio();
    audioRef.current = audio;
    const unlock = () => {
      if (!mutedRef.current) audio.unlock();
    };
    const silenceWhenHidden = () => {
      if (document.hidden) audio.silence();
    };
    window.addEventListener(POINTER_EVENT, unlock, true);
    window.addEventListener(KEY_EVENT, unlock, true);
    document.addEventListener(VISIBILITY_EVENT, silenceWhenHidden);
    return () => {
      window.removeEventListener(POINTER_EVENT, unlock, true);
      window.removeEventListener(KEY_EVENT, unlock, true);
      document.removeEventListener(VISIBILITY_EVENT, silenceWhenHidden);
      audio.close();
      audioRef.current = null;
    };
  }, []);

  const play = useCallback((type: MatchEvent['type']) => {
    try {
      if (!mutedRef.current) audioRef.current?.play(type);
    } catch {
      audioRef.current?.silence();
    }
  }, []);

  const toggleMuted = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    localStorage.setItem(MUTE_STORAGE_KEY, String(next));
    if (next) audioRef.current?.silence();
    else audioRef.current?.unlock();
  }, []);

  const value = useMemo(
    () => ({ muted, toggleMuted, play }),
    [muted, toggleMuted, play],
  );
  return (
    <GameAudioContext.Provider value={value}>
      {children}
    </GameAudioContext.Provider>
  );
}

export const useGameAudio = () => {
  const value = useContext(GameAudioContext);
  if (!value) throw new Error('GameAudioProvider is required');
  return value;
};

export const useMatchSounds = (match: MatchState, enabled: boolean) => {
  const { play } = useGameAudio();
  const cursorRef = useRef<{ matchId: string; eventId: number } | null>(null);
  useEffect(() => {
    const resetWhenHidden = () => {
      if (document.hidden) cursorRef.current = null;
    };
    document.addEventListener(VISIBILITY_EVENT, resetWhenHidden);
    return () =>
      document.removeEventListener(VISIBILITY_EVENT, resetWhenHidden);
  }, []);
  useEffect(() => {
    if (!enabled || document.hidden) {
      cursorRef.current = null;
      return;
    }
    const cursor = cursorRef.current;
    if (!cursor || cursor.matchId !== match.id) {
      cursorRef.current = { matchId: match.id, eventId: match.nextEventId - 1 };
      return;
    }
    match.events
      .filter(event => event.id > cursor.eventId)
      .forEach(event => play(event.type));
    cursor.eventId = Math.max(cursor.eventId, match.nextEventId - 1);
  }, [match, play, enabled]);
};
