import { TextPage } from './components/pages/TextPage';
import { IndexPage } from './components/pages/IndexPage';
import { JSONPage } from './components/pages/JSONPage';
import { ComponentDemoPage } from './components/pages/ComponentDemoPage';
import { AIDemoPage } from './components/pages/AIDemoPage';

export const APP_ROUTE = {
  INDEX: {
    title: 'Home',
    path: '/',
    component: IndexPage,
  },
  JSON: {
    title: 'JSON',
    path: '/json-tools',
    component: JSONPage,
  },
  TEXT: {
    title: 'Text Tools',
    path: '/text-tools',
    component: TextPage,
  },
  COMPONENT_LIBRARY: {
    title: 'Component Library',
    path: '/component-library',
    component: ComponentDemoPage,
  },
  AI_TOOL: {
    title: 'AI Tool',
    path: '/ai-tool',
    component: AIDemoPage,
  },
};
