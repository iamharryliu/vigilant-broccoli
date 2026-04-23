import { execSync } from 'child_process';

const GCP_PROJECT = 'vigilant-broccoli';
const SECRET_NAME = 'VB_VM_VAULT_ROOT_TOKEN';

export function getVaultToken(): string {
  const envToken = process.env.VAULT_TOKEN;
  if (envToken) return envToken;

  console.log('Fetching Vault token from GCP Secret Manager...');
  const token = execSync(
    `gcloud secrets versions access latest --secret=${SECRET_NAME} --project=${GCP_PROJECT}`,
    { encoding: 'utf-8' },
  ).trim();

  return token;
}
