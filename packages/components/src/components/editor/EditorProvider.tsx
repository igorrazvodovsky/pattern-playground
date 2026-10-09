import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Editor } from '@tiptap/core';
import { EventBus } from '../editor-plugins/core/EventBus';
import { PluginRegistry } from '../editor-plugins/core/PluginRegistry';
import { SlotRegistry } from '../editor-plugins/core/SlotRegistry';
import type { EditorContext, EventPayload, Plugin } from './types';

interface EditorDebug {
  plugins: () => readonly Plugin[];
  events: () => readonly unknown[];
  registry: PluginRegistry;
  eventBus: EventBus;
  slots: SlotRegistry;
  context: EditorContext;
  performance: {
    pluginLoadTime: Map<string, number>;
    eventProcessingTime: Map<string, number>;
    renderCount: number;
    activePlugins: number;
    totalEvents: number;
  };
  triggerEvent: <T extends keyof EventPayload>(event: T, payload: EventPayload[T]) => boolean;
}

declare global {
  interface Window {
    __editorDebug?: EditorDebug;
  }
}

interface EditorProviderProps {
  children: React.ReactNode;
  editor?: Editor;
  // Changing this array tears down and reloads every plugin, so hosts should
  // keep it stable (useMemo) rather than build it inline.
  plugins?: Plugin[];
  onReady?: (context: EditorContext) => void;
}

const EditorContextReact = createContext<EditorContext | null>(null);

export function EditorProvider({
  children,
  editor,
  plugins = [],
  onReady
}: EditorProviderProps) {
  const [readyContext, setReadyContext] = useState<EditorContext | null>(null);
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  });

  // Each editor/plugins pair gets its own bus, slots, and registry, torn down
  // in full when either changes, so plugin subscriptions never accumulate.
  useEffect(() => {
    if (!editor) {
      console.warn('EditorProvider: No editor instance provided');
      return;
    }

    const eventBus = new EventBus();
    const slotRegistry = new SlotRegistry();

    const context: EditorContext = {
      editor,
      eventBus,
      slots: slotRegistry,
      registry: null as unknown as PluginRegistry,
      getPlugin: (id: string) => registry.get(id),
    };

    const registry = new PluginRegistry(context);
    context.registry = registry;

    // Add performance monitoring in development
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      window.__editorDebug = {
        context,
        plugins: registry.getAll.bind(registry),
        events: eventBus.getEventHistory.bind(eventBus),
        registry,
        eventBus,
        slots: slotRegistry,
        triggerEvent: (event, payload) => eventBus.emit(event, payload),
        performance: {
          pluginLoadTime: new Map(),
          eventProcessingTime: new Map(),
          renderCount: 0,
          activePlugins: 0,
          totalEvents: 0,
        },
      };
    }

    // Store context in editor storage for plugin access
    editor.storage.editorContext = context;

    let disposed = false;

    const loadPlugins = async () => {
      for (const plugin of plugins) {
        if (disposed) break;
        try {
          await registry.register(plugin);
        } catch (error) {
          console.error(`Failed to register plugin ${plugin.id}:`, error);
        }
      }

      // A plugin can finish activating after cleanup has run; tear it down too.
      if (disposed) {
        registry.destroy();
        return;
      }

      setReadyContext(context);
      onReadyRef.current?.(context);
    };

    loadPlugins();

    // Forward editor selection updates onto the plugin event bus
    const emitSelectionChange = () => {
      const { from, to } = editor.state.selection;
      const content = editor.state.doc.textBetween(from, to);

      eventBus.emit('selection:change', {
        from,
        to,
        content
      });
    };
    editor.on('selectionUpdate', emitSelectionChange);

    return () => {
      disposed = true;
      editor.off('selectionUpdate', emitSelectionChange);
      registry.destroy();
      eventBus.clear();
      slotRegistry.clear();

      if (editor.storage.editorContext === context) {
        delete editor.storage.editorContext;
      }
      if (window.__editorDebug?.context === context) {
        delete window.__editorDebug;
      }

      setReadyContext(null);
    };
  }, [editor, plugins]);

  if (!readyContext) {
    return null;
  }

  return (
    <EditorContextReact.Provider value={readyContext}>
      {children}
    </EditorContextReact.Provider>
  );
}

export function useEditorContext(): EditorContext {
  const context = useContext(EditorContextReact);
  if (!context) {
    throw new Error('useEditorContext must be used within EditorProvider');
  }
  return context;
}

export function usePlugin<T extends Plugin>(pluginId: string): T | undefined {
  const { registry } = useEditorContext();
  return registry.get<T>(pluginId);
}

export function useEditorEvents() {
  const { eventBus } = useEditorContext();
  return eventBus;
}