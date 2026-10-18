#!/usr/bin/env node
import express from 'express';
import logger from './logger.js';
import config from './config.js';
import { setupMiddleware } from './middleware.js';
import { setupRoutes } from './routes.js';
import { errorHandler } from './middleware/errorHandler.js';

// Initialize Express app using top-level await
try {
  const app = express();
  const PORT = config.port;

  // Setup middleware
  setupMiddleware(app);

  // Setup routes
  setupRoutes(app);

  // Error handling middleware (must come after the routes)
  app.use(errorHandler);

  // Start the server
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
} catch (error) {
  logger.error('Failed to start server:', error);
  process.exit(1);
}
