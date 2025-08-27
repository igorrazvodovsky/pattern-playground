import { lazy, Suspense, useEffect, useState } from 'react';
import { useEditorContext } from './EditorProvider';
import type { Plugin } from './types';

interface LazyEditorPluginProps {
  loader: () => Promise<{ default: () => Plugin }>;
  fallback?: React.ReactNode;
}

/**
 * Lazy-loads editor plugins for improved performance.
 * Plugins are only loaded when the editor is ready and visible.
 */
export function LazyEditorPlugin({ loader, fallback = null }: LazyEditorPluginProps) {
  const context = useEditorContext();
  const [plugin, setPlugin] = useState<Plugin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadPlugin = async () => {
      try {
        setIsLoading(true);
        const module = await loader();
        
        if (!mounted) return;
        
        const pluginInstance = module.default();
        setPlugin(pluginInstance);
        
        // Register the plugin
        await context.registry.register(pluginInstance);
      } catch (err) {
        if (!mounted) return;
        
        const error = err instanceof Error ? err : new Error('Failed to load plugin');
        setError(error);
        console.error('Failed to load plugin:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Use Intersection Observer for viewport-based lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && isLoading && !error) {
          loadPlugin();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    // Observe the editor element if it exists
    const editorElement = context.editor?.view?.dom;
    if (editorElement) {
      observer.observe(editorElement);
    } else {
      // If no editor element, load immediately
      loadPlugin();
    }

    return () => {
      mounted = false;
      observer.disconnect();
      
      // Unregister plugin on cleanup
      if (plugin) {
        context.registry.unregister(plugin.id);
      }
    };
  }, [loader, context.registry, context.editor]);

  if (error) {
    return <div className="plugin-error">Failed to load plugin: {error.message}</div>;
  }

  if (isLoading) {
    return <>{fallback}</>;
  }

  return null;
}

/**
 * Creates a lazy-loadable plugin module
 * @param importFn - Dynamic import function for the plugin
 * @returns A loader function compatible with LazyEditorPlugin
 */
export function createPluginLoader<T extends Plugin>(
  importFn: () => Promise<{ [key: string]: any }>
): () => Promise<{ default: () => T }> {
  return async () => {
    const module = await importFn();
    
    // Find the plugin factory function
    // First check for default export, then look for first function value
    let pluginFactory: any = module.default;
    
    if (!pluginFactory) {
      // Look for the first function in the module exports
      const firstKey = Object.keys(module)[0];
      if (firstKey && typeof module[firstKey] === 'function') {
        pluginFactory = module[firstKey];
      }
    }
    
    if (!pluginFactory || typeof pluginFactory !== 'function') {
      throw new Error('No plugin factory function found in module');
    }
    
    return { default: pluginFactory };
  };
}