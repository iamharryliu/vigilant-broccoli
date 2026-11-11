import { CAREER_FILE_KIND } from './constants/career';

export const APP_TAB = {
  APPLICATIONS: {
    value: 'applications',
    path: '/',
    titleKey: 'NAV.APPLICATIONS',
  },
  CAREER_EXPERIENCE: {
    value: CAREER_FILE_KIND.CAREER_EXPERIENCE,
    path: `/${CAREER_FILE_KIND.CAREER_EXPERIENCE}`,
    titleKey: 'NAV.CAREER_EXPERIENCE',
  },
  RESUME: {
    value: CAREER_FILE_KIND.RESUME,
    path: `/${CAREER_FILE_KIND.RESUME}`,
    titleKey: 'NAV.RESUME',
  },
  NOTES: { value: 'notes', path: '/notes', titleKey: 'NAV.NOTES' },
  TASKS: { value: 'tasks', path: '/tasks', titleKey: 'NAV.TASKS' },
  RUNS: { value: 'runs', path: '/runs', titleKey: 'NAV.RUNS' },
  SETTINGS: { value: 'settings', path: '/settings', titleKey: 'NAV.SETTINGS' },
} as const;

export type AppTab = (typeof APP_TAB)[keyof typeof APP_TAB]['value'];

const APP_TABS = Object.values(APP_TAB);

export const toTab = (value: string | null) =>
  APP_TABS.find(tab => tab.value === value) ?? APP_TAB.APPLICATIONS;

export const toTabFromPath = (pathname: string) =>
  APP_TABS.find(tab => tab.path === pathname) ?? APP_TAB.APPLICATIONS;

export const ROOT_PATH = APP_TAB.APPLICATIONS.path;
export const RUNS_TAB_URL = APP_TAB.RUNS.path;

export const EXPAND_PARAM = 'expand';
export const EXPAND_LATEST = 'latest';
