// Core components
export { ItemView } from './ItemView';
export { ItemInteraction } from './ItemInteraction';
export { DefaultFallbackRenderer } from './DefaultFallbackRenderer';

// Binding context: shared bindings + custom components, overridable per host
export {
  ItemViewProvider,
  useItemViewContext,
  useEntityBinding,
  useCustomComponent,
} from './provider';
export { defaultCustomComponents } from './custom-components';

// Types
export type {
  ViewScope,
  InteractionMode,
  BoundEntity,
  BaseItem,
  ViewScopeConfig,
  ItemInteractionProps,
  ItemViewProps,
  CustomAttributeProps,
  CustomComponents,
  AttributeBinding,
  EntityBinding,
} from './types';
