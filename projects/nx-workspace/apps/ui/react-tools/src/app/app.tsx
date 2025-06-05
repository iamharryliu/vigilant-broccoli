import { Button, Card, TabNav, TextArea, Theme } from '@radix-ui/themes';
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
        </Routes>
      </BrowserRouter>
    </Theme>
  );
}

export const CopyPastable = ({ text }: { text: string }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <Card className="bg-gray-100">
      <div className="flex">
        <div className="ml-auto">
          <Button variant="ghost" onClick={handleCopy}>
            <Copy />
          </Button>
        </div>
      </div>
      <pre>{text}</pre>
    </Card>
  );
};

const PageWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <NavBar />
      <main className="space-y-4">{children}</main>
    </>
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
      <EnvironmentVariablesToJSONForm />
      <JSONToEnvVarForm />
      <div className="flex space-x-4">
        <div className="space-y-2">
          <h2>Sample JSON</h2>
          <CopyPastable
            text={JSON.stringify(
              { NODE_ENV: 'production', SECRET_KEY: 'abc 123' },
              null,
              2,
            )}
          />
        </div>
        <div className="space-y-2">
          <h2>Sample Environment Variables</h2>
          <CopyPastable text={`NODE_ENV=production\nSECRET_KEY="abc 123"`} />
        </div>
      </div>
    </PageWrapper>
  );
};

const NavBar = () => {
  const location = useLocation();
  return (
    <TabNav.Root>
      {Object.values(APP_ROUTE).map(obj => {
        return (
          <TabNav.Link asChild active={location.pathname === obj.path}>
            <Link to={obj.path}>{obj.title}</Link>
          </TabNav.Link>
        );
      })}
    </TabNav.Root>
  );
};

const EnvironmentVariablesToJSONForm = () => {
  const [text, setText] = useState('');
  const json = getJSONFromEnvironmentVariables(text);
  return (
    <div className="flex">
      <TextArea
        className="w-1/2"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Your environment variables.."
      />
      <div className="w-1/2">
        <CopyPastable text={JSON.stringify(json, null, 2)}/>
      </div>
    </div>
  );
};

const JSONToEnvVarForm = () => {
  const [text, setText] = useState('');
  const environmentVariables = getEnvironmentVariablesFromJSON(text);
  return (
    <div className="flex">
      <TextArea
        className="w-1/2"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Your JSON.."
      />
      <div className="w-1/2">
        <CopyPastable text={environmentVariables}/>
      </div>
    </div>
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
