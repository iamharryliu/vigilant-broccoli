export interface LogConfig {
  logLevel?: LogLevel;
  traceId?: string;
  transports: Transport[];
}

export interface LogLevel {
  name: string;
  priorityValue: number;
}

export interface LogLevels {
  [key: string]: LogLevel;
}

export interface FileTransportConfig {
  filepath: string;
  logLevel: LogLevel;
}

export interface Transport {
  log: (level: LogLevel, message: string) => void;
}
