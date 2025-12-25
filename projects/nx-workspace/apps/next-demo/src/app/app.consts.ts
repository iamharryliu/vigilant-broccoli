import { NextNavRoute } from '@vigilant-broccoli/next-lib';

export const APP_ROUTE: Record<string, NextNavRoute> = {
  INDEX: {
    title: 'Home',
    path: '/',
  },
  COMPONENT_LIBRARY: {
    title: 'Component Library',
    path: '/component-library',
  },
  BUCKET_DEMO: {
    title: 'Bucket Demo',
    path: '/bucket-demo',
  },
};
