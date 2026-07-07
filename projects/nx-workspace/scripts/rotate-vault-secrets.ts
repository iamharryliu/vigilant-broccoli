import { randomBytes } from 'crypto';
import { createVaultClient, VAULT_SECRET_PATH } from './vault-client';

const ROTATE_KEYS = ['SHARED_APP_TOKEN', 'VB_EXPRESS_API_KEY'] as const;
const TOKEN_BYTES = 32;

function generateToken(): string {
  return randomBytes(TOKEN_BYTES).toString('hex');
}

async function rotateVaultSecrets() {
  const vault = await createVaultClient();

  console.log(`Reading current secrets from ${VAULT_SECRET_PATH}...`);
  const result = await vault.read(VAULT_SECRET_PATH);
  const current: Record<string, string> = result.data.data || result.data;

  const updated = { ...current };
  for (const key of ROTATE_KEYS) {
    updated[key] = generateToken();
    console.log(`✓ Rotated ${key}`);
  }

  console.log(`Writing updated secrets to ${VAULT_SECRET_PATH}...`);
  await vault.write(VAULT_SECRET_PATH, { data: updated });
  console.log(`✓ Rotation complete (${ROTATE_KEYS.length} keys)`);
}

rotateVaultSecrets();
