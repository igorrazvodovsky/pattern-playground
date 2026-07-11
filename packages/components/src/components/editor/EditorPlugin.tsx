import { useEffect } from 'react';
import { useEditorContext } from './EditorProvider';
import type { Plugin } from './types';

interface EditorPluginProps {
  plugin: Plugin;
}

export function EditorPlugin({ plugin }: EditorPluginProps) {
  const context = useEditorContext();

  useEffect(() => {
    const registerPlugin = async () => {
      try {
        await context.registry.register(plugin);
      } catch (error) {
        console.error(`Failed to register plugin ${plugin.id}:`, error);
      }
    };

    registerPlugin();

    return () => {
      context.registry.unregister(plugin.id);
    };
  }, [plugin, context.registry]);

  return null;
}