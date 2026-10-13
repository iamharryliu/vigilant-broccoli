import { execFileSync, execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { EMAIL_ADDRESS } from '@vigilant-broccoli/personal-common-js';

const NAME_TOKEN_PATTERN = /[a-z0-9][a-z0-9-]*/g;
const DECLARATION_PATHSPECS = [
  '*project.json',
  '*fly-configs/*.toml',
  '*wrangler-configs/*.toml',
  '*.tf',
];
const APPLY_FLAG = '--apply';
const FORCE_FLAG = '--force';
const REPORT_JSON_FLAG = '--report-json';
const REPORT_MD_FLAG = '--report-md';
const MAX_DELETIONS_WITHOUT_FORCE = 6;
const VERCEL_API = 'https://api.vercel.com';
const VERCEL_ORG_ID = 'team_K8XGLgKfYA0WKlMX80jaVSvg';
const VERCEL_PAGE_SIZE = 100;

interface Provider {
  name: string;
  list: () => Promise<string[]> | string[];
  destroy: (name: string) => Promise<void> | void;
}

const run = (command: string, args: string[]): string =>
  execFileSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  });

// Every name-shaped token in the files that deploy or attach a service counts
// as declared, so over-matching only ever protects a service. Any live
// service whose exact name appears in none of them is an orphan, whatever its
// prefix.
function listDeclaredNames(): Set<string> {
  const root = execSync('git rev-parse --show-toplevel', {
    encoding: 'utf8',
  }).trim();
  const files = execFileSync(
    'git',
    ['ls-files', '--', ...DECLARATION_PATHSPECS],
    {
      cwd: root,
      encoding: 'utf8',
    },
  )
    .split('\n')
    .filter(Boolean);
  return new Set(
    files.flatMap(
      file =>
        readFileSync(join(root, file), 'utf8')
          .toLowerCase()
          .match(NAME_TOKEN_PATTERN) ?? [],
    ),
  );
}

const cloudflarePages: Provider = {
  name: 'Cloudflare Pages',
  list: () =>
    (
      JSON.parse(
        run('npx', ['wrangler', 'pages', 'project', 'list', '--json']) || '[]',
      ) as { 'Project Name': string }[]
    ).map(project => project['Project Name']),
  destroy: name => {
    run('npx', ['wrangler', 'pages', 'project', 'delete', name, '--yes']);
  },
};

const flyApps: Provider = {
  name: 'Fly.io',
  list: () =>
    (
      JSON.parse(run('flyctl', ['apps', 'list', '--json'])) as {
        Name: string;
      }[]
    ).map(app => app.Name),
  destroy: name => {
    run('flyctl', ['apps', 'destroy', name, '--yes']);
  },
};

function vercelHeaders(): Record<string, string> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error('VERCEL_TOKEN is required.');
  return { Authorization: `Bearer ${token}` };
}

const vercelProjects: Provider = {
  name: 'Vercel',
  list: async () => {
    const names: string[] = [];
    let until: number | null | undefined;
    do {
      const url = `${VERCEL_API}/v9/projects?teamId=${VERCEL_ORG_ID}&limit=${VERCEL_PAGE_SIZE}${until ? `&until=${until}` : ''}`;
      const res = await fetch(url, { headers: vercelHeaders() });
      if (!res.ok) throw new Error(`Vercel list failed: ${res.status}`);
      const body = (await res.json()) as {
        projects: { name: string }[];
        pagination?: { next?: number | null };
      };
      names.push(...body.projects.map(project => project.name));
      until = body.pagination?.next;
    } while (until);
    return names;
  },
  destroy: async name => {
    const res = await fetch(
      `${VERCEL_API}/v9/projects/${name}?teamId=${VERCEL_ORG_ID}`,
      { method: 'DELETE', headers: vercelHeaders() },
    );
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  },
};

interface ProviderReport {
  provider: string;
  live: string[];
  declaredCount: number;
  orphans: string[];
  errors: string[];
  warnings: string[];
}

interface Report {
  generatedAt: string;
  commit: string;
  emailTo: string;
  declaredNameCount: number;
  providers: ProviderReport[];
}

