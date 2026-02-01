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
  AI_TOOL: {
    title: 'LLM Tools',
    path: '/llm-tools',
  },
  BUCKET_DEMO: {
    title: 'Bucket Demo',
    path: '/bucket-demo',
  },
  CHORES_DEMO: {
    title: 'Chores Demo',
    path: '/chores-demo',
  },

  DOCS_MD: {
    title: 'DocsMD',
    path: '/docs-md',
  },
  MESSAGING: {
    title: 'Messaging',
    path: '/messaging',
  },
  STRIPE_DEMO: {
    title: 'Stripe Demo',
    path: '/stripe-demo',
  },
};
