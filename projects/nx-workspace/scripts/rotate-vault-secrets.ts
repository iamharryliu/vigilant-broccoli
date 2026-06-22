import { randomBytes } from 'crypto';
import { readFileSync } from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
import { getVaultToken } from './gcp-vault-token';

const VAULT_ADDR = 'https://10.0.1.1:8200';
const SECRET_PATH = 'kv/data/secrets';
const CERTS = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'vault-ca.crt',
);
const ROTATE_KEYS = ['SHARED_APP_TOKEN', 'VB_EXPRESS_API_KEY'] as const;
const TOKEN_BYTES = 32;

function generateToken(): string {
  return randomBytes(TOKEN_BYTES).toString('hex');
}

async function rotateVaultSecrets() {
  const vaultToken = getVaultToken();
  const nodeVault = await import('node-vault');

  const vault = nodeVault.default({
    apiVersion: 'v1',
    endpoint: VAULT_ADDR,
    token: vaultToken,
    requestOptions: {
      httpsAgent: new https.Agent({ ca: readFileSync(CERTS) }),
    },
  });

  console.log(`Reading current secrets from ${SECRET_PATH}...`);
  const result = await vault.read(SECRET_PATH);
  const current: Record<string, string> = result.data.data || result.data;

  const updated = { ...current };
  for (const key of ROTATE_KEYS) {
    updated[key] = generateToken();
    console.log(`✓ Rotated ${key}`);
  }

  console.log(`Writing updated secrets to ${SECRET_PATH}...`);
  await vault.write(SECRET_PATH, { data: updated });
  console.log(`✓ Rotation complete (${ROTATE_KEYS.length} keys)`);
}

rotateVaultSecrets();
