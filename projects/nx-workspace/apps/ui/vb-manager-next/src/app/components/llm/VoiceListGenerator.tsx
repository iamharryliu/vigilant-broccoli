'use client';

import { useState, useRef } from 'react';
import { Button, Flex, Text, Spinner } from '@radix-ui/themes';
import { HTTP_HEADERS } from '@vigilant-broccoli/common-js';
import { API_ENDPOINTS } from '../../constants/api-endpoints';

const AUDIO_MIME_TYPE = 'audio/webm';

type Status = 'idle' | 'recording' | 'processing';

export const VoiceListGenerator = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [items, setItems] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    setError(null);
    setItems([]);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = e => chunksRef.current.push(e.data);
    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      await processRecording();
    };

    mediaRecorder.start();
    setStatus('recording');
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setStatus('processing');
  };

  const processRecording = async () => {
    const audioBlob = new Blob(chunksRef.current, { type: AUDIO_MIME_TYPE });
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const transcribeRes = await fetch(API_ENDPOINTS.SPEECH_TO_TEXT, {
      method: 'POST',
      body: formData,
    });
    const { transcript } = await transcribeRes.json();

    if (!transcript) {
      setError('Could not transcribe audio.');
      setStatus('idle');
      return;
    }

    const listRes = await fetch(API_ENDPOINTS.VOICE_LIST, {
      method: 'POST',
      headers: HTTP_HEADERS.CONTENT_TYPE.JSON,
      body: JSON.stringify({ transcript }),
    });
    const { items: parsed, error: listError } = await listRes.json();

    if (listError || !parsed) {
      setError('Failed to generate list.');
    } else {
      setItems(parsed);
    }
    setStatus('idle');
  };

  return (
    <Flex direction="column" gap="4">
      <Text size="4" weight="bold">
        Voice List Generator
      </Text>
      <Text size="2" color="gray">
        Press record, describe what list you want, then stop to generate.
      </Text>

      <Flex gap="3" align="center">
        {status === 'idle' && (
          <Button onClick={startRecording} size="3">
            🎙 Start Recording
          </Button>
        )}
        {status === 'recording' && (
          <Button onClick={stopRecording} size="3" color="red">
            ⏹ Stop Recording
          </Button>
        )}
        {status === 'processing' && (
          <Flex gap="2" align="center">
            <Spinner />
            <Text size="2" color="gray">
              Processing...
            </Text>
          </Flex>
        )}
      </Flex>

      {error && (
        <Text size="2" color="red">
          {error}
        </Text>
      )}

      {items.length > 0 && (
        <Flex direction="column" gap="2">
          <Text size="3" weight="medium">
            Result
          </Text>
          <Text size="2" className="font-mono whitespace-pre-wrap">
            {JSON.stringify(items, null, 2)}
          </Text>
        </Flex>
      )}
    </Flex>
  );
};
