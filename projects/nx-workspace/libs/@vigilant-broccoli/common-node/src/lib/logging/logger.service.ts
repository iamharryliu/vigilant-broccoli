const TIMESTAMP_FORMAT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

const pad = (value: number): string => value.toString().padStart(2, '0');

// Matches winston's previous 'MMM-DD-YYYY HH:mm:ss' timestamp format.
const formatTimestamp = (date: Date): string => {
  const month = TIMESTAMP_FORMAT_MONTHS[date.getMonth()];
  const day = pad(date.getDate());
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${month}-${day}-${year} ${hours}:${minutes}:${seconds}`;
};

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const CONSOLE_METHOD_BY_LEVEL: Record<LogLevel, (...args: unknown[]) => void> =
  {
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  };

const log = (level: LogLevel, message: unknown, ...meta: unknown[]): void => {
  CONSOLE_METHOD_BY_LEVEL[level](
    `${level}: ${formatTimestamp(new Date())}: ${message}`,
    ...meta,
  );
};

export const logger = {
  info: (message: unknown, ...meta: unknown[]) => log('info', message, ...meta),
  warn: (message: unknown, ...meta: unknown[]) => log('warn', message, ...meta),
  error: (message: unknown, ...meta: unknown[]) =>
    log('error', message, ...meta),
  debug: (message: unknown, ...meta: unknown[]) =>
    log('debug', message, ...meta),
};
