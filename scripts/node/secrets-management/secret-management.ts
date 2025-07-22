import * as dotenv from 'dotenv';
import vault from 'node-vault';

dotenv.config({ path: '.env.secret-manager' });

export interface SecretMap {
  [key: string]: string;
}

export class VaultSecretManager {
  private client: vault.client;

  constructor() {
    const cert = (process.env.SECRET_MANAGER_SSL_CERT as string).replace(
      /\\n/g,
      '\n',
    );

    this.client = vault({
      endpoint: process.env.SECRET_MANAGER_URL,
      requestOptions: { ca: cert },
    });
  }

  async authenticate(): Promise<void> {
    const loginResponse = await this.client.githubLogin({
      token: process.env.SECRET_MANAGER_ID,
    });
    this.client.token = loginResponse.auth.client_token;
  }

  async getSecrets(path: string): Promise<SecretMap> {
    const response = await this.client.read(path);
    return response.data.data;
  }
}
