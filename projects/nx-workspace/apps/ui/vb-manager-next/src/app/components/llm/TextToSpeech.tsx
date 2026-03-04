'use client';

import { Box, Button, Flex, Text, TextArea } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';

export const TextToSpeech = () => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleSpeak = async () => {
    if (!text.trim()) {
      setError('Please enter text to convert');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Failed to generate speech' }));
        setError(errorData.error || 'Failed to generate speech');
        return;
      }

      const audioBlob = await response.blob();
      const nextAudioUrl = URL.createObjectURL(audioBlob);

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      setAudioUrl(nextAudioUrl);
    } catch {
      setError('Failed to generate speech');
    } finally {
      setIsLoading(false);
    }
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
