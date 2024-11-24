import { DEFAULT_LOG_CONFIG, LOG_LEVEL } from './logger.const';
import { LogLevel, Transport } from './logger.model';

export class SimpleLogger {
  private logLevel: LogLevel;
  private traceId?: string;
  private transports: Transport[];

  constructor(logConfig = DEFAULT_LOG_CONFIG) {
    this.logLevel = logConfig.logLevel ? logConfig.logLevel : LOG_LEVEL.TRACE;
    this.traceId = logConfig.traceId
      ? logConfig.traceId
      : SimpleLogger.generateTraceId();
    this.transports = logConfig.transports;
  }

  log(level: LogLevel, message: string): void {
    if (level.priorityValue >= this.logLevel.priorityValue) {
      const formattedMessage = this.formatMessage(level, message);

      for (const transport of this.transports) {
        transport.log(level, formattedMessage);
      }
    }
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}][${this.traceId}] ${level.name}: ${message}`;
  }

  trace(message: string): void {
    this.log(LOG_LEVEL.TRACE, message);
  }

  debug(message: string): void {
    this.log(LOG_LEVEL.DEBUG, message);
  }

  info(message: string): void {
    this.log(LOG_LEVEL.INFO, message);
  }

  warn(message: string): void {
    this.log(LOG_LEVEL.WARN, message);
  }

  error(message: string): void {
    this.log(LOG_LEVEL.ERROR, message);
  }

  logPerformance = (scriptName: string): void => {
    const runtime = SimpleLogger.formatTime(performance.now());
    const memoryUsage = Math.round(process.memoryUsage().rss / 1024 / 1024);
    this.info(
      `${
        scriptName ? `${scriptName}` : 'Script'
      } completed in ${runtime}. Memory Usage: ${memoryUsage} MB`,
    );
  };

  static formatTime(milliseconds: number): string {
    const seconds = Math.floor((milliseconds / 1000) % 60);
    const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
    const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
    return `${hours}h${minutes}m${seconds}s`;
  }

  static generateTraceId = (length = 8): string => {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
}
