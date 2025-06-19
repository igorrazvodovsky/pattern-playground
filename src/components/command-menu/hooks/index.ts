// Core hooks
export { useAICommand } from './use-ai-command';
export { useCommandNavigation } from './use-command-navigation';

// Phase 2 extracted hooks
export { useCommandRecents } from './use-command-recents';
export { useCommandKeyboard } from './use-command-keyboard';
export { useCommandSelection } from './use-command-selection';
export { useCommandComposition } from './use-command-composition';

// Hook option types
export type { UseCommandNavigationOptions } from './use-command-navigation';
export type { UseCommandRecentsOptions, UseCommandRecentsReturn } from './use-command-recents';
export type { UseCommandKeyboardOptions, UseCommandKeyboardReturn, CommandShortcut } from './use-command-keyboard';
export type { UseCommandSelectionOptions, UseCommandSelectionReturn, SelectableItem } from './use-command-selection';
export type { UseCommandCompositionOptions, UseCommandCompositionReturn, UnifiedResults } from './use-command-composition';