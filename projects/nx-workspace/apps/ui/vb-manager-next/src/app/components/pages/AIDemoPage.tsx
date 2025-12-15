import { Box, Card } from '@radix-ui/themes';
import { LLMSimplePromptTester } from '../llm/LLMPromptTester';

export const AIDemoPage = () => {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <Box p="4">
          <LLMSimplePromptTester />
        </Box>
      </Card>
    </div>
  );
};
