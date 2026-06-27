'use client';

import { Heading, Text } from '@radix-ui/themes';
import { LanguageLearning } from '../demos/LanguageLearning';

export function LanguageLearningPage() {
  return (
    <div className="w-full min-h-screen">
      <div className="p-6">
        <Heading size="8" mb="2">
          Language Learning
        </Heading>
        <Text color="gray" size="4" mb="6">
          Learn vocabulary with AI-generated words, example sentences, and audio
        </Text>
        <LanguageLearning />
      </div>
    </div>
  );
}
