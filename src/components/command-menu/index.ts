export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandItemPrefix,
  CommandItemSuffix,
} from './command';

export { AICommandEmpty } from './ai-command-empty';

// Core hooks
export { useAICommand } from './hooks/use-ai-command';
export { useCommandNavigation } from './hooks/use-command-navigation';

// Phase 2 extracted hooks
export {
  useCommandRecents,
  useCommandKeyboard,
  useCommandSelection,
  useCommandComposition,
} from './hooks';

// New comprehensive component
export { CommandMenu } from './command-menu';

export type {
  AIState,
  AICommandResult,
  AICommandItem,
  AICommandEmptyProps,
} from './ai-command-types';

export type {
  CommandMenuProps,
  CommandData,
  CommandChildData,
  RecentItem,
  CommandItem as CommandMenuCommandItem,
} from './command-menu-types';

// Phase 2 hook types
export type {
  UseCommandNavigationOptions,
  UseCommandRecentsOptions,
  UseCommandRecentsReturn,
  UseCommandKeyboardOptions,
  UseCommandKeyboardReturn,
  CommandShortcut,
  UseCommandSelectionOptions,
  UseCommandSelectionReturn,
  SelectableItem,
  UseCommandCompositionOptions,
  UseCommandCompositionReturn,
  UnifiedResults,
} from './hooks';