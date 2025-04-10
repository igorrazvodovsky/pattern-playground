import express from 'express';
import cors from 'cors';
import logger from './logger.js';
import config from './config.js';

/**
 * Configure and apply middleware to Express app
 * @param {express.Application} app - Express application
 */
export const setupMiddleware = (app) => {
  // Body parser middleware
  app.use(express.json());

  // Request logging middleware
  app.use((req, res, next) => {
    logger.request(req);

    // Capture response for logging
    const originalSend = res.send;
    res.send = function(body) {
      logger.response(req, res.statusCode);
      return originalSend.call(this, body);
    };

    next();
  });

  // CORS middleware
  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true);

      const { allowedOrigins } = config.cors;

      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        logger.warn(`Request from disallowed origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: config.cors.credentials,
    methods: config.cors.methods,
    allowedHeaders: config.cors.allowedHeaders
  }));

  // Error handling middleware
  app.use((err, req, res, next) => {
    logger.error('Express error:', err);

    // Make sure we're using the correct response method
    if (typeof res.status === 'function') {
      res.status(err.status || 500).json({
        success: false,
        data: null,
        error: err.message || 'Internal Server Error'
      });
    } else {
      // Fallback if res.status is not a function
      res.statusCode = err.status || 500;
      res.json({
        success: false,
        data: null,
        error: err.message || 'Internal Server Error'
      });
    }

    // Call next to pass the error to any further error handlers
    // This prevents the ESLint error about unused parameter
    if (next) next(err);
  });
};
