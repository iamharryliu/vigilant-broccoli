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
  'grind-75-react': { platform: 'pages', name: 'grind-75-react' },
  'context-md': { platform: 'pages', name: 'context-md' },
  'project-overview': { platform: 'pages', name: 'project-overview' },
  'notepad-react': { platform: 'pages', name: 'notepad-react' },
  'text-tools-ui': { platform: 'pages', name: 'text-tools-ui' },
  'utilities-ui': { platform: 'pages', name: 'utilities-ui' },
  'bookmarks-react': { platform: 'pages', name: 'bookmarks-react' },
  'pomodoro-react': { platform: 'pages', name: 'pomodoro-react' },
  'waiting-games': { platform: 'pages', name: 'waiting-games' },
  'weather-next': { platform: 'vercel', name: 'weather-next' },
  balloono: { platform: 'vercel', name: 'balloono' },
  'gravity-guy': { platform: 'vercel', name: 'gravity-guy' },
  chat: { platform: 'vercel', name: 'chat' },
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
  'media-service': { platform: 'fly', name: 'media-service' },
  'email-service': { platform: 'fly', name: 'email-service' },
  'bucket-service': { platform: 'fly', name: 'bucket-service' },
  'email-subscription-service': {
    platform: 'fly',
    name: 'email-subscription-service',
  },
};

// Keep in sync with `vigilant_broccoli_domain` in infrastructure/terraform/variables.tf.
const VB_APP_DOMAIN = 'vigilant-broccoli.app';

const STAGING_HOSTS = {
  'personal-website-react': 'staging.harryliu.dev',
  'docs-md': 'staging-docs.harryliu.dev',
  'context-md': `staging-context.${VB_APP_DOMAIN}`,
  'project-overview': `staging-projects.${VB_APP_DOMAIN}`,
  'notepad-react': `staging-notepad.${VB_APP_DOMAIN}`,
  'utilities-ui': `staging-utilities.${VB_APP_DOMAIN}`,
  'bookmarks-react': `staging-bookmarks.${VB_APP_DOMAIN}`,
  'photography-react': 'staging-photography.harryliu.dev',
  'pomodoro-react': `staging-pomodoro.${VB_APP_DOMAIN}`,
  'waiting-games': `staging-waiting.${VB_APP_DOMAIN}`,
  'weather-next': `staging-weather.${VB_APP_DOMAIN}`,
  balloono: `staging-balloono.${VB_APP_DOMAIN}`,
  calendars: 'staging-calendar.harryliu.dev',
  whiteboard: `staging-whiteboard.${VB_APP_DOMAIN}`,
  'mobile-manager-next': 'staging-manager.harryliu.dev',
  findme: `staging-findme.${VB_APP_DOMAIN}`,
  hearth: 'staging-hearth.harryliu.dev',
  chat: 'staging-chat.harryliu.dev',
  'component-library': `staging-components.${VB_APP_DOMAIN}`,
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
