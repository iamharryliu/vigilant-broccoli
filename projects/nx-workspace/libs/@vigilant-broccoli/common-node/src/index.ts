import 'dotenv-defaults/config';
import { promises as fs } from 'fs';
import * as path from 'path';

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
// Slack
export * from './lib/slack/slack.models';
export * from './lib/slack/slack.service';
export * from './lib/slack/slack.utils';
// Weather
export * from './lib/weather/openweather.service';
// Recipe
export * from './lib/recipe/recipe-scraper.service';

export const QUEUE = {
  EMAIL: 'EMAIL',
};

export class LocalBucketService {
  constructor(private bucketPath: string) {
    this.bucketPath = bucketPath;
  }

  async init(): Promise<void> {
    await fs.mkdir(this.bucketPath, { recursive: true });
  }

  async upload(destinationName: string, buffer: Buffer): Promise<void> {
    const destinationPath = path.join(this.bucketPath, destinationName);
    await fs.writeFile(destinationPath, buffer);
  }

  async download(fileName: string, destinationPath: string): Promise<void> {
    const sourcePath = path.join(this.bucketPath, fileName);
    await fs.copyFile(sourcePath, destinationPath);
  }

  async delete(fileName: string): Promise<void> {
    const filePath = path.join(this.bucketPath, fileName);
    await fs.unlink(filePath);
  }

  async getFiles(): Promise<string[]> {
    return await fs.readdir(this.bucketPath);
  }

  async exists(fileName: string): Promise<boolean> {
    try {
      await fs.access(path.join(this.bucketPath, fileName));
      return true;
    } catch {
      return false;
    }
  }

  async read(fileName: string): Promise<Buffer> {
    return await fs.readFile(path.join(this.bucketPath, fileName));
  }
}

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