import { spawn } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { createVaultClient, VAULT_SECRET_PATH } from './vault-client';

function parseEnvFileKeys(filePath: string): Set<string> {
  const content = readFileSync(filePath, 'utf-8');
  const keys = new Set<string>();
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=/);
    if (match) keys.add(match[1]);
  }
  return keys;
}

function parseArgs(argv: string[]) {
  const envFiles: string[] = [];
  const mappings: Array<{ from: string; to: string }> = [];
  const rest: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--env-file' && i + 1 < argv.length) {
      envFiles.push(argv[++i]);
    } else if (argv[i] === '--map' && i + 1 < argv.length) {
      const [from, to] = argv[++i].split(':');
      if (!from || !to) {
        console.error(`Error: --map expects SOURCE:TARGET, got "${argv[i]}"`);
        process.exit(1);
      }
      mappings.push({ from, to });
    } else {
      rest.push(argv[i]);
    }
  }

  return { envFiles, mappings, command: rest };
}

async function fetchSecrets(
  secretPath: string,
  allowedKeys?: Set<string>,
  mappings?: Array<{ from: string; to: string }>,
) {
  const vault = await createVaultClient();

  console.log(`Fetching secrets from Vault at ${secretPath}...`);

  const result = await vault.read(secretPath);
  const secrets = result.data.data || result.data || result;

  let injected = 0;
  for (const [key, value] of Object.entries(secrets)) {
    if (typeof value !== 'string') continue;
    if (allowedKeys && !allowedKeys.has(key)) continue;
    process.env[key] = value;
    injected++;
  }

  if (mappings && mappings.length > 0) {
    for (const { from, to } of mappings) {
      const value = (secrets as Record<string, unknown>)[from];
      if (typeof value !== 'string') {
        console.warn(`⚠ --map skipped: "${from}" not found in secrets`);
        continue;
      }
      process.env[to] = value;
      injected++;
      console.log(`✓ Mapped ${from} → ${to}`);
    }
  }

  console.log(`✓ Secrets fetched successfully`);
  console.log(
    `✓ Injected ${injected}/${Object.keys(secrets).length} secrets${allowedKeys ? ` (filtered by env file)` : ''}`,
  );

  return secrets;
}

async function fetchSecretsAndServe() {
  const { envFiles, mappings, command } = parseArgs(process.argv.slice(2));

  let allowedKeys: Set<string> | undefined;
  if (envFiles.length > 0) {
    allowedKeys = new Set();
    for (const envFile of envFiles) {
      if (!existsSync(envFile)) {
        console.error(`Error: env file not found: ${envFile}`);
        process.exit(1);
      }
      for (const key of parseEnvFileKeys(envFile)) allowedKeys.add(key);
    }
    for (const { from } of mappings) allowedKeys.add(from);
    console.log(
      `Using env files: ${envFiles.join(', ')} (${allowedKeys.size} keys)`,
    );
  }

  await fetchSecrets(VAULT_SECRET_PATH, allowedKeys, mappings);

  if (command.length > 0) {
    console.log(`\nStarting: ${command.join(' ')}\n`);

    const child = spawn(command[0], command.slice(1), {
      stdio: 'inherit',
      env: { ...process.env },
      shell: true,
    });

    child.on('exit', code => {
      process.exit(code || 0);
    });
  }
}

fetchSecretsAndServe();
