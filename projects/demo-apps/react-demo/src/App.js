import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layouts/GeneralPageLayout';
import IndexPage from './pages/IndexPage';
import ConditionalsPage from './pages/ConditionalsPage';
import ListsPage from './pages/ListsPage';
import PropsPage from './pages/PropsPage';
import HooksPage from './pages/HooksPage';

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<IndexPage />} />
            <Route path="hooks" element={<HooksPage />} />
            <Route path="conditionals" element={<ConditionalsPage />} />
            <Route path="lists" element={<ListsPage />} />
            <Route path="props" element={<PropsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
