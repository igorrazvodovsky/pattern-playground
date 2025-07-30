import { Application } from 'express';
import { GenerationHandler } from './handlers/generation.js';
import { SuggestionsHandler } from './handlers/suggestions.js';
import { SemanticZoomHandler } from './handlers/semanticZoom.js';
import { asyncHandler } from './middleware/errorHandler.js';

export const setupRoutes = (app: Application): void => {
  app.post('/api/generate', asyncHandler(GenerationHandler.handleGenerate));
  app.post('/api/text/zoom', asyncHandler(SemanticZoomHandler.handleSemanticZoom));
  app.post('/api/generate-suggestions', asyncHandler(SuggestionsHandler.handleGenerateSuggestions));
};
