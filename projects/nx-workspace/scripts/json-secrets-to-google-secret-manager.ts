import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import 'dotenv/config';

const REPLICATION_POLICY = 'automatic';

interface SecretsJson {
  [key: string]: string;
}

function parseArgs(): { jsonPath: string; project?: string; dryRun: boolean } {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.error(
      'Usage: npx tsx scripts/json-secrets-to-google-secret-manager.ts <json-file> [--project=<gcp-project>] [--dry-run]',
    );
    process.exit(1);
  }

  const jsonPath = args[0];
  const dryRun = args.includes('--dry-run');
  const projectArg = args.find(a => a.startsWith('--project='));
  const project = projectArg ? projectArg.split('=')[1] : undefined;

  return { jsonPath, project, dryRun };
}

function loadSecrets(jsonPath: string): SecretsJson {
  if (!existsSync(jsonPath)) {
    console.error(`Error: JSON file not found at ${jsonPath}`);
    process.exit(1);
  }

  const content = readFileSync(jsonPath, 'utf-8');
  const parsed = JSON.parse(content);

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    console.error(
      'Error: JSON file must contain a flat object of key/value pairs',
    );
    process.exit(1);
  }

  return parsed as SecretsJson;
}

function secretExists(name: string, project?: string): boolean {
  const projectFlag = project ? ` --project=${project}` : '';
  try {
    execSync(`gcloud secrets describe ${name}${projectFlag}`, {
      stdio: 'pipe',
    });
    return true;
  } catch {
    return false;
  }
}

function createSecret(name: string, project?: string): void {
  const projectFlag = project ? ` --project=${project}` : '';
  execSync(
    `gcloud secrets create ${name} --replication-policy=${REPLICATION_POLICY}${projectFlag}`,
    { stdio: 'pipe' },
  );
}

function addSecretVersion(name: string, value: string, project?: string): void {
  const projectFlag = project ? ` --project=${project}` : '';
  execSync(`gcloud secrets versions add ${name} --data-file=-${projectFlag}`, {
    input: value,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

function main(): void {
  const { jsonPath, project, dryRun } = parseArgs();

  console.log(`Loading secrets from ${jsonPath}...`);
  const secrets = loadSecrets(jsonPath);
  const entries = Object.entries(secrets).filter(
    ([, v]) => typeof v === 'string' && v.length > 0,
  );

  console.log(
    `Found ${entries.length} secrets to upload${project ? ` to project "${project}"` : ''}.`,
  );

  if (dryRun) {
    console.log('[DRY RUN] Would upload the following secret names:');
    entries.forEach(([k]) => console.log(`  - ${k}`));
    return;
  }

  let created = 0;
  let updated = 0;

  for (const [name, value] of entries) {
    const exists = secretExists(name, project);

    if (!exists) {
      console.log(`Creating secret "${name}"...`);
      createSecret(name, project);
      created++;
    } else {
      console.log(`Secret "${name}" exists, adding new version...`);
      updated++;
    }

    addSecretVersion(name, value, project);
  }

  console.log(`\nDone! Created: ${created}, Updated: ${updated}`);
}

main();
