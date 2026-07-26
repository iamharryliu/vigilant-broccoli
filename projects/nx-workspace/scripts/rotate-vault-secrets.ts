import { randomBytes } from 'crypto';
import { createVaultClient, VAULT_SECRET_PATH } from './vault-client';

const ROTATE_KEYS = ['SHARED_APP_TOKEN', 'VB_EXPRESS_API_KEY'] as const;
const TOKEN_BYTES = 32;

function generateToken(): string {
  return randomBytes(TOKEN_BYTES).toString('hex');
}

async function rotateVaultSecrets() {
  const vault = await createVaultClient();

  const patch: Record<string, string> = {};
  for (const key of ROTATE_KEYS) {
    patch[key] = generateToken();
    console.log(`✓ Rotated ${key}`);
  }

  console.log(`Patching ${VAULT_SECRET_PATH}...`);
  await vault.update(VAULT_SECRET_PATH, { data: patch });
  console.log(`✓ Rotation complete (${ROTATE_KEYS.length} keys)`);
}

rotateVaultSecrets();
