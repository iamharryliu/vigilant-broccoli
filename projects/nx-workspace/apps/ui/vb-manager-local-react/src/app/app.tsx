import { Navigate, Route, Routes } from 'react-router-dom';
import { NOTEPAD_ROUTE, SIDEBAR_ROUTE } from './app.const';
import MainLayout from './layouts/main.layout';
import AuthCallbackPage from './pages/auth-callback.page';
import CalendarPage from './pages/calendar.page';
import CareerPage from './pages/career.page';
import ChatbotPage from './pages/chatbot.page';
import DevDashboardPage from './pages/dev-dashboard.page';
import GithubOrganizationPage from './pages/github-organization.page';
import HomePage from './pages/home.page';
import KanbanPage from './pages/kanban.page';
import LanguageLearningPage from './pages/language-learning.page';
import LoginPage from './pages/login.page';
import NotepadPage from './pages/notepad.page';
import PastebinPage from './pages/pastebin.page';
import SettingsPage from './pages/settings.page';

const ROUTE_PATH = {
  GITHUB_ORGANIZATION: '/github-manager/organization/:organizationName',
  SETTINGS: '/settings',
  LOGIN: '/login',
  AUTH_CALLBACK: '/auth/callback',
  NOT_FOUND: '*',
} as const;

export const App = () => (
  <Routes>
    <Route path={ROUTE_PATH.LOGIN} element={<LoginPage />} />
    <Route path={ROUTE_PATH.AUTH_CALLBACK} element={<AuthCallbackPage />} />
    <Route element={<MainLayout />}>
      <Route path={SIDEBAR_ROUTE.INDEX.path} element={<HomePage />} />
      <Route path={SIDEBAR_ROUTE.KANBAN.path} element={<KanbanPage />} />
      <Route
        path={SIDEBAR_ROUTE.DEV_DASHBOARD.path}
        element={<DevDashboardPage />}
      />
      <Route path={SIDEBAR_ROUTE.PASTEBIN.path} element={<PastebinPage />} />
      <Route path={SIDEBAR_ROUTE.CHATBOT.path} element={<ChatbotPage />} />
      <Route path={SIDEBAR_ROUTE.CALENDAR.path} element={<CalendarPage />} />
      <Route
        path={SIDEBAR_ROUTE.LANGUAGE_LEARNING.path}
        element={<LanguageLearningPage />}
      />
      <Route path={SIDEBAR_ROUTE.CAREER.path} element={<CareerPage />} />
      <Route path={NOTEPAD_ROUTE.path} element={<NotepadPage />} />
      <Route path={ROUTE_PATH.SETTINGS} element={<SettingsPage />} />
      <Route
        path={ROUTE_PATH.GITHUB_ORGANIZATION}
        element={<GithubOrganizationPage />}
      />
      <Route
        path={ROUTE_PATH.NOT_FOUND}
        element={<Navigate to={SIDEBAR_ROUTE.INDEX.path} replace />}
      />
    </Route>
  </Routes>
);
