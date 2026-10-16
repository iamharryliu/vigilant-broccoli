import { execSync } from 'child_process';

const GCP_PROJECT = 'vigilant-broccoli';
const ROLE_ID_SECRET_NAME = 'VB_VM_VAULT_OPS_ROLE_ID';
const SECRET_ID_SECRET_NAME = 'VB_VM_VAULT_OPS_SECRET_ID';

const accessSecret = (name: string): string =>
  execSync(
    `gcloud secrets versions access latest --secret=${name} --project=${GCP_PROJECT}`,
    { encoding: 'utf-8' },
  ).trim();

export const getVaultOpsCredentials = () => {
  console.error(
    'Fetching Vault ops AppRole credentials from GCP Secret Manager...',
  );
  return {
    role_id: accessSecret(ROLE_ID_SECRET_NAME),
    secret_id: accessSecret(SECRET_ID_SECRET_NAME),
  };
};
