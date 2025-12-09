import { NextNavRoute } from '@vigilant-broccoli/next-lib';

export const APP_ROUTE: Record<string, NextNavRoute> = {
  INDEX: {
    title: 'Home',
    path: '/',
  },
  DEV_DASHBOARD: {
    title: 'Dev Dashboard',
    path: '/dev-dashboard',
  },
  TEXT_TOOLS: {
    title: 'Text Tools',
    path: '/text-tools',
  },
  SERVICES: {
    title: 'Service Management',
    path: '/service-management',
  },
  PASTE_BIN: {
    title: 'Paste Bin',
    path: '/paste-bin',
  },
  AI_TOOL: {
    title: 'LLM Tools',
    path: '/llm-tools',
  },
};
