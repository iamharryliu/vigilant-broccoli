import path from 'path';
import { SIGNATURE_TMP_DIR } from './google.consts';
import { FileSystemUtils, ShellUtils } from '@vigilant-broccoli/common-node';
import { GamCommand } from './gam.api';

export const runGamReadCommand = async (cmd: string): Promise<string> => {
  return (await ShellUtils.runShellCommand(
    `~/bin/gam7/${cmd}`,
    true,
  )) as string;
};

export const runBatchCommands = async (commands: string[]): Promise<void> => {
  if (commands.length < 1) {
    return;
  }
  const FILEPATH = FileSystemUtils.generateTmpFilepath();
  await FileSystemUtils.writeFile(FILEPATH, commands.join('\n'));
  const batchCommand = GamCommand.batchExecute(FILEPATH);
  await ShellUtils.runUpdateShellCommand(batchCommand);
  await FileSystemUtils.deletePath(FILEPATH);
};

export const getEmailSignatureFilepath = (email: string): string => {
  return path.resolve(SIGNATURE_TMP_DIR, `${email}.html`);
};
