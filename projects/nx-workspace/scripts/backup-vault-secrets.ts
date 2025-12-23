import { writeFileSync } from 'fs';
import { resolve } from 'path';
import dotenv from "dotenv";

dotenv.config()

async function backupVaultSecrets() {
  try {
    const vaultAddr = process.env.VAULT_ADDR || 'https://10.0.1.1:8200';
    const vaultToken = process.env.VAULT_TOKEN;

    if (!vaultToken) {
      console.error('Error: VAULT_TOKEN environment variable is required');
      process.exit(1);
    }

    // Allow self-signed certificates
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    // Dynamically import node-vault
    const nodeVault = await import('node-vault');
    const vault = nodeVault.default({
      apiVersion: 'v1',
      endpoint: vaultAddr,
      token: vaultToken,
      requestOptions: {
        strictSSL: false,
        rejectUnauthorized: false,
        agentOptions: {
          rejectUnauthorized: false,
        },
      },
    });

    // Fetch secrets from Vault
    const secretPath = '/kv/data/secrets';
    console.log(`Fetching secrets from Vault at ${secretPath}...`);

    const result = await vault.read(secretPath);

    // Extract the actual secret data (KV v2 stores data in result.data.data)
    const secrets = result.data.data || result.data || result;

    // Write secrets to vault-secrets.json
    const outputPath = resolve('./vault-secrets.json');
    writeFileSync(outputPath, JSON.stringify(secrets, null, 2), 'utf-8');

    console.log(`✓ Secrets backed up to ${outputPath}`);
    console.log(`✓ Total secrets backed up: ${Object.keys(secrets).length}`);

  } catch (error) {
    console.error('Error backing up secrets from Vault:', error);
    process.exit(1);
  }
}

backupVaultSecrets();
