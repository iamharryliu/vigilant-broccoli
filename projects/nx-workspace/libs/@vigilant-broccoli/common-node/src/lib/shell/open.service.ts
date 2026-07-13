import { execFile } from 'child_process';
import { promisify } from 'util';
import { FileSystemUtils } from '../file-system/file-system.utils';
import { OPEN_TYPE, type OpenType } from '@vigilant-broccoli/common-js';

const execFileAsync = promisify(execFile);

export interface OpenResult {
  message: string;
  status: 'success' | 'error';
  stdout?: string;
  stderr?: string;
  error?: string;
}

export const open = async (
  type: OpenType,
  target: string,
  args?: string,
): Promise<OpenResult> => {
  let command: string;
  let commandArgs: string[];

  switch (type) {
    case OPEN_TYPE.VSCODE: {
      command = 'code';
      commandArgs = [FileSystemUtils.expandHomePath(target)];
      break;
    }
    case OPEN_TYPE.FILE_SYSTEM: {
      command = 'open';
      commandArgs = [FileSystemUtils.expandHomePath(target)];
      break;
    }
    case OPEN_TYPE.MAC_APPLICATION: {
      command = 'open';
      commandArgs = args ? ['-a', target, args] : ['-a', target];
      break;
    }
    default:
      return {
        message: `Unsupported open type: ${type}`,
        status: 'error',
        error: `Unsupported open type: ${type}`,
      };
  }

  const { stdout, stderr } = await execFileAsync(command, commandArgs);

  return {
    message: 'Command executed successfully',
    status: 'success',
    stdout,
    stderr,
  };
};
