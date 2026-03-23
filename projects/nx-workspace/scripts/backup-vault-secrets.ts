import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { homedir } from 'os';
import 'dotenv/config';

const vaultAddr = 'https://10.0.1.1:8200';
const secretPath = '/kv/data/secrets';
const outputPath = '~/resilio-sync/backup/vb-vault.json';
backupVaultSecrets(vaultAddr, secretPath, outputPath);

async function backupVaultSecrets(
  vaultAddr: string,
  secretPath: string,
  outputPath?: string,
  certs?: string,
) {
  try {
    const vaultToken = process.env.VAULT_TOKEN;

    if (!vaultToken) {
      console.error('Error: VAULT_TOKEN environment variable is required');
      process.exit(1);
    }

    const nodeVault = await import('node-vault');
    const requestOptions: Record<string, unknown> = {};

    if (certs) {
      const ca = readFileSync(certs, 'utf-8');
      requestOptions.ca = ca;
    }

    const vault = nodeVault.default({
      apiVersion: 'v1',
      endpoint: vaultAddr,
      token: vaultToken,
      requestOptions,
    });

    // Fetch secrets from Vault
    console.log(`Fetching secrets from Vault at ${secretPath}...`);

    const result = await vault.read(secretPath);

    // Extract the actual secret data (KV v2 stores data in result.data.data)
    const secrets = result.data.data || result.data || result;

    // Write secrets to backup location
    let finalOutputPath = outputPath || resolve('./vault-secrets.json');
    if (finalOutputPath.startsWith('~')) {
      finalOutputPath = resolve(homedir(), finalOutputPath.slice(2));
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const [dir, file] = [
      finalOutputPath.substring(0, finalOutputPath.lastIndexOf('/')),
      finalOutputPath.substring(finalOutputPath.lastIndexOf('/') + 1),
    ];
    const [name, ext] = [
      file.substring(0, file.lastIndexOf('.')),
      file.substring(file.lastIndexOf('.')),
    ];
    finalOutputPath = resolve(dir, `${name}-${timestamp}${ext}`);

    writeFileSync(finalOutputPath, JSON.stringify(secrets, null, 2), 'utf-8');

    console.log(`✓ Secrets backed up to ${finalOutputPath}`);
    console.log(`✓ Total secrets backed up: ${Object.keys(secrets).length}`);
  } catch (error) {
    console.error('Error backing up secrets from Vault:', error);
    process.exit(1);
  }
}
