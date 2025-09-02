import type { Editor, Extension } from '@tiptap/core';
import type { ReactNode } from 'react';
import type { Transaction } from '@tiptap/pm/state';

export interface Plugin {
  id: string;
  name: string;
  version: string;
  dependencies?: string[];
  capabilities?: PluginCapabilities;

  onInstall?(context: EditorContext): void | Promise<void>;
  onActivate?(context: EditorContext): void;
  onDeactivate?(): void;
  onUninstall?(): void;
  onDestroy?(): void;

  registerUI?(slots: SlotRegistry): void;
  subscribeToEvents?(eventBus: EventBus): void;
  getExtensions?(): Extension[];
  configure?(config: unknown): void;
}

// Plugin states with const assertion for immutability
export const PLUGIN_STATES = ['pending', 'loading', 'active', 'error', 'deactivated'] as const;
export type PluginState = typeof PLUGIN_STATES[number];

// Plugin capabilities with better typing
export interface PluginCapabilities {
  readonly requiresSelection?: boolean;
  readonly modifiesContent?: boolean;
  readonly providesUI?: boolean;
  readonly requiresNetwork?: boolean;
  readonly supportsStreaming?: boolean;
  readonly conflictsWith?: readonly string[]; // Immutable array of conflicting plugin IDs
}

export interface EditorContext {
  editor: Editor;
  eventBus: EventBus;
  registry: PluginRegistry;
  slots: SlotRegistry;
  getPlugin: <T extends Plugin>(id: string) => T | undefined;
}

// Template literal types for better autocomplete and type safety
type SlotPrefix = 'editor' | 'plugin';
type SlotSuffix = 'toolbar' | 'bubble-menu' | 'floating-menu' | 'sidebar' | 'statusbar';
type StandardSlotId = `${SlotPrefix}-${SlotSuffix}`;

export type SlotId = StandardSlotId | 'toolbar' | 'bubble-menu' | 'floating-menu' | 'sidebar' | 'statusbar' | string;

export interface SlotComponent {
  pluginId: string;
  render: () => ReactNode | HTMLElement;
  cleanup?: () => void;
}

// Use const assertion for immutable options
export const SLOT_POSITIONS = ['start', 'end', 'replace'] as const;
export type SlotPosition = typeof SLOT_POSITIONS[number];

export interface SlotRegistrationOptions {
  priority?: number;
  condition?: () => boolean;
  position?: SlotPosition;
}

export interface SlotRegistry {
  register(
    slotId: SlotId,
    component: SlotComponent,
    options?: SlotRegistrationOptions
  ): void;
  getComponents(slotId: SlotId): SlotComponent[];
  update(slotId: SlotId, pluginId: string, component: SlotComponent): void;
}

export type EventPayload = {
  'selection:change': { from: number; to: number; content: string };
  'content:change': { transaction: Transaction };
  'plugin:activate': { pluginId: string };
  'plugin:deactivate': { pluginId: string };
  'command:execute': { command: string; params?: unknown };
  'ui:slot-update': { slotId: string; pluginId: string };
  'commenting:initialized': { documentId: string; currentUser: string };
  'commenting:quote-reference-click': { quoteId: string };
  'commenting:create-quote-comment': { params?: unknown };
  'commenting:show-comments': { quoteId?: string };
  'commenting:selection-change': { from: number; to: number; content: string };
  'quote:created': { quote: any; pointer: any };
  'references:selection-changed': { hasSelection: boolean; selectedText: string; range: { from: number; to: number } };
  'references:data-updated': { data: unknown };
  'references:reference-inserted': { reference: unknown };
  'ai-assistant:selection-changed': { hasSelection: boolean; selectedText: string; range: { from: number; to: number } };
  'ai-assistant:chunk-received': { action: string; content: string; range: { from: number; to: number } };
  'ai-assistant:action-complete': { action: string };
  'ai-assistant:action-error': { action: string; error: string };
  [key: string]: unknown;
};

// Event name validation with template literal types
type EventCategory = 'selection' | 'content' | 'plugin' | 'command' | 'ui' | 'commenting' | 'references' | 'ai-assistant';
type EventName<T extends EventCategory> = `${T}:${string}`;
export type TypedEventName = EventName<EventCategory>;

// Const assertion for event priorities
export const EVENT_PRIORITIES = ['high', 'normal', 'low'] as const;
export type EventPriority = typeof EVENT_PRIORITIES[number];

export interface EventBus {
  emit<T extends keyof EventPayload>(
    event: T,
    payload: EventPayload[T],
    options?: {
      priority?: EventPriority;
      cancelable?: boolean;
    }
  ): boolean;

  on<T extends keyof EventPayload>(
    event: T,
    handler: (payload: EventPayload[T]) => void,
    options?: {
      priority?: number;
      once?: boolean;
      signal?: AbortSignal; // Modern AbortController support
    }
  ): () => void;

  intercept<T extends keyof EventPayload>(
    event: T,
    interceptor: (payload: EventPayload[T]) => EventPayload[T] | null
  ): void;

  // New methods for modern event handling
  clear(): void;
  getListenerCount(event?: string): number;
}

export interface PluginRegistry {
  register(plugin: Plugin): Promise<void>;
  unregister(pluginId: string): void;
  get<T extends Plugin>(pluginId: string): T | undefined;
  getAll(): readonly Plugin[]; // Immutable array return
  has(pluginId: string): boolean;
  getLoadOrder(): readonly string[]; // Immutable array return
  
  // Modern additions
  getState(pluginId: string): PluginState | undefined;
  destroy(): void;
}