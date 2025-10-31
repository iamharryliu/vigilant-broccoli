import { ENVIRONMENT_TYPE } from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '../utils';

export const SHELL_COMMAND_FLAG = {
  DRY_RUN: '--dry-run',
};

export const isDryRun = (): boolean => {
  return process.argv.includes('--dry-run');
};
export const isProd = (): boolean => {
  return getEnvironmentVariable('NODE_ENV') === ENVIRONMENT_TYPE.PRODUCTION;
};

export const isProdAndNotDryRun = (): boolean => {
  return isProd() && !isDryRun();
};
