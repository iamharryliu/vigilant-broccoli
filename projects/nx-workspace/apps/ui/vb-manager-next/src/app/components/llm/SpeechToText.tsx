'use client';

import { Box, Flex, Text, TextArea, IconButton } from '@radix-ui/themes';
import { useState, useRef } from 'react';
import { Mic, Square, X } from 'lucide-react';

export const SpeechToText = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    setError(null);

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
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
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
    setTranscript(prev => prev + (prev ? ' ' : '') + data.transcript);
    setIsProcessing(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const clearTranscript = () => {
    setTranscript('');
  };

  return (
    <Flex direction="column" gap="4">
      <Text size="5" weight="bold">
        Speech to Text
      </Text>

      <Flex gap="2" align="center">
        <IconButton
          size="3"
          onClick={toggleRecording}
          disabled={isProcessing}
          color={isRecording ? 'red' : 'blue'}
        >
          {isRecording ? <Square size={16} /> : <Mic size={16} />}
        </IconButton>

        {transcript && (
          <IconButton
            size="3"
            variant="soft"
            onClick={clearTranscript}
            disabled={isRecording || isProcessing}
          >
            <X size={16} />
          </IconButton>
        )}

        {isProcessing && (
          <Text size="2" color="gray">
            Processing...
          </Text>
        )}

        {error && (
          <Text size="2" color="red">
            {error}
          </Text>
        )}
      </Flex>

      <Box>
        <TextArea
          value={transcript}
          onChange={e => setTranscript(e.target.value)}
          placeholder="Click the microphone to start recording..."
          rows={8}
          className="w-full"
        />
      </Box>
    </Flex>
  );
};
