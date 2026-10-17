// Shared by the deploy summary scripts. Hostnames follow each platform's `<environment>-<name>` naming,
// so the table is derived rather than listing every app per environment.
// Projects with no public URL (noop deploys, the Sanity studio) show "—", as
// does a project outside the environments it is hosted in (employee-handler-ui
// only ships to Vercel as `demo`).

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
  'links-react': { platform: 'pages', name: 'links-react' },
  'waiting-games': { platform: 'pages', name: 'waiting-games' },
  'weather-next': { platform: 'vercel', name: 'weather-next' },
  balloono: { platform: 'vercel', name: 'balloono' },
  calendars: { platform: 'pages', name: 'calendars' },
  whiteboard: { platform: 'pages', name: 'whiteboard' },
  'vb-manager-next-mobile': {
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

export const NO_URL = '—';

export const urlFor = (project, environment) => {
  const hosting = PROJECT_HOSTING[project];
  const hasEnvironment =
    hosting && (hosting.environments ?? [environment]).includes(environment);
  return hasEnvironment && environment
    ? PLATFORM[hosting.platform](`${environment}-${hosting.name}`)
    : null;
};

export const appRows = (projects, environment) =>
  projects.map(project => {
    const url = urlFor(project, environment);
    return `| ${project} | ${url ? `[${url}](${url})` : NO_URL} |`;
  });
