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
  JOB_POSTINGS: {
    value: 'job-postings',
    path: '/job-postings',
    titleKey: 'NAV.JOB_POSTINGS',
  },
  SKILLS: { value: 'skills', path: '/skills', titleKey: 'NAV.SKILLS' },
  SKILLS_GLOSSARY: {
    value: 'skills-glossary',
    path: '/skills/glossary',
    titleKey: 'NAV.GLOSSARY',
  },
  NOTES: { value: 'notes', path: '/notes', titleKey: 'NAV.NOTES' },
  TASKS: { value: 'tasks', path: '/tasks', titleKey: 'NAV.TASKS' },
  RUNS: { value: 'runs', path: '/runs', titleKey: 'NAV.RUNS' },
  WORKFLOW: {
    value: 'workflow',
    path: '/workflow',
    titleKey: 'NAV.WORKFLOW',
  },
  SETTINGS: { value: 'settings', path: '/settings', titleKey: 'NAV.SETTINGS' },
} as const;

export const SKILLS_GRAPH_PATH = `${APP_TAB.SKILLS.path}/graph`;

export type AppTab = (typeof APP_TAB)[keyof typeof APP_TAB]['value'];

const APP_TABS = Object.values(APP_TAB);

export const toTab = (value: string | null) =>
  APP_TABS.find(tab => tab.value === value) ?? APP_TAB.APPLICATIONS;

// A page below a tab's path (`/skills/graph`) belongs to that tab.
export const toTabFromPath = (pathname: string) =>
  APP_TABS.find(tab => tab.path === pathname) ??
  APP_TABS.find(
    tab => tab.path !== ROOT_PATH && pathname.startsWith(`${tab.path}/`),
  ) ??
  APP_TAB.APPLICATIONS;

export const ROOT_PATH = APP_TAB.APPLICATIONS.path;
export const RUNS_TAB_URL = APP_TAB.RUNS.path;

export const EXPAND_PARAM = 'expand';
export const EXPAND_LATEST = 'latest';
