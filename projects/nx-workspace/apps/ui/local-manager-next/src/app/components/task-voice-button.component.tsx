'use client';

import { useRef } from 'react';
import {
  useSpeechToText,
  SpeechToTextToggleButton,
} from '@vigilant-broccoli/react-lib';
import { authFetch } from '../../../libs/auth';

export const TaskVoiceButton = ({
  onTranscript,
}: {
  onTranscript: (text: string) => void;
}) => {
  const latestTranscript = useRef('');

  const { isRecording, isProcessing, toggleRecording } = useSpeechToText({
    authFetch,
    streaming: true,
    onTranscriptUpdate: transcript => {
      latestTranscript.current = transcript;
    },
  });

  const handleToggle = () => {
    if (isRecording && latestTranscript.current) {
      onTranscript(latestTranscript.current);
      latestTranscript.current = '';
    }
    toggleRecording();
  };

  return (
    <SpeechToTextToggleButton
      isRecording={isRecording}
      isProcessing={isProcessing}
      onToggle={handleToggle}
    />
  );
};
