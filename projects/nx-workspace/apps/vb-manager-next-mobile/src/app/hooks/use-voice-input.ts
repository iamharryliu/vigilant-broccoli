'use client';

import { useVoiceRecorder } from './use-voice-recorder';
import { useStreamingSpeech } from './use-streaming-speech';

export const useVoiceInput = (onTranscript: (text: string) => void) => {
  const streaming = useStreamingSpeech(onTranscript);
  const recorder = useVoiceRecorder(onTranscript);

  if (streaming.supported) {
    const { supported: _supported, ...rest } = streaming;
    return rest;
  }

  return { ...recorder, interimTranscript: '' };
};
