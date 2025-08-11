// Core components
export { ItemPreview } from './ItemPreview';
export { ItemDetail } from './ItemDetail';
export { ItemFullView } from './ItemFullView';
export { ItemInteraction } from './ItemInteraction';

// Content adapter system
export { 
  ContentAdapterProvider, 
  useContentAdapterContext, 
  useContentAdapter, 
  useRegisterAdapter 
} from './ContentAdapterRegistry';

// Types
export type {
  ViewScope,
  InteractionMode,
  BaseItem,
  ViewScopeConfig,
  ItemInteractionProps,
  ItemViewProps,
  ContentAdapter
} from './types';