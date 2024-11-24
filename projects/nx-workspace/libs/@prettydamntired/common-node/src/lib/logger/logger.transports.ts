import { FileTransportConfig, Transport, LogLevel } from './logger.model';
import { FileSystemUtils } from '../file-system/file-system.utils';

export class ConsoleTransport implements Transport {
  private logLevel: LogLevel;

  constructor(logLevel: LogLevel) {
    this.logLevel = logLevel;
  }

  log(level: LogLevel, message: string): void {
    if (this.logLevel.priorityValue <= level.priorityValue) {
      console.log(message);
    }
  }
}

export class FileTransport implements Transport {
  private filepath: string;
  private logLevel: LogLevel;

  constructor(config: FileTransportConfig) {
    this.filepath = config.filepath;
    this.logLevel = config.logLevel;
  }

  log(level: LogLevel, message: string): void {
    if (this.logLevel.priorityValue <= level.priorityValue) {
      FileSystemUtils.appendFile(this.filepath, message + '\n');
    }
  }
}
