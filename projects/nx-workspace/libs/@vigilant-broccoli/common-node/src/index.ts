import 'dotenv-defaults/config';

export * from './lib/utils';
// Date
export * from './lib/date/date.consts';
export * from './lib/date/date.utils';
// Shell
export * from './lib/shell/shell.consts';
export * from './lib/shell/shell.utils';
export * from './lib/shell/open.service';
// File System
export * from './lib/file-system/file-system.consts';
export * from './lib/file-system/file-system.utils';
// HTTP
export * from './lib/http/http.utils';
// Email
export * from './lib/email/email.consts';
export * from './lib/email/email.models';
export * from './lib/email/email.service';
export * from './lib/email/email.utils';
// Logger
export * from './lib/logger/logger';
export * from './lib/logger/logger.model';
export * from './lib/logger/logger.const';
export * from './lib/logger/logger.transports';
export * from './lib/logging/logger.service';
// Encryption
export * from './lib/encryption/encryption.service';
// Site Monitor
export * from './lib/site-monitor/site-monitor.service';
// Text Message
export * from './lib/text-message/text-message.service';
// Google Recaptcha
export * from './lib/recaptcha/recaptcha.service';
// Github
export * from './lib/github/github.service';
// Weather
export * from './lib/weather/openweather.service';
// Stripe
export * from './lib/stripe/stripe.service';
// Bucket
export * from './lib/bucket/bucket.models';
export * from './lib/bucket/bucket.service';
export * from './lib/bucket/providers/local.provider';
export * from './lib/bucket/providers/cloudflare.provider';
export * from './lib/bucket/providers/aws.provider';
export * from './lib/bucket/providers/gcs.provider';

export const QUEUE = {
  EMAIL: 'EMAIL',
};

import { execSync } from "child_process";

export class GitHubSecretProvider {
  constructor(private repo: string) {}

  setSecret(key: string, value: string): void {
    execSync(`gh secret set ${key} --repo ${this.repo} --body "${value}"`, {
      stdio: "inherit",
    });
    console.log(`✅ GitHub: Set secret ${key}`);
  }

  async setSecrets(secrets: Record<string, string>, prefix = ""): Promise<void> {
    for (const [key, value] of Object.entries(secrets)) {
      this.setSecret(`${prefix}${key}`, value);
    }
  }
}