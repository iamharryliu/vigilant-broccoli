import { Route, Routes } from '@angular/router';
import { ENVIRONMENT } from '../../../environments/environment';
import { AboutPageComponent } from '../../components/pages/about-page/about.page';
import { HomePageComponent } from '../../components/pages/home-page/home.page';
import { LinkTreePageComponent } from '../../components/pages/link-tree-page/link-tree.page';
import { VerifyEmailSubscriptionPageComponent } from '../../components/pages/verify-email-subscription-page/verify-email-subscription.page';
import { DocsMdPageComponent } from '../../docs-md/docs-md.page';
import { ProjectsPageComponent } from '../../components/pages/projects-page/projects.page';
import { LeetCodePageComponent } from '../../leet-code/leet-code.page';
import { Link } from 'general-components';
import { BlogDirectoryComponent } from '../../blog-directory/blog-directory.component';
import { BlogComponent } from '../../blog/blog.component';
import { ContactPageComponent } from '../../components/pages/contact-page/contact.page';
import { CareerPageComponent } from '../../components/pages/career-page/career.page';
import { ResumeRedirectComponent } from '../../components/redirects/resume.redirect';

export const INDEX_ROUTE: Route = {
  path: '',
  data: { title: 'home' },
  component: HomePageComponent,
};

export const CAREER_ROUTE: Route = {
  path: 'career',
  data: { title: 'career' },
  component: CareerPageComponent,
};

export const RESUME_ROUTE: Route = {
  path: 'resume',
  data: { title: 'resume' },
  component: ResumeRedirectComponent,
};

export const DOCS_MD_ROUTE: Route = {
  path: 'docs-md',
  data: { title: 'DocsMD' },
  redirectTo: 'docs-md/',
  pathMatch: 'full',
};
export const DOCS_MD_FILE_ROUTE: Route = {
  path: 'docs-md/:markdownFilename',
  data: { title: 'DocsMD' },
  component: DocsMdPageComponent,
};

export const BLOG_DIRECTORY_ROUTE: Route = {
  path: 'blogs',
  data: { title: 'blogs' },
  component: BlogDirectoryComponent,
};

export const BLOG_ROUTE: Route = {
  path: 'blogs/:date/:type/:filename',
  data: { title: 'blog' },
  component: BlogComponent,
};

export const ABOUT_ROUTE: Route = {
  path: 'about',
  data: { title: 'about' },
  component: AboutPageComponent,
};

export const CONTACT_ROUTE: Route = {
  path: 'contact',
  data: { title: 'contact' },
  component: ContactPageComponent,
};

export const LINK_TREE_ROUTE: Route = {
  path: 'links',
  data: { title: ' link tree' },
  component: LinkTreePageComponent,
};

export const PROJECTS_PAGE_ROUTE: Route = {
  path: '',
  component: ProjectsPageComponent,
};

export const PROJECTS_ROUTE: Route = {
  path: 'projects',
  data: { title: 'projects' },
  children: [PROJECTS_PAGE_ROUTE],
};

export const VERIFY_EMAIL_ROUTE: Route = {
  path: 'verify-email-subscription',
  data: { title: 'verify email sub' },
  component: VerifyEmailSubscriptionPageComponent,
};

export const LEETCODE_ROUTE: Route = {
  path: 'grind-75',
  data: { title: 'grind 75' },
  component: LeetCodePageComponent,
};
export const LEETCODE_SOLUTION_ROUTE: Route = {
  path: 'grind-75/:language/:filename',
  data: { title: 'grind75' },
  component: LeetCodePageComponent,
};

export const ROUTES: Routes = [
  INDEX_ROUTE,
  ABOUT_ROUTE,
  CAREER_ROUTE,
  RESUME_ROUTE,
  CONTACT_ROUTE,
  PROJECTS_ROUTE,
  DOCS_MD_ROUTE,
  BLOG_DIRECTORY_ROUTE,
  BLOG_ROUTE,
  DOCS_MD_FILE_ROUTE,
  LINK_TREE_ROUTE,
  VERIFY_EMAIL_ROUTE,
  PROJECTS_PAGE_ROUTE,
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
    external: ENVIRONMENT.URLS.PERSONAL_WEBSITE_FRONTEND_URL,
  },
  text: 'Home',
};

