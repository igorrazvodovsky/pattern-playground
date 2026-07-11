// Core components
export { ItemView } from './ItemView';
export { ItemInteraction } from './ItemInteraction';
export { DefaultFallbackRenderer } from './DefaultFallbackRenderer';

// Legacy components - deprecated (use ItemView instead)
export { ItemPreview } from './ItemPreview';
export { ItemDetail } from './ItemDetail';
export { ItemFullView } from './ItemFullView';

// Content adapter system
export { 
  ContentAdapterProvider, 
  useContentAdapterContext, 
  useContentAdapter, 
  useRegisterAdapter 
} from './ContentAdapterRegistry';

// Adapter base classes
export { CommentAwareAdapterBase } from './adapters/CommentAwareAdapterBase';

// Modal service integration
export { 
  createModalContent, 
  getSizeForScope, 
  getPlacementForScope 
} from './services/modal-service-integration';

// Types
export type {
  ViewScope,
  InteractionMode,
  BaseItem,
  ViewScopeConfig,
  ItemInteractionProps,
  ItemViewProps,
  ContentAdapter,
  CommentAwareAdapter,
  UniversalComment
} from './types';

