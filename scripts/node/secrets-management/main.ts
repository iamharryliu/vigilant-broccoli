import { VaultSecretManager } from './secret-management';

const run = async () => {
  const ENV_PATH = process.env.LOCAL_STAGING_ENV_ENDPOINT as string;

  const secretManager = new VaultSecretManager();
  await secretManager.authenticate();
  const secrets = await secretManager.getSecrets(ENV_PATH);

  // Do whatever you need with the secrets.
};

run().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
