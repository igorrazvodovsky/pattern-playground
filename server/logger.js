import config from './config.js';

// Simple logger with different log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// Get configured log level
const configuredLevel = config.logging.level.toLowerCase();
const currentLogLevel = logLevels[configuredLevel] !== undefined
  ? logLevels[configuredLevel]
  : logLevels.info;

// Logger implementation
const logger = {
  error: (message, ...args) => {
    if (logLevels.error <= currentLogLevel) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  },

  warn: (message, ...args) => {
    if (logLevels.warn <= currentLogLevel) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  info: (message, ...args) => {
    if (logLevels.info <= currentLogLevel) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },

  debug: (message, ...args) => {
    if (logLevels.debug <= currentLogLevel) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },

  // For request logging
  request: (req, message = '') => {
    if (logLevels.info <= currentLogLevel) {
      console.info(`[REQUEST] ${req.method} ${req.url} ${message}`);
    }
  },

  // For response logging
  response: (req, statusCode, message = '') => {
    if (logLevels.info <= currentLogLevel) {
      console.info(`[RESPONSE] ${req.method} ${req.url} ${statusCode} ${message}`);
    }
  }
};

export default logger;
