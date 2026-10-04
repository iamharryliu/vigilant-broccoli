import { createVaultClient, VAULT_SECRET_PATH } from './vault-client';

// Matches VERCEL_ORG_ID in every app's deploy / deploy:production target
// (project.json) — a non-secret team id, hardcoded the same way there.
const VERCEL_ORG_ID = 'team_K8XGLgKfYA0WKlMX80jaVSvg';

// Vercel returns this when the domain is already attached to the project
// being requested — the sync is then already done, not an error.
const ALREADY_ASSIGNED_ERROR_CODE = 'domain_already_in_use';

async function getVercelToken(): Promise<string> {
  if (process.env.VERCEL_TOKEN) return process.env.VERCEL_TOKEN;

  const vault = await createVaultClient();
  const result = await vault.read(VAULT_SECRET_PATH);
  const secrets = result.data.data || result.data || result;
  const token = (secrets as Record<string, string>).VERCEL_TOKEN;
  if (!token) {
    throw new Error('VERCEL_TOKEN not found in Vault or environment.');
  }
  return token;
}

async function addDomain(
  projectName: string,
  domain: string,
  token: string,
): Promise<void> {
  const res = await fetch(
    `https://api.vercel.com/v9/projects/${projectName}/domains?teamId=${VERCEL_ORG_ID}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: domain }),
    },
  );
  if (res.ok) {
    console.log(`✓ ${domain} -> ${projectName}`);
    return;
  }

  const body = (await res.json().catch(() => ({}))) as {
    error?: { code?: string };
  };
  if (body.error?.code === ALREADY_ASSIGNED_ERROR_CODE) {
    console.log(`✓ ${domain} -> ${projectName} (already attached)`);
    return;
  }

  console.warn(
    `⚠ Failed to attach ${domain} to ${projectName}: ${res.status} ${JSON.stringify(body)}`,
  );
}

async function main() {
  const [command, projectName, domain] = process.argv.slice(2);

  if (command !== 'add' || !projectName || !domain) {
    console.error(
      'Usage: npx tsx scripts/vercel-domains.ts add <project-name> <domain>',
    );
    process.exit(1);
  }

  const token = await getVercelToken();
  await addDomain(projectName, domain, token);
}

main().catch(err => {
  console.error('Failed to sync Vercel domain.', err);
  process.exit(1);
});
