'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { HTTP_HEADERS, HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { authFetch } from '../../../libs/auth';

type UseTextToSpeechOptions = {
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

export const useTextToSpeech = (
  options: UseTextToSpeechOptions = {},
): UseTextToSpeechResult => {
  const { autoPlay = true, voiceId } = options;
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
        setError('Please enter text to convert');
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
        const response = await authFetch(API_ENDPOINTS.TEXT_TO_SPEECH, {
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
            .catch(() => ({ error: 'Failed to generate speech' }));
          setError(errorData.error || 'Failed to generate speech');
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

        setError('Failed to generate speech');
      } finally {
        if (requestAbortRef.current === abortController) {
          requestAbortRef.current = null;
        }
        setIsLoading(false);
      }
    },
    [autoPlay, releaseAudioUrl, stop, voiceId],
  );

  return {
    audioUrl,
    error,
    isLoading,
    speak,
    stop,
  };
};
