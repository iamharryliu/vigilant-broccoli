import { CAREER_FILE_KIND } from './constants/career';

export const APP_TAB = {
  APPLICATIONS: { value: 'applications', titleKey: 'NAV.APPLICATIONS' },
  CAREER_EXPERIENCE: {
    value: CAREER_FILE_KIND.CAREER_EXPERIENCE,
    titleKey: 'NAV.CAREER_EXPERIENCE',
  },
  RESUME: { value: CAREER_FILE_KIND.RESUME, titleKey: 'NAV.RESUME' },
  RUNS: { value: 'runs', titleKey: 'NAV.RUNS' },
} as const;

export type AppTab = (typeof APP_TAB)[keyof typeof APP_TAB]['value'];

const APP_TABS = Object.values(APP_TAB);

export const toTab = (value: string | null) =>
  APP_TABS.find(tab => tab.value === value) ?? APP_TAB.APPLICATIONS;

export const TAB_PARAM = 'tab';
export const ROOT_PATH = '/';
export const RUNS_TAB_URL = `${ROOT_PATH}?${TAB_PARAM}=${APP_TAB.RUNS.value}`;

export const EXPAND_PARAM = 'expand';
export const EXPAND_LATEST = 'latest';
