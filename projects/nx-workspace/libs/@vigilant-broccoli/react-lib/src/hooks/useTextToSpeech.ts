'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { HTTP_HEADERS, HTTP_METHOD } from '@vigilant-broccoli/common-js';

const TEXT_TO_SPEECH_ENDPOINT = '/api/text-to-speech';
const ERROR_EMPTY_TEXT = 'Please enter text to convert';
const ERROR_SPEECH = 'Failed to generate speech';

type UseTextToSpeechOptions = {
  authFetch: (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => Promise<Response>;
  // The route must answer `{ text, voiceId?, languageCode? }` with audio.
  endpoint?: string;
  autoPlay?: boolean;
  voiceId?: string;
};

type SpeakOptions = {
  voiceId?: string;
  playbackRate?: number;
  languageCode?: string;
};

export type UseTextToSpeechResult = {
  audioUrl: string | null;
  error: string | null;
  isLoading: boolean;
  speak: (text: string, options?: SpeakOptions) => Promise<void>;
  stop: () => void;
};

export const useTextToSpeech = ({
  authFetch,
  endpoint = TEXT_TO_SPEECH_ENDPOINT,
  autoPlay = true,
  voiceId,
}: UseTextToSpeechOptions): UseTextToSpeechResult => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const requestAbortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    requestAbortRef.current?.abort();
    requestAbortRef.current = null;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  }, []);

  const releaseAudioUrl = useCallback(() => {
    if (!audioUrlRef.current) return;

    URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      stop();
      releaseAudioUrl();
    };
  }, [releaseAudioUrl, stop]);

  const speak = useCallback(
    async (text: string, speakOptions?: SpeakOptions) => {
      const trimmedText = text.trim();
      if (!trimmedText) {
        setError(ERROR_EMPTY_TEXT);
        return;
      }

      stop();
      releaseAudioUrl();
      setAudioUrl(null);
      setIsLoading(true);
      setError(null);

      const abortController = new AbortController();
      requestAbortRef.current = abortController;

      try {
        const response = await authFetch(endpoint, {
          method: HTTP_METHOD.POST,
          headers: { ...HTTP_HEADERS.CONTENT_TYPE.JSON },
          body: JSON.stringify({
            text: trimmedText,
            voiceId: speakOptions?.voiceId || voiceId,
            ...(speakOptions?.languageCode && {
              languageCode: speakOptions.languageCode,
            }),
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: ERROR_SPEECH }));
          setError(errorData.error || ERROR_SPEECH);
          return;
        }

        const nextAudioUrl = URL.createObjectURL(await response.blob());
        audioUrlRef.current = nextAudioUrl;
        setAudioUrl(nextAudioUrl);

        if (autoPlay) {
          const audio = new Audio(nextAudioUrl);
          if (speakOptions?.playbackRate)
            audio.playbackRate = speakOptions.playbackRate;
          audioRef.current = audio;
          await audio.play();
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        setError(ERROR_SPEECH);
      } finally {
        if (requestAbortRef.current === abortController) {
          requestAbortRef.current = null;
        }
        setIsLoading(false);
      }
    },
    [authFetch, autoPlay, endpoint, releaseAudioUrl, stop, voiceId],
  );

  return {
    audioUrl,
    error,
    isLoading,
    speak,
    stop,
  };
};
