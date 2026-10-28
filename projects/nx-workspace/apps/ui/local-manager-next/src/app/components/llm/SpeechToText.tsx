'use client';

import {
  Textarea,
  Text,
  SpeechToTextToggleButton,
  useSpeechToText,
} from '@vigilant-broccoli/react-lib';
import { useState } from 'react';
import { authFetch } from '../../../../libs/auth';

const PLACEHOLDER_STREAMING = 'Click the microphone to start recording...';
const PLACEHOLDER_COMPLETE =
  'Record audio, then transcription will appear here...';

type SpeechToTextMode = 'streaming' | 'complete';

interface SpeechToTextProps {
  mode?: SpeechToTextMode;
  onTranscript?: (transcript: string) => void;
}

export const SpeechToText = ({
  mode = 'streaming',
  onTranscript,
}: SpeechToTextProps = {}) => {
  const [transcript, setTranscript] = useState('');
  const isStreaming = mode === 'streaming';

  const update = (text: string) => {
    setTranscript(text);
    onTranscript?.(text);
  };

  const { isRecording, isProcessing, error, toggleRecording } = useSpeechToText(
    isStreaming
      ? { authFetch, streaming: true, onTranscriptUpdate: update }
      : {
          authFetch,
          onTranscriptComplete: text => {
            const updated = transcript ? `${transcript} ${text}` : text;
            update(updated);
          },
        },
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 items-center">
        <SpeechToTextToggleButton
          isRecording={isRecording}
          isProcessing={isProcessing}
          onToggle={toggleRecording}
        />

        {error && (
          <Text size="2" color="red">
            {error}
          </Text>
        )}
      </div>

      <div>
        <Textarea
          value={transcript}
          onChange={e => {
            setTranscript(e.target.value);
            onTranscript?.(e.target.value);
          }}
          placeholder={
            isStreaming ? PLACEHOLDER_STREAMING : PLACEHOLDER_COMPLETE
          }
          rows={8}
          className="w-full"
        />
      </div>
    </div>
  );
};
