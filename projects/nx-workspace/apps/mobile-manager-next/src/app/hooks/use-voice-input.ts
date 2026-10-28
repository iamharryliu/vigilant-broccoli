'use client';

import { useEffect, useRef } from 'react';
import { useVoiceRecorder } from './use-voice-recorder';
import { useStreamingSpeech } from './use-streaming-speech';

export const useVoiceInput = (onTranscript: (text: string) => void) => {
  const streaming = useStreamingSpeech(onTranscript);
  const recorder = useVoiceRecorder(onTranscript);

  const startRecorderRef = useRef(recorder.toggleRecording);
  const handedOffRef = useRef(false);

  useEffect(() => {
    startRecorderRef.current = recorder.toggleRecording;
  });

  useEffect(() => {
    if (streaming.unavailable && !handedOffRef.current) {
      handedOffRef.current = true;
      startRecorderRef.current();
    }
  }, [streaming.unavailable]);

  if (!streaming.supported || streaming.unavailable) {
    return { ...recorder, interimTranscript: '' };
  }

  const {
    supported: _supported,
    unavailable: _unavailable,
    ...rest
  } = streaming;
  return rest;
};
