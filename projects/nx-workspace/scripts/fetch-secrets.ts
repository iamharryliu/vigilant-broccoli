import { spawn } from 'child_process';
import { readFileSync } from 'fs';

const VAULT_CA_CERT_PATH = './scripts/vault-ca.crt';

async function fetchSecretsAndServe() {
  try {
    const vaultAddr = process.env.VAULT_ADDR || 'https://10.0.1.1:8200';
    const vaultToken = process.env.VAULT_TOKEN;

    if (!vaultToken) {
      console.error('Error: VAULT_TOKEN environment variable is required');
      process.exit(1);
    }

    const ca = readFileSync(VAULT_CA_CERT_PATH);

    const nodeVault = await import('node-vault');
    const vault = nodeVault.default({
      apiVersion: 'v1',
      endpoint: vaultAddr,
      token: vaultToken,
      requestOptions: {
        ca,
      },
    });

    // Fetch secrets from Vault
    const secretPath = '/kv/data/secrets';
    console.log(`Fetching secrets from Vault at ${secretPath}...`);

    const result = await vault.read(secretPath);

    // Extract the actual secret data (KV v2 stores data in result.data.data)
    const secrets = result.data.data || result.data || result;


    for (const [key, value] of Object.entries(secrets)) {
      if (typeof value === 'string') {
        process.env[key] = value;
        if (key !== 'OPENWEATHER_API_KEY') {
          console.log(`✓ ${key} loaded into environment`);
        }
      }
    }


    // Start the Next.js dev server with the secrets in environment
    const args = process.argv.slice(2);
    if (args.length > 0) {
      console.log(`\nStarting: ${args.join(' ')}\n`);

      const child = spawn(args[0], args.slice(1), {
        stdio: 'inherit',
        env: { ...process.env },
        shell: true,
      });

      child.on('exit', (code) => {
        process.exit(code || 0);
      });
    }
  } catch (error) {
    console.error('Error fetching secrets from Vault:', error);
    process.exit(1);
  }
}

fetchSecretsAndServe();
