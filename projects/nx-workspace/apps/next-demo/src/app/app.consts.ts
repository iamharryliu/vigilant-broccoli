import { NextNavRoute } from '@vigilant-broccoli/next-lib';

export const APP_ROUTE: Record<string, NextNavRoute> = {
  INDEX: {
    title: 'Home',
    path: '/',
  },
  TEXT: {
    title: 'Text Tools',
    path: '/text-tools',
  },
  COMPONENT_LIBRARY: {
    title: 'Component Library',
    path: '/component-library',
  },
  AI_TOOL: {
    title: 'AI Tool',
    path: '/ai-tool',
  },
};
