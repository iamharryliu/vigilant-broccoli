import { spawn } from 'child_process';
import { isProdAndNotDryRun } from './shell.consts';

const runShellCommand = (
  cmd: string,
  hasOutput = false,
  env?: Record<string, string>,
  timeout?: number,
): Promise<void | string> => {
  return new Promise((resolve, reject) => {

    const childProcess = spawn(cmd, {
      shell: true,
      env: env ? { ...process.env, ...env } : process.env,
    });

    let stdout = '';
    let stderr = '';

    childProcess.stdout?.on('data', data => {
      const output = data.toString();
      if (hasOutput) {
        stdout += output.trim();
      }
    });

    childProcess.stderr?.on('data', data => {
      stderr += data.toString();
    });

    let timer: NodeJS.Timeout | undefined;
    if (timeout) {
      timer = setTimeout(() => {
        childProcess.kill();
        reject(new Error(`Process timed out after ${timeout}ms`));
      }, timeout);
    }

    childProcess.on('close', code => {
      if (timer) clearTimeout(timer);
      if (code === 0) {
        resolve(hasOutput ? stdout : undefined);
      } else {
        const errorMessage = stderr
          ? `Command failed with code ${code}: ${stderr}`
          : `Command failed with code ${code}`;
        reject(errorMessage);
      }
    });

    childProcess.on('error', error => {
      if (timer) clearTimeout(timer);
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
