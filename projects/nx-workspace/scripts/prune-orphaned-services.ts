import { execFileSync, execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const NAME_TOKEN_PATTERN = /[a-z0-9][a-z0-9-]*/g;
const DECLARATION_PATHSPECS = [
  '*project.json',
  '*fly-configs/*.toml',
  '*wrangler-configs/*.toml',
  '*.tf',
];
const APPLY_FLAG = '--apply';
const FORCE_FLAG = '--force';
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

async function findOrphans(provider: Provider, declared: Set<string>) {
  const live = await provider.list();
  return live.filter(name => !declared.has(name));
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes(APPLY_FLAG);
  const force = args.includes(FORCE_FLAG);

  const declared = listDeclaredNames();
  if (declared.size === 0) {
    throw new Error('No declared service names found; refusing to prune.');
  }

  const providers = [cloudflarePages, vercelProjects, flyApps];
  const orphansByProvider = await Promise.all(
    providers.map(async provider => ({
      provider,
      orphans: await findOrphans(provider, declared),
    })),
  );
  const total = orphansByProvider.reduce(
    (sum, { orphans }) => sum + orphans.length,
    0,
  );

  orphansByProvider.forEach(({ provider, orphans }) =>
    console.log(
      `${provider.name}: ${orphans.length} orphan(s)${orphans.length ? ` — ${orphans.join(', ')}` : ''}`,
    ),
  );

  if (!apply) {
    console.log(`Dry run: pass ${APPLY_FLAG} to delete ${total} orphan(s).`);
    return;
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
