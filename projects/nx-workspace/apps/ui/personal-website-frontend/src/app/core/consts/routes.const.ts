import { Route, Routes } from '@angular/router';
import { ENVIRONMENT } from '../../../environments/environment';
import { AboutPageComponent } from '../../components/pages/about-page/about.page';
import { HomePageComponent } from '../../components/pages/home-page/home.page';
import { LinkTreePageComponent } from '../../components/pages/link-tree-page/link-tree.page';
import { DocsMdPageComponent } from '../../docs-md/docs-md.page';
import { LeetCodePageComponent } from '../../leet-code/leet-code.page';
import { Link } from 'general-components';
import { ContactPageComponent } from '../../components/pages/contact-page/contact.page';
import { CareerPageComponent } from '../../components/pages/career-page/career.page';
import { ComponentLibraryPageComponent } from '../../components/pages/component-library-page/component-library.page';
import { URLS } from './urls.const';

export const DEFAULT_DESCRIPTION =
  'Harry Liu - Software developer, designer, and creator. Explore my portfolio, projects, and blog.';

export const INDEX_ROUTE: Route = {
  path: '',
  data: { title: 'home', description: DEFAULT_DESCRIPTION },
  component: HomePageComponent,
};

export const CAREER_ROUTE: Route = {
  path: 'career',
  data: {
    title: 'career',
    description: "Harry Liu's career experience and work history.",
  },
  component: CareerPageComponent,
};

export const DOCS_MD_ROUTE: Route = {
  path: 'docs-md',
  data: {
    title: 'DocsMD',
    description: 'Browse markdown documents and notes by Harry Liu.',
  },
  redirectTo: 'docs-md/',
  pathMatch: 'full',
};
export const DOCS_MD_FILE_ROUTE: Route = {
  path: 'docs-md/:markdownFilename',
  data: {
    title: 'DocsMD',
    description: 'Browse markdown documents and notes by Harry Liu.',
  },
  component: DocsMdPageComponent,
};

export const ABOUT_ROUTE: Route = {
  path: 'about',
  data: {
    title: 'about',
    description:
      'Learn more about Harry Liu - developer, designer, and creator.',
  },
  component: AboutPageComponent,
};

export const CONTACT_ROUTE: Route = {
  path: 'contact',
  data: {
    title: 'contact',
    description: 'Get in touch with Harry Liu.',
  },
  component: ContactPageComponent,
};

export const LINK_TREE_ROUTE: Route = {
  path: 'links',
  data: {
    title: 'link tree',
    description: "Harry Liu's links - social media, projects, and more.",
  },
  component: LinkTreePageComponent,
};

export const COMPONENT_LIBRARY_ROUTE: Route = {
  path: 'component-library',
  data: {
    title: 'component library',
    description: 'A showcase of reusable UI components by Harry Liu.',
  },
  component: ComponentLibraryPageComponent,
};

export const LEETCODE_ROUTE: Route = {
  path: 'grind-75',
  data: {
    title: 'grind 75',
    description: 'Grind 75 LeetCode solutions by Harry Liu.',
  },
  component: LeetCodePageComponent,
};
export const LEETCODE_SOLUTION_ROUTE: Route = {
  path: 'grind-75/:language/:filename',
  data: {
    title: 'grind75',
    description: 'Grind 75 LeetCode solutions by Harry Liu.',
  },
  component: LeetCodePageComponent,
};

export const ROUTES: Routes = [
  INDEX_ROUTE,
  ABOUT_ROUTE,
  CAREER_ROUTE,
  CONTACT_ROUTE,
  DOCS_MD_ROUTE,
  DOCS_MD_FILE_ROUTE,
  LINK_TREE_ROUTE,
  COMPONENT_LIBRARY_ROUTE,
  LEETCODE_ROUTE,
  LEETCODE_SOLUTION_ROUTE,
  {
    path: '**',
    redirectTo: '',
  },
];

const INDEX_PAGE: Link = {
  url: {
    internal: INDEX_ROUTE.path,
    external: ENVIRONMENT.APP_URL,
  },
  text: 'Home',
};

const ABOUT_PAGE: Link = {
  url: {
    internal: `/${ABOUT_ROUTE.path}`,
    external: `${ENVIRONMENT.APP_URL}/${ABOUT_ROUTE.path}`,
  },
  text: 'About',
};

const CONTACT_PAGE: Link = {
  url: {
    internal: `/${CONTACT_ROUTE.path}`,
    external: `${ENVIRONMENT.APP_URL}/${ABOUT_ROUTE.path}`,
  },
  text: 'Contact',
};

const LINK_TREE: Link = {
  url: {
    internal: `/${LINK_TREE_ROUTE.path}`,
    external: `${ENVIRONMENT.APP_URL}/${LINK_TREE_ROUTE.path}`,
  },
  text: 'Links',
};

const LINKEDIN: Link = {
  url: {
    external: URLS.LINKEDIN,
  },
  text: 'LinkedIn',
};

const KOFI: Link = {
  url: {
    external: URLS.KOFI,
  },
  text: 'Buy me a coffee? 🥺',
};

const GITHUB: Link = {
  url: {
    external: URLS.GITHUB,
  },
  text: 'Github',
};

const PERSONAL_INSTAGRAM: Link = {
  url: {
    external: URLS.PERSONAL_IG,
  },
  text: 'Personal Instagram',
};

const SECONDHAND_STORE_IG: Link = {
  url: {
    external: URLS.SECONDHAND_STORE_IG,
  },
  text: 'Secondhand Store harrysellsshit',
};

const SKATE_IG: Link = {
  url: {
    external: URLS.SKATE_IG,
  },
  text: 'Toronto City Skate',
};

const CLOUD8SKATE: Link = {
  url: {
    external: URLS.CLOUD8SKATE,
  },
  text: 'Cloud 8 Skate',
};

const CLOUD8SKATE_IG: Link = {
  url: {
    external: URLS.CLOUD8SKATE_IG,
  },
  text: 'Cloud 8 Skate Instagram',
};

const RESUME: Link = {
  url: {
    external: `${ENVIRONMENT.APP_URL}/assets/resume.pdf`,
  },
  text: 'Resume',
};

const DOCS_MD: Link = {
  url: {
    internal: `/${DOCS_MD_ROUTE.path}`,
    external: `${ENVIRONMENT.APP_URL}/${DOCS_MD_ROUTE.path}`,
  },
  text: 'DocsMD',
};

const INTERNAL_LINKS = {
  INDEX_PAGE,
  ABOUT_PAGE,
  CONTACT_PAGE,
  LINK_TREE,
  DOCS_MD,
};

const EXTERNAL_LINKS = {
  LINKEDIN,
  GITHUB,
  PERSONAL_INSTAGRAM,
  SECONDHAND_STORE_IG,
  SKATE_IG,
  CLOUD8SKATE,
  CLOUD8SKATE_IG,
  RESUME,
  KOFI,
};

export const LINKS = {
  ...INTERNAL_LINKS,
  ...EXTERNAL_LINKS,
};
