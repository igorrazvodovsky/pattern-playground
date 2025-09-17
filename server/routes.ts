import { Application } from 'express';
import { GenerationHandler } from './handlers/generation.js';
import { SuggestionsHandler } from './handlers/suggestions.js';
import { TextLensHandler } from './handlers/textLens.js';
import { ExplanationHandler } from './handlers/explanation.js';
import { asyncHandler } from './middleware/errorHandler.js';

export const setupRoutes = (app: Application): void => {
  app.post('/api/generate', asyncHandler(GenerationHandler.handleGenerate));
  app.post('/api/text/zoom', asyncHandler(TextLensHandler.handleTextLens));
  app.post('/api/generate-suggestions', asyncHandler(SuggestionsHandler.handleGenerateSuggestions));
  app.post('/api/explain', asyncHandler(ExplanationHandler.handleExplain));
};
