import React, { createContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layouts/GeneralPageLayout';
import IndexPage from './pages/IndexPage';
import ConditionalsPage from './pages/ConditionalsPage';
import ListsPage from './pages/ListsPage';
import PropsPage from './pages/PropsPage';

const AppContext = createContext();
const INITIAL_CONTEXT = { key: 'value' };

function App() {
  // Hooks
  const [data, setData] = useState(INITIAL_CONTEXT);
  const handleButtonClick = () => {
    setData(previousData => {
      return { ...previousData, newKey: 'newValue!' };
    });
  };
  const resetContext = () => {
    setData(INITIAL_CONTEXT);
  };
  useEffect(() => {
    console.log('something happened to the data');
  }, [data]);

  return (
    <>
      <AppContext.Provider value={data}>
        <h1>React Demo</h1>
        <h3>Hooks</h3>
        Context:
        <pre>{JSON.stringify(data, null, 2)}</pre>
        <button onClick={() => handleButtonClick()}>Update Context</button>
        <button onClick={() => resetContext()}>Reset Context</button>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<IndexPage />} />
              <Route path="conditionals" element={<ConditionalsPage />} />
              <Route path="lists" element={<ListsPage />} />
              <Route path="props" element={<PropsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppContext.Provider>
    </>
  );
}

export default App;
