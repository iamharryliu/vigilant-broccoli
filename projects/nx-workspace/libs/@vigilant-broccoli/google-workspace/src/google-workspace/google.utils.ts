import path from 'path';
import { execSync } from 'child_process';
import { SIGNATURE_TMP_DIR } from './google.consts';
import { FileSystemUtils, ShellUtils } from '@vigilant-broccoli/common-node';
import { GamCommand } from './gam.api';
import { GoogleBatchCommandFactory } from './google.model';

const isCommandAvailable = (cmd: string): boolean => {
  try {
    execSync(cmd, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
};

const checkCliAvailability = (() => {
  let checked = false;
  return () => {
    if (checked) return;
    checked = true;
    if (!isCommandAvailable('~/bin/gam7/gam version')) {
      console.warn(
        '[google-workspace] WARNING: GAM not found at ~/bin/gam7/. Install GAM: https://github.com/GAM-team/GAM/wiki',
      );
    }
    if (!isCommandAvailable('~/bin/gyb/gyb --version')) {
      console.warn(
        '[google-workspace] WARNING: GYB not found at ~/bin/gyb/. Install GYB: https://github.com/GAM-team/got-your-back/wiki',
      );
    }
  };
})();

export const runGamCommand = async (
  cmd: string,
  hasOutput: boolean,
): Promise<string> => {
  checkCliAvailability();
  console.log(`Running GAM command: ${cmd}`);
  return (await ShellUtils.runShellCommand(
    `~/bin/gam7/${cmd}`,
    hasOutput,
  )) as string;
};

export const runGamReadCommand = async (cmd: string): Promise<string> => {
  return runGamCommand(cmd, true);
};

export const runBatchCommands = async (commands: string[]): Promise<void> => {
  if (commands.length < 1) {
    return;
  }
  const BATCH_COMMANDS_FILEPATH = FileSystemUtils.generateTmpFilepath();
  await FileSystemUtils.writeFile(BATCH_COMMANDS_FILEPATH, commands.join('\n'));
  const batchCommand = GamCommand.batchExecute(BATCH_COMMANDS_FILEPATH);
  await ShellUtils.runUpdateShellCommand(batchCommand);
  await FileSystemUtils.deletePath(BATCH_COMMANDS_FILEPATH);
};

export const getEmailSignatureFilepath = (email: string): string => {
  return path.resolve(SIGNATURE_TMP_DIR, `${email}.html`);
};

export const runBatchCommandsv2 = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listOfbatchCommandAndArgs: GoogleBatchCommandFactory<any>[],
): Promise<void> => {
  const operations = await Promise.all(
    listOfbatchCommandAndArgs.map(batchCommandAndArgs =>
      batchCommandAndArgs.batchCommand(batchCommandAndArgs.args),
    ),
  );
  const commands = [] as string[];
  const assetsDirectories = [] as string[];
  operations.forEach(operation => {
    commands.push(...operation.commands);
    if (operation.assetsDirectory) {
      assetsDirectories.push(operation.assetsDirectory);
    }
  });

  if (commands.length < 1) return;

  const batchCommandFilepath = FileSystemUtils.generateTmpFilepath();
  await FileSystemUtils.writeFile(batchCommandFilepath, commands.join('\n'));
  const batchCommand = GamCommand.batchExecute(batchCommandFilepath);
  await ShellUtils.runUpdateShellCommand(batchCommand);
  await FileSystemUtils.deletePath([
    batchCommandFilepath,
    ...assetsDirectories,
  ]);
};
