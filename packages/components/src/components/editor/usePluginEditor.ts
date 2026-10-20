import { useEffect, useMemo } from 'react';
import { useEditor, type UseEditorOptions } from '@tiptap/react';
import { flattenExtensions, type Extensions } from '@tiptap/core';
import type { Plugin } from './types';

// Creates the editor for an EditorProvider with the plugins' extensions
// installed beside the host's. A plugin extension is skipped when an extension
// of the same name is already present, so a host's StarterKit wins over a
// plugin's Bold, and two plugins offering Reference install it once. A kit
// whose children overlap what is already present is skipped whole, since
// installing it would duplicate them.
export function mergePluginExtensions(host: Extensions, plugins: readonly Plugin[]): Extensions {
  const names = new Set(flattenExtensions(host).map((extension) => extension.name));
  const merged = [...host];

  for (const plugin of plugins) {
    for (const extension of plugin.getExtensions?.() ?? []) {
      if (names.has(extension.name)) continue;
      const added = flattenExtensions([extension]).map(({ name }) => name);
      const overlap = added.filter((name) => names.has(name));
      if (overlap.length > 0) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `[usePluginEditor] Skipped '${extension.name}' from plugin '${plugin.id}': ` +
              `the editor already has ${overlap.join(', ')}.`,
          );
        }
        continue;
      }
      for (const name of added) names.add(name);
      merged.push(extension);
    }
  }

  return merged;
}

// Pass the same plugins array to EditorProvider. It must be stable (useMemo):
// a new array creates a new editor. Extensions are read when the editor is
// created; editorProps and the other options follow later renders, as they do
// with a plain useEditor.
export function usePluginEditor(options: UseEditorOptions, plugins: readonly Plugin[]) {
  // Extensions only matter at creation, which plugins alone decides.
  const extensions = useMemo(
    () => mergePluginExtensions(options.extensions ?? [], plugins),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plugins],
  );
  const editor = useEditor({ ...options, extensions }, [plugins]);

  // useEditor stops syncing options once it has deps, so do it here.
  // Editability stays with the editor, as useEditor leaves it.
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const changed = (Object.keys(options) as (keyof UseEditorOptions)[]).some(
      (key) =>
        key !== 'extensions' &&
        key !== 'editable' &&
        typeof options[key] !== 'function' &&
        options[key] !== editor.options[key as keyof typeof editor.options],
    );
    if (!changed) return;
    editor.setOptions({ ...options, extensions, editable: editor.isEditable });
  });

  return editor;
}
