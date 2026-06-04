'use client';

import { Box, Flex, Text } from '@radix-ui/themes';
import { Textarea } from '@vigilant-broccoli/react-lib';
import { useState } from 'react';
import { useSpeechToText } from '../../hooks/useSpeechToText';
import { SpeechToTextButton } from './SpeechToTextButton';

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
      ? { streaming: true, onTranscriptUpdate: update }
      : {
          onTranscriptComplete: text => {
            const updated = transcript ? `${transcript} ${text}` : text;
            update(updated);
          },
        },
  );

  return (
    <Flex direction="column" gap="4">
      <Flex gap="2" align="center">
        <SpeechToTextButton
          isRecording={isRecording}
          isProcessing={isProcessing}
          onToggle={toggleRecording}
        />

        {error && (
          <Text size="2" color="red">
            {error}
          </Text>
        )}
      </Flex>

      <Box>
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
      </Box>
    </Flex>
  );
};
