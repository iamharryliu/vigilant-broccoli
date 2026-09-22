import { NextNavRoute } from '@vigilant-broccoli/next-lib';
import { OPEN_TYPE } from '@vigilant-broccoli/common-js';

type ExtendedNavRoute = {
  title: string;
  path?: string;
  children?: NextNavRoute[];
};

export const NOTEPAD_ROUTE: ExtendedNavRoute = {
  title: 'Notepad',
  path: '/notepad',
};

export const SIDEBAR_ROUTE = {
  INDEX: {
    title: 'Home',
    path: '/',
  },
  KANBAN: {
    title: 'Kanban',
    path: '/kanban',
  },
  DEV_DASHBOARD: {
    title: 'Dev Dashboard',
    path: '/dev-dashboard',
  },
  PASTEBIN: {
    title: 'Pastebin',
    path: '/pastebin',
  },
  CHATBOT: {
    title: 'Chatbot',
    path: '/chatbot',
  },
  EVENT_CALENDARS: {
    title: 'Event Calendars',
    path: '/event-calendars',
  },
  LANGUAGE_LEARNING: {
    title: 'Language Learning',
    path: '/language-learning',
  },
  CAREER: {
    title: 'Career',
    path: '/career',
  },
} satisfies Record<string, ExtendedNavRoute>;

export const APP_NAME = 'VB Manager';

export const PAGE_TITLE = {
  SETTINGS: 'Settings',
  LOGIN: 'Login',
  AUTH_CALLBACK: 'Signing In',
} as const;

const APP_ROUTE_SUBGROUP = 'vb-manager-next';

export const VIGILANT_BROCCOLI_ROOT_PATH = '~/vigilant-broccoli';

export const APP_ROUTE_QUICK_LINKS = (
  [...Object.values(SIDEBAR_ROUTE), NOTEPAD_ROUTE] as ExtendedNavRoute[]
).flatMap(route => {
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
