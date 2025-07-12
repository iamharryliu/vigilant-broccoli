import { spawn } from 'child_process';
import { isProdAndNotDryRun } from './shell.consts';

const runShellCommand = (
  cmd: string,
  hasOutput = false,
): Promise<void | string> => {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(cmd, { shell: true });
    let output = '';

    childProcess.stdout.on('data', data => {
      const standardOutput = data.toString().trim();
      if (hasOutput) {
        output += standardOutput;
      }
    });

    childProcess.on('close', code => {
      if (code === 0) {
        resolve(hasOutput ? output : undefined);
      } else {
        const errorMessage = `Command failed with code ${code}`;
        reject(errorMessage);
      }
    });

    childProcess.on('error', error => {
      const errorMessage = `Failed to start command: ${error.message}`;
      reject(errorMessage);
    });
  });
};

const runUpdateShellCommand = async (cmd: string): Promise<void> => {
  if (isProdAndNotDryRun()) {
    return (await runShellCommand(cmd)) as void;
  }
};

export const ShellUtils = {
  runShellCommand,
  runUpdateShellCommand,
};
