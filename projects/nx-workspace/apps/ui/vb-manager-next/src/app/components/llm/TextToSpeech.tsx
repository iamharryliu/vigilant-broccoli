'use client';

import { Box, Button, Flex, Text, TextArea } from '@radix-ui/themes';
import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';

export const TextToSpeech = () => {
  const [text, setText] = useState('');
  const { audioUrl, error, isLoading, speak } = useTextToSpeech();

  const handleSpeak = async () => {
    await speak(text);
  };

  return (
    <Flex direction="column" gap="4">
      <Text size="5" weight="bold">
        Text to Speech
      </Text>

      <Box>
        <TextArea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type text, then click Speak..."
          rows={8}
          className="w-full"
        />
      </Box>

      <Flex align="center" gap="2">
        <Button onClick={handleSpeak} disabled={isLoading || !text.trim()}>
          <Volume2 size={16} />
          {isLoading ? 'Generating...' : 'Speak'}
        </Button>

        {error && (
          <Text size="2" color="red">
            {error}
          </Text>
        )}
      </Flex>

      {audioUrl && (
        <audio key={audioUrl} controls autoPlay className="w-full">
          <source src={audioUrl} type="audio/mpeg" />
          Your browser does not support audio playback.
        </audio>
      )}
    </Flex>
  );
};
