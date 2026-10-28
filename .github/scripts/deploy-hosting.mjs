export const PLATFORM = {
  pages: name => `https://${name}.pages.dev`,
  vercel: name => `https://${name}.vercel.app`,
  fly: name => `https://${name}.fly.dev`,
};

export const PROJECT_HOSTING = {
  'cloud-8-skate-react': { platform: 'pages', name: 'cloud-8-skate-react' },
  'personal-website-react': {
    platform: 'pages',
    name: 'harryliu-dev-react',
  },
  'docs-md': { platform: 'pages', name: 'docs-md' },
  'context-md': { platform: 'pages', name: 'context-md' },
  'utilities-ui': { platform: 'pages', name: 'utilities-ui' },
  'bookmarks-react': { platform: 'pages', name: 'bookmarks-react' },
  'pomodoro-react': { platform: 'pages', name: 'pomodoro-react' },
  'waiting-games': { platform: 'pages', name: 'waiting-games' },
  'weather-next': { platform: 'vercel', name: 'weather-next' },
  balloono: { platform: 'vercel', name: 'balloono' },
  calendars: { platform: 'pages', name: 'calendars' },
  whiteboard: { platform: 'pages', name: 'whiteboard' },
  // Keep the deployed Vercel identity so summaries link to the existing projects.
  'mobile-manager-next': {
    platform: 'vercel',
    name: 'vb-manager-next-mobile',
  },
  findme: { platform: 'pages', name: 'findme' },
  hearth: { platform: 'vercel', name: 'hearth' },
  'employee-handler-ui': {
    platform: 'vercel',
    name: 'employee-handler-ui',
    environments: ['demo'],
  },
  'office-presence-ui': {
    platform: 'pages',
    name: 'office-presence-ui',
    environments: ['demo'],
  },
  'office-presence-service': {
    platform: 'fly',
    name: 'office-presence-service',
    environments: ['demo'],
  },
  'vb-express': { platform: 'fly', name: 'vb-express' },
  'llm-service': { platform: 'fly', name: 'llm-service' },
  'email-service': { platform: 'fly', name: 'email-service' },
  'bucket-service': { platform: 'fly', name: 'bucket-service' },
  'email-subscription-service': {
    platform: 'fly',
    name: 'email-subscription-service',
  },
};

const STAGING_HOSTS = {
  'personal-website-react': 'staging.harryliu.dev',
  'docs-md': 'staging-docs.harryliu.dev',
  'context-md': 'staging-context.harryliu.dev',
  'utilities-ui': 'staging-utilities.harryliu.dev',
  'bookmarks-react': 'staging-bookmarks.harryliu.dev',
  'pomodoro-react': 'staging-pomodoro.harryliu.dev',
  'waiting-games': 'staging-waiting.harryliu.dev',
  'weather-next': 'staging-weather.harryliu.dev',
  balloono: 'staging-balloono.harryliu.dev',
  calendars: 'staging-calendar.harryliu.dev',
  whiteboard: 'staging-whiteboard.harryliu.dev',
  'mobile-manager-next': 'staging-manager.harryliu.dev',
  findme: 'staging-findme.harryliu.dev',
  hearth: 'staging-hearth.harryliu.dev',
  'component-library': 'staging-components.harryliu.dev',
};

export const NO_URL = '—';

export const urlFor = (project, environment) => {
  const hosting = PROJECT_HOSTING[project];
  const hasEnvironment =
    hosting && (hosting.environments ?? [environment]).includes(environment);
  if (environment === 'staging' && STAGING_HOSTS[project]) {
    return `https://${STAGING_HOSTS[project]}`;
  }
  return hasEnvironment && environment
    ? PLATFORM[hosting.platform](`${environment}-${hosting.name}`)
    : null;
};

export const appRows = (projects, environment) =>
  projects.map(project => {
    const url = urlFor(project, environment);
    return `| ${project} | ${url ? `[${url}](${url})` : NO_URL} |`;
  });
