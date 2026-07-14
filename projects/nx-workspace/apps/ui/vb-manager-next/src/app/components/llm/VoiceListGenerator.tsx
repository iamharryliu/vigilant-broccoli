'use client';

import { useState, useRef } from 'react';
import { Text } from '@radix-ui/themes';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { AUDIO_MIME_TYPE, AUDIO_FILENAME } from '../../constants/audio';
import { SpeechToTextButton } from './SpeechToTextButton';
import { authFetch } from '../../../../libs/auth';

const ERROR_GENERATE_LIST = 'Failed to generate list.';

export const VoiceListGenerator = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [items, setItems] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    setError(null);
    setItems([]);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = e => chunksRef.current.push(e.data);
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopAndProcess = () =>
    new Promise<void>(resolve => {
      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder) return resolve();

      mediaRecorder.onstop = async () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        setIsRecording(false);

        const audioBlob = new Blob(chunksRef.current, {
          type: AUDIO_MIME_TYPE,
        });
        const formData = new FormData();
        formData.append('audio', audioBlob, AUDIO_FILENAME);

        const res = await authFetch(API_ENDPOINTS.VOICE_LIST, {
          method: 'POST',
          body: formData,
        });
        const { items: parsed, error: listError } = await res.json();

        if (listError || !parsed) {
          setError(ERROR_GENERATE_LIST);
        } else {
          setItems(parsed);
        }
        resolve();
      };

      mediaRecorder.stop();
    });

  return (
    <div className="flex flex-col gap-4">
      <Text size="2" color="gray">
        Press record, describe what list you want, then stop to generate.
      </Text>

      <div className="flex gap-3 items-center">
        <SpeechToTextButton
          isRecording={isRecording}
          onToggle={startRecording}
          onStopComplete={stopAndProcess}
        />
      </div>

      {error && (
        <Text size="2" color="red">
          {error}
        </Text>
      )}

      {items.length > 0 && (
        <div className="flex flex-col gap-2">
          <Text size="3" weight="medium">
            Result
          </Text>
          <Text size="2" className="font-mono whitespace-pre-wrap">
            {JSON.stringify(items, null, 2)}
          </Text>
        </div>
      )}
    </div>
  );
};
