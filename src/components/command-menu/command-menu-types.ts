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
  id: string;
  name: string;
  icon?: string;
  shortcut?: string[];
  children?: CommandChildData[];
  searchableText?: string;
}

export interface CommandChildData {
  id: string;
  name: string;
  icon?: string;
  searchableText?: string;
}

export interface RecentItem {
  id: string;
  name: string;
  icon?: string;
  searchableText?: string;
  timestamp?: number;
}

// Import and re-export AI types for use in props
import type { AICommandResult, AICommandItem } from './ai-command-types';
export type { AICommandResult, AICommandItem };

// Union type for all possible command items
export type CommandItem = CommandData | CommandChildData;