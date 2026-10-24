// Appends a "| App | URL |" markdown table of the deployed nx projects to the
// job summary; see deploy-hosting.mjs for how URLs are derived.

import { appendFileSync } from 'node:fs';
import { appRows } from './deploy-hosting.mjs';

const projects = (process.env.DEPLOY_PROJECTS ?? '')
  .split(/[,\s]+/)
  .filter(Boolean);
const environment = process.env.DEPLOY_ENVIRONMENT ?? '';

const rows = appRows(projects, environment);

if (rows.length) {
  const title = `### Deployed apps${environment ? ` (${environment})` : ''}`;
  const table = [title, '', '| App | URL |', '| --- | --- |', ...rows, ''].join(
    '\n',
  );
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) appendFileSync(summaryPath, `${table}\n`);
  else console.log(table);
}
