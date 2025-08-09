// Progressive enhancement Web Components - import for side effects
import './base-item-view';
import './item-interaction';
import './item-preview';
import './item-detail';
import './item-full-view';

// Classes (for programmatic usage)
export { BaseItemView } from './base-item-view';
export { PPItemInteraction } from './item-interaction';
export { PPItemPreview } from './item-preview'; 
export { PPItemDetail } from './item-detail';
export { PPItemFullView } from './item-full-view';

// Types
export type {
  ViewScope,
  InteractionMode,
  BaseItem,
  ViewScopeConfig,
  ItemInteractionConfig
} from './types';