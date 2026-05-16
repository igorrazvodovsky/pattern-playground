export interface CommandMenuProps {
  // Core data
  data: CommandData[];
  recentItems?: RecentItem[];

  // Behavior configuration
  onSelect?: (item: CommandItem | RecentItem | AICommandItem) => void;
  onEscape?: () => boolean | void;
  onClose?: () => void;

  // AI configuration (optional)
  aiConfig?: {
    onAIRequest: (prompt: string) => Promise<AICommandResult>;
    debounceMs?: number;
    minInputLength?: number;
    availableFilters?: string[];
    availableValues?: Record<string, string[]>;
  };

  // Feature toggles
  showRecents?: boolean;
  enableNavigation?: boolean;
  enableAI?: boolean;

  // UI customization
  placeholder?: string;
  emptyMessage?: string;
  className?: string;

  // AI messages customization
  aiMessages?: {
    emptyStateMessage?: string;
    noResultsMessage?: string;
    aiProcessingMessage?: string;
    aiErrorPrefix?: string;
  };
}

export interface CommandData {
  readonly id: string;
  readonly name: string;
  readonly icon?: string;
  readonly shortcut?: readonly string[];
  readonly children?: readonly CommandChildData[];
  readonly searchableText?: string;
}

export interface CommandChildData {
  readonly id: string;
  readonly name: string;
  readonly icon?: string;
  readonly searchableText?: string;
}

export interface RecentItem {
  readonly id: string;
  readonly name: string;
  readonly icon?: string;
  readonly searchableText?: string;
  readonly timestamp?: number;
}

// Import and re-export AI types for use in props
import type { AICommandResult, AICommandItem } from './ai-command-types';
export type { AICommandResult, AICommandItem };

// Union type for all possible command items
export type CommandItem = CommandData | CommandChildData;