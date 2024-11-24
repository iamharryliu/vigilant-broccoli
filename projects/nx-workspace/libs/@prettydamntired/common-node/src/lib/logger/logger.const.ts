import { LogConfig, LogLevels } from './logger.model';
import { ConsoleTransport } from './logger.transports';

export const LOG_LEVEL: LogLevels = {
  TRACE: { name: 'TRACE', priorityValue: 0 },
  DEBUG: { name: 'DEBUG', priorityValue: 1 },
  INFO: { name: 'INFO', priorityValue: 2 },
  WARN: { name: 'WARN', priorityValue: 3 },
  ERROR: { name: 'ERROR', priorityValue: 4 },
};

export const DEFAULT_LOG_CONFIG: LogConfig = {
  logLevel: LOG_LEVEL.TRACE,
  transports: [new ConsoleTransport(LOG_LEVEL.DEBUG)],
};
