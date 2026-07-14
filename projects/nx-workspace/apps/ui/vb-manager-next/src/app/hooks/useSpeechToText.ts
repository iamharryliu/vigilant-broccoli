'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { AUDIO_MIME_TYPE, AUDIO_FILENAME } from '../constants/audio';
import { authFetch } from '../../../libs/auth';

const SPEECH_LANG = 'en-US';
const ERROR_TRANSCRIBE = 'Failed to transcribe audio';
const ERROR_MICROPHONE = 'Failed to access microphone';
const ERROR_RECOGNITION_START = 'Failed to start speech recognition';
const ERROR_RECOGNITION_UNSUPPORTED =
  'Speech recognition not supported in this browser';
const ERROR_NO_SPEECH = 'no-speech';

interface UseSpeechToTextOptions {
  onTranscriptComplete?: (transcript: string) => void;
  onTranscriptUpdate?: (transcript: string) => void;
  streaming?: boolean;
}

export const useSpeechToText = ({
  onTranscriptComplete,
  onTranscriptUpdate,
  streaming = false,
}: UseSpeechToTextOptions = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onTranscriptUpdateRef = useRef(onTranscriptUpdate);
  const onTranscriptCompleteRef = useRef(onTranscriptComplete);

  useEffect(() => {
    onTranscriptUpdateRef.current = onTranscriptUpdate;
  }, [onTranscriptUpdate]);

  useEffect(() => {
    onTranscriptCompleteRef.current = onTranscriptComplete;
  }, [onTranscriptComplete]);

  useEffect(() => {
    if (!streaming || typeof window === 'undefined') return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError(ERROR_RECOGNITION_UNSUPPORTED);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = SPEECH_LANG;

    recognition.onresult = event => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;
      if (currentTranscript) {
        onTranscriptUpdateRef.current?.(currentTranscript.trim());
      }
    };

    recognition.onerror = event => {
      if (event.error === ERROR_NO_SPEECH) return;
      setError(`Speech recognition error: ${event.error}`);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }, [streaming]);

  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('audio', audioBlob, AUDIO_FILENAME);

    const response = await authFetch(API_ENDPOINTS.SPEECH_TO_TEXT, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: ERROR_TRANSCRIBE }));
      setError(errorData.error || ERROR_TRANSCRIBE);
      setIsProcessing(false);
      return;
    }

    const data = await response.json();
    setIsProcessing(false);
    onTranscriptCompleteRef.current?.(data.transcript);
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);

    if (streaming && recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (_err) {
        setError(ERROR_RECOGNITION_START);
      }
      return;
    }

    const stream = await navigator.mediaDevices
      .getUserMedia({ audio: true })
      .catch(() => {
        setError(ERROR_MICROPHONE);
        return null;
      });

    if (!stream) return;

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: AUDIO_MIME_TYPE,
      });
      await transcribeAudio(audioBlob);
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.start();
    setIsRecording(true);
  }, [streaming, transcribeAudio]);

  const stopRecording = useCallback(() => {
    if (streaming && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [streaming]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    isProcessing,
    error,
    startRecording,
    stopRecording,
    toggleRecording,
  };
};
