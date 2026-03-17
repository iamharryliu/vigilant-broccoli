import { Card, TextArea, Heading, Text } from '@radix-ui/themes';
import { EnvUtils } from '@vigilant-broccoli/common-js';
import { ConversionForm } from '@vigilant-broccoli/react-lib';
import { useState } from 'react';
import { countWords } from '@vigilant-broccoli/common-js';

export const TextToolsPage = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <EnvironmentVariablesToJSONForm />
      <JSONToEnvVarForm />
      <JSONPrettier />
      <CleanEnvConversionForm />
      <FormatBlockStringToSingleStringForm />
      <CharacterCounter />
    </div>
  );
};

const SAMPLE_ENV_VARS = `NODE_ENV=production\nSECRET_KEY="abc 123"`;

const EnvironmentVariablesToJSONForm = () => {
  return (
    <ConversionForm
      copy={{
        header: 'Environment Variables to JSON',
        placeholder: SAMPLE_ENV_VARS,
      }}
      initialText={''}
      sampleText={SAMPLE_ENV_VARS}
      conversionFn={text =>
        EnvUtils.getPrettierJSON(
          JSON.stringify(EnvUtils.getJSONFromEnvironmentVariables(text)),
        )
      }
    />
  );
};

const SAMPLE_JSON = JSON.stringify(
  { NODE_ENV: 'production', SECRET_KEY: 'abc 123' },
  null,
  2,
);

const JSONToEnvVarForm = () => {
  return (
    <ConversionForm
      copy={{
        header: 'JSON to Environment Variables',
        placeholder: SAMPLE_JSON,
      }}
      initialText={''}
      sampleText={SAMPLE_JSON}
      conversionFn={EnvUtils.getEnvironmentVariablesFromJSON}
    />
  );
};

const SAMPLE_JSON_COMPACT = JSON.stringify({
  NODE_ENV: 'production',
  SECRET_KEY: 'abc 123',
});

const JSONPrettier = () => {
  return (
    <ConversionForm
      copy={{ header: 'JSON Prettier', placeholder: SAMPLE_JSON_COMPACT }}
      initialText={''}
      sampleText={SAMPLE_JSON_COMPACT}
      conversionFn={EnvUtils.getPrettierJSON}
    />
  );
};

const SAMPLE_ENV_VARS_2 = `NODE_ENV=production\nSECRET_KEY="abc 123"`;

const CleanEnvConversionForm = () => {
  return (
    <ConversionForm
      copy={{
        header: 'Get Stubbed Environment Variable Keys',
        placeholder: SAMPLE_ENV_VARS_2,
      }}
      initialText={''}
      sampleText={SAMPLE_ENV_VARS_2}
      conversionFn={EnvUtils.getStubbedEnvironmentVariableKeys}
    />
  );
};

const SAMPLE_BLOCK_STRING = `-----BEGIN CERTIFICATE-----\nSomething\n-----END CERTIFICATE-----"`;

const FormatBlockStringToSingleStringForm = () => {
  return (
    <ConversionForm
      copy={{
        header: 'Block String to Single Line String',
        placeholder: SAMPLE_BLOCK_STRING,
      }}
      initialText={''}
      sampleText={SAMPLE_BLOCK_STRING}
      conversionFn={EnvUtils.formatBlockStringToSingleLineString}
    />
  );
};

const CharacterCounter = () => {
  const [text, setText] = useState('');

  const charCount = text.length;
  const charCountNoSpaces = text.replace(/\s/g, '').length;
  const wordCount = countWords(text);
  const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

  return (
    <Card>
      <Heading size="4" mb="2">
        Text Analysis
      </Heading>
      <div className="flex space-x-4">
        <div className="w-1/2">
          <TextArea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Enter text.."
            size="3"
            className="h-full resize-y"
          />
        </div>
        <div className="w-1/2 space-y-4">
          <div>
            <Text>Characters: {charCount}</Text>
          </div>
          <div>
            <Text>Characters (no spaces): {charCountNoSpaces}</Text>
          </div>
          <div>
            <Text>Words: {wordCount}</Text>
          </div>
          <div>
            <Text>Sentences: {sentenceCount}</Text>
          </div>
        </div>
      </div>
    </Card>
  );
};
