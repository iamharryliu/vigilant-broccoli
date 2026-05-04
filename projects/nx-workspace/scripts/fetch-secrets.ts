import { spawn } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { getVaultToken } from './gcp-vault-token';

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
  let envFile: string | undefined;
  const rest: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--env-file' && i + 1 < argv.length) {
      envFile = argv[++i];
    } else {
      rest.push(argv[i]);
    }
  }

  return { envFile, command: rest };
}

async function fetchSecrets(
  vaultAddr: string,
  secretPath: string,
  certs?: string,
  allowedKeys?: Set<string>,
) {
  const vaultToken = getVaultToken();

  const nodeVault = await import('node-vault');
  const requestOptions: Record<string, unknown> = {};

  if (certs) {
    requestOptions.httpsAgent = new https.Agent({
      ca: readFileSync(certs),
    });
  }

  const vault = nodeVault.default({
    apiVersion: 'v1',
    endpoint: vaultAddr,
    token: vaultToken,
    requestOptions,
  });

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

  console.log(`✓ Secrets fetched successfully`);
  console.log(
    `✓ Injected ${injected}/${Object.keys(secrets).length} secrets${allowedKeys ? ` (filtered by env file)` : ''}`,
  );

  return secrets;
}

async function fetchSecretsAndServe() {
  const vaultAddr = 'https://10.0.1.1:8200';
  const secretPath = 'kv/data/secrets';
  const certs = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    'vault-ca.crt',
  );

  const { envFile, command } = parseArgs(process.argv.slice(2));

  let allowedKeys: Set<string> | undefined;
  if (envFile) {
    if (!existsSync(envFile)) {
      console.error(`Error: env file not found: ${envFile}`);
      process.exit(1);
    }
    allowedKeys = parseEnvFileKeys(envFile);
    console.log(`Using env file: ${envFile} (${allowedKeys.size} keys)`);
  }

  await fetchSecrets(vaultAddr, secretPath, certs, allowedKeys);

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
