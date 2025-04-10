import { Request } from 'express';
import config from './config.js';

// Define log level type
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// Simple logger with different log levels
const logLevels: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// Get configured log level
const configuredLevel = config.logging.level.toLowerCase() as LogLevel;
const currentLogLevel = logLevels[configuredLevel] !== undefined
  ? logLevels[configuredLevel]
  : logLevels.info;

// Define a more specific type for log arguments
type LogArgs = unknown[];

// Logger interface
interface Logger {
  error: (message: string, ...args: LogArgs) => void;
  warn: (message: string, ...args: LogArgs) => void;
  info: (message: string, ...args: LogArgs) => void;
  debug: (message: string, ...args: LogArgs) => void;
  request: (req: Request, message?: string) => void;
  response: (req: Request, statusCode: number, message?: string) => void;
}

// Logger implementation
const logger: Logger = {
  error: (message: string, ...args: LogArgs): void => {
    if (logLevels.error <= currentLogLevel) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  },

  warn: (message: string, ...args: LogArgs): void => {
    if (logLevels.warn <= currentLogLevel) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  info: (message: string, ...args: LogArgs): void => {
    if (logLevels.info <= currentLogLevel) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },

  debug: (message: string, ...args: LogArgs): void => {
    if (logLevels.debug <= currentLogLevel) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },

  // For request logging
  request: (req: Request, message: string = ''): void => {
    if (logLevels.info <= currentLogLevel) {
      console.info(`[REQUEST] ${req.method} ${req.url} ${message}`);
    }
  },

  // For response logging
  response: (req: Request, statusCode: number, message: string = ''): void => {
    if (logLevels.info <= currentLogLevel) {
      console.info(`[RESPONSE] ${req.method} ${req.url} ${statusCode} ${message}`);
    }
  }
};

export default logger;
