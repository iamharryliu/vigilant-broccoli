import { exec } from 'child_process';
import { promisify } from 'util';
import { FileSystemUtils } from '../file-system/file-system.utils';
import { OPEN_TYPE, type OpenType } from '@vigilant-broccoli/common-js';

const execAsync = promisify(exec);

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
): Promise<OpenResult> => {
  let shellCommand: string;

  switch (type) {
    case OPEN_TYPE.VSCODE: {
      const expandedPath = FileSystemUtils.expandHomePath(target);
      shellCommand = `code "${expandedPath}"`;
      break;
    }
    case OPEN_TYPE.FILE_SYSTEM: {
      const expandedPath = FileSystemUtils.expandHomePath(target);
      shellCommand = `open "${expandedPath}"`;
      break;
    }
    case OPEN_TYPE.MAC_APPLICATION: {
      shellCommand = `open -a '${target}'`;
      break;
    }
    default:
      return {
        message: `Unsupported open type: ${type}`,
        status: 'error',
        error: `Unsupported open type: ${type}`,
      };
  }

  if (!shellCommand || typeof shellCommand !== 'string') {
    return {
      message: 'Failed to generate shell command',
      status: 'error',
      error: 'Failed to generate shell command',
    };
  }

  const { stdout, stderr } = await execAsync(shellCommand);

  return {
    message: 'Command executed successfully',
    status: 'success',
    stdout,
    stderr,
  };
};
