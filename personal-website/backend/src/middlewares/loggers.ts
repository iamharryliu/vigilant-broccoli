// Move logger to node tools
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'MMM-DD-YYYY HH:mm:ss',
    }),
    winston.format.printf(
      info => `${info.level}: ${[info.timestamp]}: ${info.message}`,
    ),
  ),
});
