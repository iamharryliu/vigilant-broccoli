// Writes a "## Redeploys" section into an agentic PR's body listing the apps
// deploy.yml will redeploy to staging once the PR merges. merge-pr-body.py keeps
// sections it does not own, so later agent edits leave this one in place.
import { execFileSync } from 'node:child_process';
import { appRows } from './deploy-hosting.mjs';

const HEADING = '## Redeploys';
// Inserted before the history table so the section stays with the PR's prose.
const ANCHOR = '## Agentic Change History';
const FOOTER = /^(🤖 )?Generated with \[/;

const env = name => process.env[name] ?? '';
const projects = env('DEPLOY_PROJECTS').split(',').filter(Boolean).sort();
const pullPath = `repos/${env('GITHUB_REPOSITORY')}/pulls/${env('PR_NUMBER')}`;

const content =
  env('DEPLOY_ALL') === 'true'
    ? 'Every app with a `deploy` target, because this PR changes `.github/workflows/deploy.yml`.'
    : projects.length
      ? [
          '| App | Staging URL |',
          '| --- | --- |',
          ...appRows(projects, 'staging'),
        ].join('\n')
      : 'None. No app with a `deploy` target is affected.';
const section = `${HEADING}\n\n${content}\n\n_Staging on merge to \`main\`; production deploys redeploy every app._`;

const body = execFileSync('gh', ['api', pullPath, '--jq', '.body // ""'], {
  encoding: 'utf8',
}).replace(/\n$/, '');
const lines = body ? body.split('\n') : [];
const isBoundary = line => line.startsWith('## ') || FOOTER.test(line);

let start = lines.indexOf(HEADING);
if (start !== -1) {
  let end = start + 1;
  while (end < lines.length && !isBoundary(lines[end])) end++;
  lines.splice(start, end - start);
} else {
  start = lines.indexOf(ANCHOR);
  if (start === -1) start = lines.findIndex(line => FOOTER.test(line));
  if (start === -1) start = lines.length;
}
const spacer = start > 0 && lines[start - 1] !== '' ? [''] : [];
lines.splice(start, 0, ...spacer, ...section.split('\n'), '');

const updated = lines.join('\n').trim();
if (updated === body.trim()) {
  console.log('Redeploys section already up to date.');
} else {
  execFileSync('gh', ['api', '-X', 'PATCH', pullPath, '-f', `body=${updated}`]);
  console.log(`Redeploys: ${projects.join(', ') || 'none'}`);
}
