import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layouts/GeneralPageLayout';
import IndexPage from './pages/IndexPage';
import ConditionalRenderPage from './pages/ConditionalRenderPage';
import ListsPage from './pages/ListsPage';
import PropsPage from './pages/PropsPage';
import HooksPage from './pages/Hooks/HooksPage';
import TodoPage from './pages/Todo/TodoPage';
import UseEffectDemo from './pages/Hooks/UseEffectDemo';
import UseStateDemo from './pages/Hooks/UseStateDemo';
import UseReducerDemo from './pages/Hooks/UseReducerDemo';
import UseRefDemo from './pages/Hooks/UseRef';

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="" element={<Layout />}>
            <Route index element={<IndexPage />} />
            <Route path="lists" element={<ListsPage />} />
            <Route
              path="conditional-render"
              element={<ConditionalRenderPage />}
            />
            <Route path="props" element={<PropsPage />} />
            <Route path="hooks" element={<HooksPage />} />
            <Route path="todo" element={<TodoPage />} />
            <Route path="hooks/useEffect" element={<UseEffectDemo />} />
            <Route path="hooks/useState" element={<UseStateDemo />} />
            <Route path="hooks/useReducer" element={<UseReducerDemo />} />
            <Route path="hooks/useRef" element={<UseRefDemo />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
