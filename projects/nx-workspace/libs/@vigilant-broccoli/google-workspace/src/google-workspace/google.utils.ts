import path from 'path';
import { SIGNATURE_TMP_DIR } from './google.consts';
import { FileSystemUtils, ShellUtils } from '@vigilant-broccoli/common-node';
import { GamCommand } from './gam.api';
import { Batch } from './google.types';

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
  const BATCH_COMMANDS_FILEPATH = FileSystemUtils.generateTmpFilepath();
  await FileSystemUtils.writeFile(BATCH_COMMANDS_FILEPATH, commands.join('\n'));
  const batchCommand = GamCommand.batchExecute(BATCH_COMMANDS_FILEPATH);
  await ShellUtils.runUpdateShellCommand(batchCommand);
  await FileSystemUtils.deletePath(BATCH_COMMANDS_FILEPATH);
};

export const getEmailSignatureFilepath = (email: string): string => {
  return path.resolve(SIGNATURE_TMP_DIR, `${email}.html`);
};
export const runBatchCommandsv2 = async (batch: Batch): Promise<void> => {
  const { commands, assetsDirectory } = batch;
  if (commands.length < 1) {
    return;
  }
  const batchCommandFilepath = FileSystemUtils.generateTmpFilepath();
  await FileSystemUtils.writeFile(batchCommandFilepath, commands.join('\n'));
  const batchCommand = GamCommand.batchExecute(batchCommandFilepath);
  await ShellUtils.runUpdateShellCommand(batchCommand);
  await FileSystemUtils.deletePath([batchCommandFilepath, assetsDirectory]);
};
