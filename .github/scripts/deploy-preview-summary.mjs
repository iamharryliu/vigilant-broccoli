import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const env = name => process.env[name] ?? '';
const escapeInline = text =>
  String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/[\\`*_[\]~|$]/g, '\\$&')
    .replace(/[\r\n]+/g, ' ');
const link = url => `[${url}](${url})`;

const event = env('GITHUB_EVENT_PATH')
  ? JSON.parse(readFileSync(env('GITHUB_EVENT_PATH'), 'utf8'))
  : {};
const prNumber = env('PR_NUMBER') || event.pull_request?.number;
const repoUrl = `${env('GITHUB_SERVER_URL') || 'https://github.com'}/${env('GITHUB_REPOSITORY')}`;
let pr = event.pull_request;
if (!pr && prNumber && env('GH_TOKEN')) {
  try {
    pr = JSON.parse(
      execFileSync(
        'gh',
        ['api', `repos/${env('GITHUB_REPOSITORY')}/pulls/${prNumber}`],
        { encoding: 'utf8' },
      ),
    );
  } catch {
    // Metadata lookup must not hide the deployment result on manual runs.
  }
}

const outcome = env('DEPLOY_OUTCOME');
const projects = env('DEPLOY_PROJECTS').split(',').filter(Boolean);
const result =
  outcome === 'success'
    ? 'Succeeded'
    : outcome === 'failure'
      ? 'Failed — any completed deployments are listed below'
      : outcome === 'cancelled'
        ? 'Cancelled'
        : env('CHECK_OUTCOME') === 'success' && !projects.length
          ? 'No applications require a preview deployment'
          : 'Deployment did not run — see the job steps';

const commit = env('PREVIEW_COMMIT');
const lines = [
  '## Preview deployments',
  '',
  '### PR details',
  '',
  `**Pull request:** [#${prNumber}](${repoUrl}/pull/${prNumber})${pr?.title ? ` · ${escapeInline(pr.title)}` : ''}`,
  ...(pr
    ? [
        `**Author:** ${escapeInline(pr.user.login)}`,
        `**PR branches:** ${escapeInline(pr.head.ref)} → ${escapeInline(pr.base.ref)}`,
      ]
    : []),
  `**Deployed ref:** ${escapeInline(env('PREVIEW_HEAD_REF'))}`,
  `**Commit:** [${commit.slice(0, 7)}](${repoUrl}/commit/${commit})`,
  `**Result:** ${result}`,
  '',
  '### Deployed apps (preview)',
  '',
];

const logPath = 'projects/nx-workspace/deploy.log';
const log = existsSync(logPath) ? readFileSync(logPath, 'utf8') : '';
const urls = [
  ...new Set(
    log.match(/https:\/\/[a-z0-9-]+\.preview-[a-z0-9-]+\.pages\.dev/g) ?? [],
  ),
];
const sites = new Map();
for (const url of urls) {
  const [deployment, site] = new URL(url).hostname.split('.');
  const links = sites.get(site) ?? {};
  links[deployment === env('PREVIEW_BRANCH') ? 'latest' : 'build'] = url;
  sites.set(site, links);
}

if (sites.size) {
  lines.push(
    [
      '| App | Latest (follows this PR) | This build (immutable) |',
      '| --- | --- | --- |',
      ...[...sites]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(
          ([site, urls]) =>
            `| ${site} | ${urls.latest ? link(urls.latest) : '—'} | ${urls.build ? link(urls.build) : '—'} |`,
        ),
    ].join('\n'),
    '',
    '_Apps are identified by their Cloudflare Pages project. Each immutable URL identifies a deployment; the commit is recorded separately in Cloudflare._',
  );
} else {
  lines.push(
    projects.length
      ? 'No deployment URLs were reported. See the deployment logs.'
      : result,
  );
}
const summary = lines.filter(Boolean).join('\n\n');
if (env('GITHUB_STEP_SUMMARY'))
  appendFileSync(env('GITHUB_STEP_SUMMARY'), `${summary}\n`);
else console.log(summary);
