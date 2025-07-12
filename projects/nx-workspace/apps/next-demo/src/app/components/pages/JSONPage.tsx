import { Card, Heading } from '@radix-ui/themes';
import { EnvUtils } from '@vigilant-broccoli/common-js';
import { ConversionForm, CopyPastable } from '@vigilant-broccoli/react-lib';

export const JSONPage = () => {
  return (
    <div className="space-y-4">
      <EnvironmentVariablesToJSONForm />
      <JSONToEnvVarForm />
      <JSONPrettier />
      <CleanEnvConversionForm />
      <FormatBlockStringToSingleStringForm />
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
            EnvUtils.getPrettierJSON(
              JSON.stringify(EnvUtils.getJSONFromEnvironmentVariables(text)),
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
          conversionFn={EnvUtils.getEnvironmentVariablesFromJSON}
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
          conversionFn={EnvUtils.getPrettierJSON}
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

const CleanEnvConversionForm = () => {
  return (
    <div className="flex space-x-4">
      <div className="w-2/3">
        <ConversionForm
          copy={{
            header: 'Get Stubbed Environment Variable Keys',
            placeholder: 'Environment Variables',
          }}
          initialText={''}
          conversionFn={EnvUtils.getStubbedEnvironmentVariableKeys}
        />
      </div>

      <div className="w-1/3">
        <DemoExampleCard
          heading={'Sample Environment Variables'}
          exampleText={`NODE_ENV=production\nSECRET_KEY="abc 123"`}
        />
      </div>
    </div>
  );
};

const FormatBlockStringToSingleStringForm = () => {
  return (
    <div className="flex space-x-4">
      <div className="w-2/3">
        <ConversionForm
          copy={{
            header: 'Block String to Single Line String',
            placeholder: 'Text',
          }}
          initialText={''}
          conversionFn={EnvUtils.formatBlockStringToSingleLineString}
        />
      </div>

      <div className="w-1/3">
        <DemoExampleCard
          heading={'Sample Environment Variables'}
          exampleText={`-----BEGIN CERTIFICATE-----\nSomething\n-----END CERTIFICATE-----"`}
        />
      </div>
    </div>
  );
};
