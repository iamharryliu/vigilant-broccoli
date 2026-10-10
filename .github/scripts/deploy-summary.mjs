// Appends a "| App | URL |" markdown table of the deployed nx projects to the
// job summary. Hostnames follow each platform's `<environment>-<name>` naming,
// so the table is derived rather than listing every app per environment.
// Projects with no public URL (noop deploys, the Sanity studio) show "—", as
// does a project outside the environments it is hosted in (employee-handler-ui
// only ships to Vercel as `demo`).

import { appendFileSync } from 'node:fs';

const PLATFORM = {
  pages: name => `https://${name}.pages.dev`,
  vercel: name => `https://${name}.vercel.app`,
  fly: name => `https://${name}.fly.dev`,
};

const PROJECT_HOSTING = {
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
  whiteboard: { platform: 'vercel', name: 'whiteboard' },
  'vb-manager-next-mobile': {
    platform: 'vercel',
    name: 'vb-manager-next-mobile',
  },
  findme: { platform: 'vercel', name: 'findme' },
  hearth: { platform: 'vercel', name: 'hearth' },
  'employee-handler-ui': {
    platform: 'vercel',
    name: 'employee-handler-ui',
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

const NO_URL = '—';

const projects = (process.env.DEPLOY_PROJECTS ?? '')
  .split(/[,\s]+/)
  .filter(Boolean);
const environment = process.env.DEPLOY_ENVIRONMENT ?? '';

const urlFor = project => {
  const hosting = PROJECT_HOSTING[project];
  const hasEnvironment =
    hosting && (hosting.environments ?? [environment]).includes(environment);
  return hasEnvironment && environment
    ? PLATFORM[hosting.platform](`${environment}-${hosting.name}`)
    : null;
};

const rows = projects.map(project => {
  const url = urlFor(project);
  return `| ${project} | ${url ? `[${url}](${url})` : NO_URL} |`;
});

if (rows.length) {
  const title = `### Deployed apps${environment ? ` (${environment})` : ''}`;
  const table = [title, '', '| App | URL |', '| --- | --- |', ...rows, ''].join(
    '\n',
  );
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) appendFileSync(summaryPath, `${table}\n`);
  else console.log(table);
}
