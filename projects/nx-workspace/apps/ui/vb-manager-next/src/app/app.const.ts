import { NextNavRoute } from '@vigilant-broccoli/next-lib';
import { OPEN_TYPE } from '@vigilant-broccoli/common-js';

type ExtendedNavRoute = {
  title: string;
  path?: string;
  children?: NextNavRoute[];
};

export const APP_ROUTE: Record<string, ExtendedNavRoute> = {
  INDEX: {
    title: 'Home',
    path: '/',
  },
  CHATBOT: {
    title: 'Chatbot',
    path: '/chatbot',
  },
  KANBAN: {
    title: 'Kanban',
    path: '/kanban',
  },
  DEV_DASHBOARD: {
    title: 'Dev Dashboard',
    path: '/dev-dashboard',
  },
  EVENT_CALENDARS: {
    title: 'Event Calendars',
    path: '/event-calendars',
  },
  NOTEPAD: {
    title: 'Notepad',
    path: '/notepad',
  },
  LANGUAGE_LEARNING: {
    title: 'Language Learning',
    path: '/language-learning',
  },
  FEATURE_SANDBOX: {
    title: 'Feature Sandbox',
    path: '/feature-sandbox',
  },
  CAREER: {
    title: 'Career',
    path: '/career',
  },
};

export const APP_NAME = 'VB Manager';

export const PAGE_TITLE = {
  SETTINGS: 'Settings',
  LOGIN: 'Login',
  AUTH_CALLBACK: 'Signing In',
} as const;

const APP_ROUTE_SUBGROUP = 'vb-manager-next';

export const VIGILANT_BROCCOLI_ROOT_PATH = '~/vigilant-broccoli';

export const APP_ROUTE_QUICK_LINKS = Object.values(APP_ROUTE).flatMap(route => {
  if (route.children) {
    return route.children.map(child => ({
      label: child.title,
      target: child.path,
      type: OPEN_TYPE.INTERNAL,
      subgroup: APP_ROUTE_SUBGROUP,
    }));
  }
  if (route.path) {
    return [
      {
        label: route.title,
        target: route.path,
        type: OPEN_TYPE.INTERNAL,
        subgroup: APP_ROUTE_SUBGROUP,
      },
    ];
  }
  return [];
});
