import { createVaultClient, VAULT_SECRET_PATH } from './vault-client';

backupVaultSecrets(VAULT_SECRET_PATH);

async function backupVaultSecrets(secretPath: string) {
  const vault = await createVaultClient();

  console.error(`Fetching secrets from Vault at ${secretPath}...`);

  const result = await vault.read(secretPath);
  const secrets = result.data.data || result.data || result;

  console.error(`✓ Total secrets fetched: ${Object.keys(secrets).length}`);
  process.stdout.write(JSON.stringify(secrets, null, 2));
}