const ABOUT_PAGE: Link = {
  url: {
    internal: `/${ABOUT_ROUTE.path}`,
    external: `${ENVIRONMENT.URLS.PERSONAL_WEBSITE_FRONTEND_URL}/${ABOUT_ROUTE.path}`,
  },
  text: 'About',
};

const CONTACT_PAGE: Link = {
  url: {
    internal: `/${CONTACT_ROUTE.path}`,
    external: `${ENVIRONMENT.URLS.PERSONAL_WEBSITE_FRONTEND_URL}/${ABOUT_ROUTE.path}`,
  },
  text: 'Contact',
};

const PROJECTS_PAGE: Link = {
  url: {
    internal: `/${PROJECTS_ROUTE.path}`,
    external: `${ENVIRONMENT.URLS.PERSONAL_WEBSITE_FRONTEND_URL}/${PROJECTS_ROUTE.path}`,
  },
  text: 'Projects',
};

const LINK_TREE: Link = {
  url: {
    internal: `/${LINK_TREE_ROUTE.path}`,
    external: `${ENVIRONMENT.URLS.PERSONAL_WEBSITE_FRONTEND_URL}/${LINK_TREE_ROUTE.path}`,
  },
  text: 'Links',
};

const LINKEDIN: Link = {
  url: {
    external: ENVIRONMENT.URLS.LINKEDIN,
  },
  text: 'LinkedIn',
};

const KOFI: Link = {
  url: {
    external: ENVIRONMENT.URLS.KOFI,
  },
  text: 'Buy me a coffee? 🥺',
};

const GITHUB: Link = {
  url: {
    external: ENVIRONMENT.URLS.GITHUB,
  },
  text: 'Github',
};

const PERSONAL_INSTAGRAM: Link = {
  url: {
    external: ENVIRONMENT.URLS.PERSONAL_IG,
  },
  text: 'Personal Instagram',
};

const SECONDHAND_STORE_IG: Link = {
  url: {
    external: ENVIRONMENT.URLS.SECONDHAND_STORE_IG,
  },
  text: 'Secondhand Store harrysellsshit',
};

const SKATE_IG: Link = {
  url: {
    external: ENVIRONMENT.URLS.SKATE_IG,
  },
  text: 'Toronto City Skate',
};

const RESUME: Link = {
  url: {
    external: `${ENVIRONMENT.URLS.PERSONAL_WEBSITE_FRONTEND_URL}/${RESUME_ROUTE.path}`,
  },
  text: 'Resume',
};

const DOCS_MD: Link = {
  url: {
    internal: `/${DOCS_MD_ROUTE.path}`,
    external: `${ENVIRONMENT.URLS.PERSONAL_WEBSITE_FRONTEND_URL}/${DOCS_MD_ROUTE.path}`,
  },
  text: 'DocsMD',
};

const BLOGS: Link = {
  url: {
    internal: `/${BLOG_DIRECTORY_ROUTE.path}`,
    external: `${ENVIRONMENT.URLS.PERSONAL_WEBSITE_FRONTEND_URL}/${BLOG_DIRECTORY_ROUTE.path}`,
  },
  text: 'Blog',
};
const INTERNAL_LINKS = {
  INDEX_PAGE,
  ABOUT_PAGE,
  CONTACT_PAGE,
  LINK_TREE,
  PROJECTS_PAGE,
  DOCS_MD,
  BLOGS,
};

const EXTERNAL_LINKS = {
  LINKEDIN,
  GITHUB,
  PERSONAL_INSTAGRAM,
  SECONDHAND_STORE_IG,
  SKATE_IG,
  RESUME,
  KOFI,
};

export const LINKS = {
  ...INTERNAL_LINKS,
  ...EXTERNAL_LINKS,
};
