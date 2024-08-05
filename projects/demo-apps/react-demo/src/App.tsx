import { BrowserRouter, Routes, Route } from 'react-router-dom';
import IndexPage from './pages/IndexPage';
import HooksPage from './pages/hooks/HooksPage';
import TodoPage from './pages/todo/TodoPage';
import UseEffectDemo from './pages/hooks/UseEffectDemo';
import UseStateDemo from './pages/hooks/UseStateDemo';
import UseReducerDemo from './pages/hooks/UseReducerDemo';
import UseRefDemo from './pages/hooks/UseRef';
import SessionManagementPage from './pages/session-management/SessionManagementPage';
import LoginPage from './pages/session-management/LoginPage';
import RegisterPage from './pages/session-management/RegisterPage';
import StatusPage from './pages/session-management/StatusPage';
import PathNotFoundPage from './pages/PathNotFoundPage';
import Layout from './components/layouts/GeneralPageLayout';

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="" element={<Layout />}>
            <Route index element={<IndexPage />} />
            <Route path="session" element={<SessionManagementPage />} />
            <Route path="session/login_status" element={<StatusPage />} />
            <Route path="session/login" element={<LoginPage />} />
            <Route path="session/register" element={<RegisterPage />} />
            <Route path="hooks" element={<HooksPage />} />
            <Route path="hooks/useEffect" element={<UseEffectDemo />} />
            <Route path="hooks/useState" element={<UseStateDemo />} />
            <Route path="hooks/useReducer" element={<UseReducerDemo />} />
            <Route path="hooks/useRef" element={<UseRefDemo />} />
            <Route path="todo" element={<TodoPage />} />
            <Route path="*" element={<PathNotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
