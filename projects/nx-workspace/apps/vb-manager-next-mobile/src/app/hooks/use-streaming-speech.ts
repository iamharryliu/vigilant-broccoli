'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const SPEECH_LANG = 'en-US';
const ERROR_NO_SPEECH = 'no-speech';
const ERROR_ABORTED = 'aborted';
const ERROR_START = 'Failed to start speech recognition';
const ERROR_RECOGNITION_PREFIX = 'Speech recognition error: ';

type RecordingState = 'idle' | 'recording' | 'transcribing';

const getSpeechRecognition = () =>
  typeof window === 'undefined'
    ? null
    : window.SpeechRecognition || window.webkitSpeechRecognition || null;

export const useStreamingSpeech = (onTranscript: (text: string) => void) => {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  const supported = getSpeechRecognition() !== null;

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = SPEECH_LANG;

    recognition.onresult = event => {
      let interim = '';
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const segment = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += segment;
        else interim += segment;
      }
      if (finalText.trim()) onTranscriptRef.current(finalText.trim());
      setInterimTranscript(interim.trim());
    };

    recognition.onerror = event => {
      if (event.error === ERROR_NO_SPEECH || event.error === ERROR_ABORTED)
        return;
      setVoiceError(`${ERROR_RECOGNITION_PREFIX}${event.error}`);
      setRecordingState('idle');
    };

    recognition.onend = () => {
      setInterimTranscript('');
      setRecordingState('idle');
    };

    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, []);

  const toggleRecording = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (recordingState === 'recording') {
      recognition.stop();
      setRecordingState('idle');
      return;
    }

    setVoiceError(null);
    setInterimTranscript('');
    try {
      recognition.start();
      setRecordingState('recording');
    } catch {
      setVoiceError(ERROR_START);
    }
  }, [recordingState]);

  return {
    recordingState,
    interimTranscript,
    voiceError,
    toggleRecording,
    supported,
  };
};
