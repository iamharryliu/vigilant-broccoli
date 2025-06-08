import { Card, Heading } from '@radix-ui/themes';
import {
  getEnvironmentVariablesFromJSON,
  getJSONFromEnvironmentVariables,
} from '@vigilant-broccoli/common-js';
import { ConversionForm, CopyPastable } from '@vigilant-broccoli/react-lib';
import { getPrettierJSON } from '../../lib/utils';

export const JSONPage = () => {
  return (
    <div className="space-y-4">
      <EnvironmentVariablesToJSONForm />
      <JSONToEnvVarForm />
      <JSONPrettier />
    </div>
  );
};

const EnvironmentVariablesToJSONForm = () => {
  return (
    <div className="flex space-x-4">
      <div className="w-2/3">
        <ConversionForm
          copy={{
            header: 'Environment Variables to JSON',
            placeholder: 'Your environment variables..',
          }}
          initialText={''}
          conversionFn={text =>
            getPrettierJSON(
              JSON.stringify(getJSONFromEnvironmentVariables(text)),
            )
          }
        />
      </div>
      <div className="flex w-1/3">
        <DemoExampleCard
          heading={`Sample Environment Variables`}
          exampleText={`NODE_ENV=production\nSECRET_KEY="abc 123"`}
        />
      </div>
    </div>
  );
};

export const DemoExampleCard = ({
  heading,
  exampleText,
}: {
  heading: string;
  exampleText: string;
}) => {
  return (
    <Card className="w-full space-y-2">
      <Heading size="4" mb="2">
        {heading}
      </Heading>
      <div className="w-full">
        <CopyPastable text={exampleText} />
      </div>
    </Card>
  );
};

const JSONToEnvVarForm = () => {
  return (
    <div className="flex space-x-4">
      <div className="w-2/3">
        <ConversionForm
          copy={{
            header: 'JSON to Environment Variables',
            placeholder: 'Your JSON..',
          }}
          initialText={'{}'}
          conversionFn={getEnvironmentVariablesFromJSON}
        />
      </div>

      <div className="w-1/3">
        <DemoExampleCard
          heading={`Sample JSON`}
          exampleText={JSON.stringify(
            { NODE_ENV: 'production', SECRET_KEY: 'abc 123' },
            null,
            2,
          )}
        />
      </div>
    </div>
  );
};

const JSONPrettier = () => {
  return (
    <div className="flex space-x-4">
      <div className="w-2/3">
        <ConversionForm
          copy={{ header: 'JSON Prettier', placeholder: 'Your JSON..' }}
          initialText={'{}'}
          conversionFn={getPrettierJSON}
        />
      </div>

      <div className="w-1/3">
        <DemoExampleCard
          heading={'Sample JSON'}
          exampleText={JSON.stringify({
            NODE_ENV: 'production',
            SECRET_KEY: 'abc 123',
          })}
        />
      </div>
    </div>
  );
};
