import { NextNavRoute } from '@vigilant-broccoli/next-lib';

export const APP_ROUTE: Record<string, NextNavRoute> = {
  INDEX: {
    title: 'Home',
    path: '/',
  },
  TEXT_TOOLS: {
    title: 'Text Tools',
    path: '/text-tools',
  },
  AI_TOOL: {
    title: 'AI Tool',
    path: '/ai-tool',
  },
};