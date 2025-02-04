import { appendFileSync } from 'fs';

export class Logger {
  private logFilePath: string;
  private appName: string;

  constructor(logFilePath = 'application.log', appName = '') {
    this.logFilePath = logFilePath;
    this.appName = appName;
  }

  private log(level: string, message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${level}${
      this.appName ? `(${this.appName})` : ''
    }: ${message}`;
    console.log(logMessage);
    appendFileSync(this.logFilePath, logMessage + '\n', 'utf8');
  }

  public info(message: string): void {
    this.log('INFO', message);
  }

  public debug(message: string): void {
    this.log('DEBUG', message);
  }

  public warn(message: string): void {
    this.log('WARN', message);
  }

  public error(message: string): void {
    this.log('ERROR', message);
  }

  public logPerformance(): void {
    const runtime = this.formatTime(performance.now());
    const memoryUsage = Math.round(process.memoryUsage().rss / 1024 / 1024);
    this.info(
      `Script completed in ${runtime}. Memory Usage: ${memoryUsage} MB`,
    );
  }

  private formatTime(milliseconds: number): string {
    const ms = Math.floor(milliseconds % 1000);
    const seconds = Math.floor((milliseconds / 1000) % 60);
    const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
    const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
    return `${hours}h ${minutes}m ${seconds}s ${ms}ms`;
  }
}
