import { Card, Heading } from '@radix-ui/themes';
import { Layout } from '../layout/Layout';
import { ConversionForm } from '../ConversionForm';
import {
  getEnvironmentVariablesFromJSON,
  getJSONFromEnvironmentVariables,
} from '@vigilant-broccoli/common-js';
import { CopyPastable } from '@vigilant-broccoli/react-lib';

export const JSONPage = () => {
  return (
    <Layout>
      <div className="flex space-x-4">
        <div className="flex-auto space-y-4">
          <EnvironmentVariablesToJSONForm />
          <JSONToEnvVarForm />
          <JSONPrettier />
        </div>
        <Card className="flex-none space-y-4">
          <div className="space-y-2">
            <Heading size="4" mb="2">
              Sample Environment Variables
            </Heading>
            <CopyPastable text={`NODE_ENV=production\nSECRET_KEY="abc 123"`} />
          </div>
          <div className="space-y-2">
            <Heading size="4" mb="2">
              Sample JSON
            </Heading>
            <CopyPastable
              text={JSON.stringify(
                { NODE_ENV: 'production', SECRET_KEY: 'abc 123' },
                null,
                2,
              )}
            />
          </div>
        </Card>
      </div>
    </Layout>
  );
};

const EnvironmentVariablesToJSONForm = () => {
  return (
    <ConversionForm
      copy={{
        header: 'Environment Variables to JSON',
        placeholder: 'Your environment variables..',
      }}
      initialText={''}
      conversionFn={text =>
        JSON.stringify(getJSONFromEnvironmentVariables(text))
      }
    />
  );
};

const JSONToEnvVarForm = () => {
  return (
    <ConversionForm
      copy={{
        header: 'JSON to Environment Variables',
        placeholder: 'Your JSON..',
      }}
      initialText={'{}'}
      conversionFn={getEnvironmentVariablesFromJSON}
    />
  );
};

const JSONPrettier = () => {
  function prettyPrintJson(jsonText: string): string {
    try {
      const jsonObj = JSON.parse(jsonText);
      return JSON.stringify(jsonObj, null, 2);
    } catch {
      return '';
    }
  }
  return (
    <ConversionForm
      copy={{ header: 'JSON Prettier', placeholder: 'Your JSON..' }}
      initialText={'{}'}
      conversionFn={prettyPrintJson}
    />
  );
};