async function inspectProvider(
  provider: Provider,
  declared: Set<string>,
): Promise<ProviderReport> {
  const report: ProviderReport = {
    provider: provider.name,
    live: [],
    declaredCount: 0,
    orphans: [],
    errors: [],
    warnings: [],
  };
  try {
    report.live = await provider.list();
  } catch (error) {
    report.errors.push(
      `Listing failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    return report;
  }
  if (report.live.length === 0) {
    report.warnings.push(
      'Listing returned no services; check the credentials.',
    );
  }
  report.orphans = report.live.filter(name => !declared.has(name));
  report.declaredCount = report.live.length - report.orphans.length;
  return report;
}

const renderList = (names: string[]) =>
  names.length ? names.map(name => `\`${name}\``).join(', ') : 'none';

function renderMarkdown(report: Report): string {
  const orphanTotal = report.providers.reduce(
    (sum, provider) => sum + provider.orphans.length,
    0,
  );
  const errorTotal = report.providers.reduce(
    (sum, provider) => sum + provider.errors.length,
    0,
  );
  return [
    '# Orphaned services report',
    '',
    `- Run: ${report.generatedAt}`,
    `- Commit: \`${report.commit}\``,
    `- Declared names scanned: ${report.declaredNameCount}`,
    `- Orphans: ${orphanTotal}`,
    `- Listing errors: ${errorTotal}`,
    '',
    '| Provider | Live | Declared | Orphans | Errors / warnings |',
    '| --- | --- | --- | --- | --- |',
    ...report.providers.map(
      provider =>
        `| ${provider.provider} | ${provider.live.length} | ${provider.declaredCount} | ${provider.orphans.length} | ${[...provider.errors, ...provider.warnings].join('; ') || 'none'} |`,
    ),
    '',
    ...report.providers.flatMap(provider => [
      `## ${provider.provider}`,
      '',
      `- Orphans: ${renderList(provider.orphans)}`,
      `- Live: ${renderList(provider.live)}`,
      '',
    ]),
  ].join('\n');
}

const flagValue = (args: string[], flag: string) => {
  const index = args.indexOf(flag);
  return index === -1 ? undefined : args[index + 1];
};

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes(APPLY_FLAG);
  const force = args.includes(FORCE_FLAG);
  const reportJsonPath = flagValue(args, REPORT_JSON_FLAG);
  const reportMdPath = flagValue(args, REPORT_MD_FLAG);

  const declared = listDeclaredNames();
  if (declared.size === 0) {
    throw new Error('No declared service names found; refusing to prune.');
  }

  const providers = [cloudflarePages, vercelProjects, flyApps];
  const providerReports = await Promise.all(
    providers.map(provider => inspectProvider(provider, declared)),
  );
  const report: Report = {
    generatedAt: new Date().toISOString(),
    commit: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(),
    emailTo: EMAIL_ADDRESS,
    declaredNameCount: declared.size,
    providers: providerReports,
  };
  const markdown = renderMarkdown(report);
  console.log(markdown);
  if (reportJsonPath) {
    writeFileSync(reportJsonPath, JSON.stringify(report, null, 2));
  }
  if (reportMdPath) writeFileSync(reportMdPath, markdown);

  const orphansByProvider = providers.map((provider, index) => ({
    provider,
    orphans: providerReports[index].orphans,
  }));
  const total = orphansByProvider.reduce(
    (sum, { orphans }) => sum + orphans.length,
    0,
  );

  if (!apply) {
    console.log(`Dry run: pass ${APPLY_FLAG} to delete ${total} orphan(s).`);
    return;
  }
  if (providerReports.some(({ errors }) => errors.length)) {
    throw new Error('A provider failed to list; refusing to delete.');
  }
  if (total > MAX_DELETIONS_WITHOUT_FORCE && !force) {
    throw new Error(
      `${total} orphans exceeds the limit of ${MAX_DELETIONS_WITHOUT_FORCE}; inspect the list and re-run with ${FORCE_FLAG}.`,
    );
  }

  const failures: string[] = [];
  for (const { provider, orphans } of orphansByProvider) {
    for (const name of orphans) {
      try {
        await provider.destroy(name);
        console.log(`Deleted ${provider.name} ${name}`);
      } catch (error) {
        failures.push(`${provider.name} ${name}`);
        console.error(`Failed to delete ${provider.name} ${name}:`, error);
      }
    }
  }
  if (failures.length) {
    throw new Error(`Failed to delete: ${failures.join(', ')}`);
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
