import { useRef, useCallback, useMemo } from 'react';
import * as React from 'react';
import type { KeyboardEvent } from 'react';

export interface CommandShortcut {
  keys: string[];
  commandId: string;
  description?: string;
}

export interface UseCommandKeyboardOptions {
  shortcuts?: CommandShortcut[];
  onEscape?: () => boolean | void;
  onEnter?: (selectedItem: string) => void;
  navigationEnabled?: boolean;
}

export interface UseCommandKeyboardReturn {
  // Event handlers
  handleKeyDown: (e: KeyboardEvent) => void;

  // Shortcut utilities
  getShortcutForCommand: (commandId: string) => string[] | undefined;
  formatShortcut: (keys: string[]) => React.ReactNode;

  // Focus management
  focusInput: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

export function useCommandKeyboard({
  shortcuts = [],
  onEscape,
  onEnter,
  navigationEnabled = true,
}: UseCommandKeyboardOptions = {}): UseCommandKeyboardReturn {

  const inputRef = useRef<HTMLInputElement>(null);

  // Create a map for fast shortcut lookup
  const shortcutMap = useMemo(() => {
    const map = new Map<string, CommandShortcut>();
    shortcuts.forEach(shortcut => {
      map.set(shortcut.commandId, shortcut);
    });
    return map;
  }, [shortcuts]);

  // Handle key down events
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Handle escape key
    if (e.key === 'Escape') {
      e.preventDefault();
      const handled = onEscape?.();
      if (handled) {
        e.stopPropagation();
      }
      return;
    }

    // Handle enter key
    if (e.key === 'Enter' && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
      // Let the command menu handle selection
      return;
    }

    // Handle keyboard shortcuts
    if (navigationEnabled && (e.metaKey || e.ctrlKey)) {
      const shortcutKey = e.key.toLowerCase();
      const modifier = e.metaKey ? '⌘' : 'Ctrl';

      for (const shortcut of shortcuts) {
        if (shortcut.keys.length === 2 &&
          shortcut.keys[0] === modifier &&
          shortcut.keys[1].toLowerCase() === shortcutKey) {
          e.preventDefault();
          onEnter?.(shortcut.commandId);
          return;
        }
      }
    }

    // Focus input on any printable character (if not already focused)
    if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      if (document.activeElement !== inputRef.current) {
        inputRef.current?.focus();
      }
    }
  }, [shortcuts, onEscape, onEnter, navigationEnabled]);

  // Get shortcut for a specific command
  const getShortcutForCommand = useCallback((commandId: string): string[] | undefined => {
    return shortcutMap.get(commandId)?.keys;
  }, [shortcutMap]);

  // Format shortcut keys for display
  const formatShortcut = useCallback((keys: string[]): React.ReactNode => {
    return keys.map((key, index) => (
      React.createElement('kbd', { key: index }, key)
    ));
  }, []);

  // Focus the input element
  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  return {
    // Event handlers
    handleKeyDown,

    // Shortcut utilities
    getShortcutForCommand,
    formatShortcut,

    // Focus management
    focusInput,
    inputRef,
  };
}