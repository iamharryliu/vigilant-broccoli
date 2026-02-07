import { NextNavRoute } from '@vigilant-broccoli/next-lib';
import { OPEN_TYPE } from '@vigilant-broccoli/common-js';

type ExtendedNavRoute = {
  title: string;
  path?: string;
  children?: NextNavRoute[];
};

const DEMO_ROUTES = {
  BUCKET_DEMO: {
    title: 'Bucket Demo',
    path: '/bucket-demo',
  },
  CHORES_DEMO: {
    title: 'Chores Demo',
    path: '/chores-demo',
  },
  STRIPE_DEMO: {
    title: 'Stripe Demo',
    path: '/stripe-demo',
  },
  MESSAGING: {
    title: 'Messaging Demo',
    path: '/messaging',
  },
};

export const APP_ROUTE: Record<string, ExtendedNavRoute> = {
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
  DOCS_MD: {
    title: 'DocsMD',
    path: '/docs-md',
  },
  DEMOS: {
    title: 'Demos',
    children: Object.values(DEMO_ROUTES),
  },
};

const APP_ROUTE_SUBGROUP = 'vb-manager-next';

export const APP_ROUTE_QUICK_LINKS = Object.values(APP_ROUTE)
  .flatMap(route => {
    if (route.children) {
      return route.children.map(child => ({
        label: child.title,
        target: child.path,
        type: OPEN_TYPE.INTERNAL,
        subgroup: APP_ROUTE_SUBGROUP,
      }));
    }
    if (route.path) {
      return [{
        label: route.title,
        target: route.path,
        type: OPEN_TYPE.INTERNAL,
        subgroup: APP_ROUTE_SUBGROUP,
      }];
    }
    return [];
  });
