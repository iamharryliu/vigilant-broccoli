import { ShellUtils } from '../../../projects/nx-workspace/libs/@vigilant-broccoli/common-node/src';
import { GithubAPICommand } from './github.api';

export class GitHubSecretProvider {
  constructor(private repo: string) {}

  async setSecrets(
    secrets: Record<string, string>,
    prefix = '',
  ): Promise<void> {
    for (const [key, value] of Object.entries(secrets)) {
      const command = GithubAPICommand.setSetSecret(
        this.repo,
        `${prefix}key`,
        value,
      );
      await ShellUtils.runShellCommand(command);
      console.log(`✅ GitHub: Set secret ${key}`);
    }
  }
}
