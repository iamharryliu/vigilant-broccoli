// Writes the overall job summary for a deploy.yml run: header, a Job | Result
// table, then npm packages, apps, Supabase migrations and GitHub Pages. Runs
// from the always() notify-followers job, so it also renders when a job failed
// or was skipped; outputs are empty for jobs that never reached their check.

import { appendFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { appRows } from './deploy-hosting.mjs';

const env = name => process.env[name] ?? '';
const list = value => value.split(/[,\s]+/).filter(Boolean);
const escapeInline = text =>
  String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/[\\`*_[\]~|$]/g, '\\$&');

const environment = env('DEPLOY_ENVIRONMENT');
const repoUrl = `${env('GITHUB_SERVER_URL') || 'https://github.com'}/${env('GITHUB_REPOSITORY')}`;
const sha = env('COMMIT_SHA');
const commitMessage =
  env('COMMIT_MESSAGE').split('\n')[0] ||
  (() => {
    try {
      return execFileSync('git', ['log', '-1', '--format=%s', sha], {
        encoding: 'utf8',
      }).trim();
    } catch {
      return '';
    }
  })();

const FAILED = ['failure', 'cancelled'];
const jobs = {
  gitleaks: env('GITLEAKS_RESULT'),
  npm: env('NPM_RESULT'),
  apps: env('APPS_RESULT'),
  pages: env('PAGES_RESULT'),
};
const hasPackages = env('HAS_PACKAGES') === 'true';
const hasApps = env('HAS_APPS') === 'true';
const hasPages = env('HAS_PAGES') === 'true';
const packages = list(env('NPM_PACKAGES'));
const projects = list(env('APP_PROJECTS'));
const pageUrl = env('PAGE_URL');
const migrations = env('MIGRATIONS_OUTCOME');
const dispatch = env('DISPATCH_OUTCOME');

const display = (result, nothing, note) =>
  `${result || 'skipped'}${result === 'success' && nothing ? ` — ${note}` : ''}`;

const jobRows = [
  ['gitleaks', display(jobs.gitleaks)],
  [
    'npm packages',
    jobs.npm === 'skipped' && environment !== 'production'
      ? 'skipped — production only'
      : display(jobs.npm, !hasPackages, 'nothing to publish'),
  ],
  ['apps', display(jobs.apps, !hasApps, 'nothing affected')],
  [
    'GitHub Pages',
    jobs.pages === 'skipped'
      ? 'skipped — main only'
      : display(jobs.pages, !hasPages, 'nothing affected'),
  ],
  ['fanout dispatch', dispatch || 'skipped'],
];

const nothingToDeploy =
  !Object.values(jobs).some(result => FAILED.includes(result)) &&
  !(jobs.npm === 'success' && hasPackages) &&
  !(jobs.apps === 'success' && hasApps) &&
  !(jobs.pages === 'success' && hasPages);

const lines = [
  `## Deploy (${environment})`,
  '',
  `**Commit:** [${sha.slice(0, 7)}](${repoUrl}/commit/${sha}) · ${escapeInline(commitMessage)}`,
  `**Environment:** ${environment}`,
  `**Trigger:** ${env('GITHUB_EVENT_NAME')}`,
  '',
  '| Job | Result |',
  '| --- | --- |',
  ...jobRows.map(([job, result]) => `| ${job} | ${result} |`),
  '',
];

if (nothingToDeploy) lines.push('**Nothing to deploy.**', '');

if (packages.length) {
  const published = jobs.npm === 'success';
  lines.push(
    `### npm packages${published ? '' : ' (not published)'}`,
    '',
    ...packages.map(
      name => `- [${name}](https://www.npmjs.com/package/${name})`,
    ),
    '',
  );
}

if (hasApps && projects.length) {
  const partial = jobs.apps !== 'success';
  lines.push(
    `### ${partial ? 'Apps targeted' : 'Deployed apps'} (${environment})`,
    '',
    ...(partial
      ? [
          `_The apps job ended as ${jobs.apps || 'skipped'}; these are the targeted apps, and some may not have deployed._`,
          '',
        ]
      : []),
    '| App | URL |',
    '| --- | --- |',
    ...appRows(projects, environment),
    '',
  );
}

if (hasApps && migrations) {
  lines.push(`**Supabase migrations:** ${migrations}`, '');
}

if (pageUrl) {
  lines.push(`**GitHub Pages:** [${pageUrl}](${pageUrl})`, '');
}

const summary = lines.join('\n');
if (env('GITHUB_STEP_SUMMARY'))
  appendFileSync(env('GITHUB_STEP_SUMMARY'), `${summary}\n`);
else console.log(summary);
