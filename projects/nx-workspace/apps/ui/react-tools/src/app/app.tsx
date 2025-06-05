import {
  Button,
  Card,
  Container,
  TabNav,
  TextArea,
  Theme,
  Heading,
} from '@radix-ui/themes';
import { ReactNode, useState } from 'react';
import {
  countWords,
  getJSONFromEnvironmentVariables,
  getEnvironmentVariablesFromJSON,
} from '@vigilant-broccoli/common-js';
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { Copy } from 'lucide-react';
import { CRUDListManagementDemo } from './components/sandbox/CRUDListManagementDemo';
import { ButtonDemo } from './components/sandbox/ButtonDemo';
import { SelectDemo } from './components/sandbox/SelectDemo';

const APP_ROUTE = {
  INDEX: { title: 'Home', path: '/' },
  CONVERT_ENVIRONMENT_VARIABLES_TO_JSON: {
    title: 'Environment Variables ↔️ JSON',
    path: '/convertEnvironmentVariablesToJSON',
  },
  CHARACTER_COUNTER: {
    title: 'Character Counter',
    path: '/characterCounter',
  },
  COMPONENT_LIBRARY: {
    title: 'Component Library',
    path: '/componentLibrary',
  },
};

export function App() {
  return (
    <Theme>
      <BrowserRouter>
        <Routes>
          <Route path={APP_ROUTE.INDEX.path} element={<IndexPage />} />
          <Route
            path={APP_ROUTE.CONVERT_ENVIRONMENT_VARIABLES_TO_JSON.path}
            element={<EnvironmentVariablesToJSONPage />}
          />
          <Route
            path={APP_ROUTE.CHARACTER_COUNTER.path}
            element={<CharacterCounterPage />}
          />
          <Route
            path={APP_ROUTE.COMPONENT_LIBRARY.path}
            element={<ComponentLibraryDemo />}
          />
        </Routes>
      </BrowserRouter>
    </Theme>
  );
}

const ComponentLibraryDemo = () => {
  return (
    <PageWrapper>
      <SelectDemo/>
      <CRUDListManagementDemo />
      <ButtonDemo />
    </PageWrapper>
  );
};

export const CopyPastable = ({ text }: { text: string }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <Card className="bg-gray-100 h-full">
      <div className="absolute top-2 right-2 ">
        <Button variant="ghost" onClick={handleCopy}>
          <Copy />
        </Button>
      </div>
      <pre>{text}</pre>
    </Card>
  );
};

const PageWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <Container size="4">
      <NavBar />
      <main className="space-y-4">{children}</main>
    </Container>
  );
};

const IndexPage = () => {
  return (
    <PageWrapper>
      <></>
    </PageWrapper>
  );
};

const EnvironmentVariablesToJSONPage = () => {
  return (
    <PageWrapper>
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
    </PageWrapper>
  );
};

const NavBar = () => {
  const location = useLocation();
  return (
    <div className="mb-8">
      <TabNav.Root>
        {Object.values(APP_ROUTE).map(obj => {
          return (
            <TabNav.Link asChild active={location.pathname === obj.path}>
              <Link to={obj.path}>{obj.title}</Link>
            </TabNav.Link>
          );
        })}
      </TabNav.Root>
    </div>
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

const ConversionForm = ({
  copy,
  initialText,
  conversionFn,
}: {
  copy: Record<string, string>;
  initialText: string;
  conversionFn: (text: string) => string;
}) => {
  const [text, setText] = useState(initialText);

  return (
    <Card>
      <Heading size="4" mb="2">
        {copy.header}
      </Heading>
      <div className="flex space-x-4">
        <TextArea
          className="w-1/2"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={copy.placeholder}
          size="3"
        />
        <div className="w-1/2">
          <CopyPastable text={conversionFn(text)} />
        </div>
      </div>
    </Card>
  );
};

const CharacterCounterPage = () => {
  return (
    <PageWrapper>
      <CharacterCounter />
    </PageWrapper>
  );
};

const CharacterCounter = () => {
  const [text, setText] = useState('');
  return (
    <div className="flex">
      <TextArea
        className="w-1/2"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Enter text.."
      />
      <div className="w-1/2">
        <p>Length: {text.length}</p>
        <p>Words: {countWords(text)}</p>
      </div>
    </div>
  );
};

const PrettyJson = ({ data }: { data: any }) => {
  return (
    <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono h-full">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
};

export default App;
