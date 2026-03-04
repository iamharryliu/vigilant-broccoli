'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

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

  useEffect(() => {
    if (streaming && typeof window !== 'undefined') {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

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
          if (onTranscriptUpdate && currentTranscript) {
            onTranscriptUpdate(currentTranscript.trim());
          }
        };

        recognition.onerror = event => {
          if (event.error === 'no-speech') {
            return;
          }
          setError(`Speech recognition error: ${event.error}`);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      } else {
        setError('Speech recognition not supported in this browser');
      }
    }
  }, [streaming, onTranscriptUpdate]);

  const transcribeAudio = useCallback(
    async (audioBlob: Blob) => {
      setIsProcessing(true);
      setError(null);

      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Failed to transcribe audio' }));
        setError(errorData.error || 'Failed to transcribe audio');
        setIsProcessing(false);
        return;
      }

      const data = await response.json();
      setIsProcessing(false);

      if (onTranscriptComplete) {
        onTranscriptComplete(data.transcript);
      }
    },
    [onTranscriptComplete],
  );

  const startRecording = useCallback(async () => {
    setError(null);

    if (streaming && recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        setError('Failed to start speech recognition');
      }
      return;
    }

    const stream = await navigator.mediaDevices
      .getUserMedia({ audio: true })
      .catch(() => {
        setError('Failed to access microphone');
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
        type: 'audio/webm',
      });
      await transcribeAudio(audioBlob);
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.start();
    setIsRecording(true);
  }, [streaming, transcribeAudio]);

  const stopRecording = useCallback(() => {
    if (streaming && recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [streaming, isRecording]);

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
