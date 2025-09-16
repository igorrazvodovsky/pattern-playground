import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Editor } from '@tiptap/core';
import { EventBus } from '../editor-plugins/core/EventBus';
import { PluginRegistry } from '../editor-plugins/core/PluginRegistry';
import { SlotRegistry } from '../editor-plugins/core/SlotRegistry';
import type { EditorContext, Plugin } from './types';

interface EditorDebug {
  plugins: () => Plugin[];
  events: () => unknown[];
  registry: PluginRegistry;
  eventBus: EventBus;
  slots: SlotRegistry;
  context?: EditorContext;
  performance: {
    pluginLoadTime: Map<string, number>;
    eventProcessingTime: Map<string, number>;
    renderCount: number;
    activePlugins: number;
    totalEvents: number;
  };
  triggerEvent: (event: string, payload: unknown) => void;
}

declare global {
  interface Window {
    __editorDebug?: EditorDebug;
  }
}

interface EditorProviderProps {
  children: React.ReactNode;
  editor?: Editor;
  plugins?: Plugin[];
  onReady?: (context: EditorContext) => void;
}

const EditorContextReact = createContext<EditorContext | null>(null);

export function EditorProvider({ 
  children, 
  editor: providedEditor,
  plugins = [],
  onReady 
}: EditorProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const contextRef = useRef<EditorContext | null>(null);
  const editorRef = useRef<Editor | null>(providedEditor ?? null);
  const eventBusRef = useRef<EventBus>(new EventBus());
  const slotRegistryRef = useRef<SlotRegistry>(new SlotRegistry());
  const pluginRegistryRef = useRef<PluginRegistry | null>(null);

  useEffect(() => {
    if (!editorRef.current && !providedEditor) {
      console.warn('EditorProvider: No editor instance provided');
      return;
    }

    if (providedEditor && !editorRef.current) {
      editorRef.current = providedEditor;
    }

    // Capture ref values to avoid stale closures in cleanup
    const eventBus = eventBusRef.current;
    const slotRegistry = slotRegistryRef.current;

    const context: EditorContext = {
      editor: editorRef.current!,
      eventBus: eventBusRef.current,
      slots: slotRegistryRef.current,
      registry: null as unknown as PluginRegistry,
      getPlugin: (id: string) => pluginRegistryRef.current?.get(id),
    };

    const registry = new PluginRegistry(context);
    pluginRegistryRef.current = registry;
    context.registry = registry;
    
    // Add performance monitoring in development
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      window.__editorDebug = {
        plugins: registry.getAll.bind(registry),
        events: eventBusRef.current.getHistory?.bind(eventBusRef.current) || (() => []),
        registry,
        eventBus: eventBusRef.current,
        slots: slotRegistryRef.current,
        performance: {
          pluginLoadTime: new Map(),
          eventProcessingTime: new Map(),
          renderCount: 0,
          activePlugins: 0,
          totalEvents: 0,
        },
      };
    }
    contextRef.current = context;

    const loadPlugins = async () => {
      // Store context in editor storage for plugin access
      if (editorRef.current) {
        editorRef.current.storage.editorContext = context;
      }

      for (const plugin of plugins) {
        try {
          await registry.register(plugin);
        } catch (error) {
          console.error(`Failed to register plugin ${plugin.id}:`, error);
        }
      }
      setIsReady(true);
      onReady?.(context);
    };

    loadPlugins();

    // Set up editor event listeners to emit plugin events
    if (editorRef.current) {
      const editor = editorRef.current;
      
      const emitSelectionChange = () => {
        const { from, to } = editor.state.selection;
        const content = editor.state.doc.textBetween(from, to);
        
        // Debug selection issues
        if (process.env.NODE_ENV === 'development' && content.length > 50) {
          console.log('EditorProvider selection debug:', {
            from,
            to,
            selectionLength: to - from,
            contentLength: content.length,
            content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
            selectionEmpty: from === to
          });
        }
        
        eventBusRef.current.emit('selection:change', {
          from,
          to,
          content
        });
      };

      // Listen to selection updates
      editor.on('selectionUpdate', emitSelectionChange);
      
      // Clean up listeners on unmount
      const cleanup = () => {
        editor.off('selectionUpdate', emitSelectionChange);
      };
      
      return cleanup;
    }

    if (process.env.NODE_ENV === 'development') {
      window.__editorDebug = {
        context,
        plugins: registry.getAll(),
        events: eventBusRef.current,
        slots: slotRegistryRef.current,
        triggerEvent: (event: string, payload: unknown) =>
          eventBusRef.current.emit(event, payload),
      };
    }

    return () => {
      registry.destroy();
      eventBus.clear();
      slotRegistry.clear();
      
      if (process.env.NODE_ENV === 'development') {
        delete window.__editorDebug;
      }
    };
  }, [providedEditor, plugins, onReady]);

  if (!isReady || !contextRef.current) {
    return null;
  }

  return (
    <EditorContextReact.Provider value={contextRef.current}>
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