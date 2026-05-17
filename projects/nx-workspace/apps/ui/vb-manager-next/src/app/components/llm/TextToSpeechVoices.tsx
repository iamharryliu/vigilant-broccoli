'use client';

import { Flex, Text, TextArea } from '@radix-ui/themes';
import { Button, Select } from '@vigilant-broccoli/react-lib';
import {
  ELEVENLABS_FREE_VOICE_OPTIONS,
  DEFAULT_VOICE_ID,
} from '@vigilant-broccoli/common-js';
import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';

const DEFAULT_TEXT =
  'Hello! This is a text to speech demo. How does my voice sound?';
const PLACEHOLDER_TEXT = 'Enter text to speak...';
const PLACEHOLDER_VOICE = 'Select voice';
const AUDIO_TYPE = 'audio/mpeg';
const LABEL_GENERATING = 'Generating...';
const LABEL_SPEAK = 'Speak';

type VoiceOption = (typeof ELEVENLABS_FREE_VOICE_OPTIONS)[number];

const DEFAULT_VOICE =
  ELEVENLABS_FREE_VOICE_OPTIONS.find(v => v.value === DEFAULT_VOICE_ID) ??
  ELEVENLABS_FREE_VOICE_OPTIONS[0];

export const TextToSpeechVoices = () => {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [voice, setVoice] = useState<VoiceOption>(DEFAULT_VOICE);
  const { audioUrl, error, isLoading, speak } = useTextToSpeech();

  return (
    <Flex direction="column" gap="4">
      <TextArea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={PLACEHOLDER_TEXT}
        rows={4}
        className="w-full"
      />

      <Flex gap="2" align="center">
        <Select
          options={ELEVENLABS_FREE_VOICE_OPTIONS as unknown as VoiceOption[]}
          selectedOption={voice}
          setValue={setVoice}
          optionDisplayKey="label"
          optionIdenfifier="value"
          placeholder={PLACEHOLDER_VOICE}
        />

        <Button
          onClick={() => speak(text, { voiceId: voice.value })}
          disabled={isLoading || !text.trim()}
          loading={isLoading}
        >
          <Volume2 size={16} />
          {isLoading ? LABEL_GENERATING : LABEL_SPEAK}
        </Button>
      </Flex>

      {error && (
        <Text size="2" color="red">
          {error}
        </Text>
      )}

      {audioUrl && (
        <audio key={audioUrl} controls autoPlay className="w-full">
          <source src={audioUrl} type={AUDIO_TYPE} />
        </audio>
      )}
    </Flex>
  );
};
