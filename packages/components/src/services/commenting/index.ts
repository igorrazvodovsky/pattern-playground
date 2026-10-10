// Universal commenting system exports

// Core universal system
export * from './core/index';

// React hook for any pointer
export { useCommenting } from './hooks/use-commenting';

// Quote service (still needed for quote creation)
export { getQuoteService, type QuoteObject } from './quote-service';

// Utilities
export * from './utils/error-handling';

// Mock data initialization (for development/demo)
export { initializeMockComments, clearMockComments } from './mock-data/initialize-mock-comments';