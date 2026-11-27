import { useMemo, type ReactNode } from 'react';
import type { Content, Extensions } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { EditorProvider } from './EditorProvider';
import { EditorLayout } from './EditorLayout';
import { usePluginEditor } from './usePluginEditor';
import { EditorContent } from './slots/EditorContent';
import { EditorBubbleMenu } from './slots/EditorBubbleMenu';
import { EditorToolbar } from './slots/EditorToolbar';
import type { Plugin } from './types';

// A plugin editor with the usual host set-up: StarterKit and Highlight, the
// content, an optional toolbar row, and the bubble menu. The plugins decide
// what the editor offers. `immediatelyRender: false` keeps it safe to mount in
// a client-only island.

interface PluginEditorProps {
  /** Must be stable (useMemo): a new array creates a new editor. */
  plugins: Plugin[];
  content: Content;
  /** The editor's accessible name. */
  label?: string;
  /** Added to the editable element, such as `rich-editor` for block styling. */
  className?: string;
  /** Host extensions beside StarterKit and Highlight. Read once, when the editor is created. */
  extensions?: Extensions;
  /** Show the toolbar slot above the content. */
  toolbar?: boolean;
  /** Wraps the layout inside the provider, for plugins that need a context of their own. */
  frame?: (layout: ReactNode) => ReactNode;
}

export function PluginEditor({
  plugins,
  content,
  label = 'Document editor',
  className,
  extensions = [],
  toolbar = false,
  frame = (layout) => layout,
}: PluginEditorProps) {
  // Stable options, so usePluginEditor does not reset them on every render.
  const editorProps = useMemo(
    () => ({ attributes: { 'aria-label': label, ...(className ? { class: className } : {}) } }),
    [label, className],
  );
  const editor = usePluginEditor(
    {
      extensions: [StarterKit, Highlight, ...extensions],
      content,
      editorProps,
      immediatelyRender: false,
    },
    plugins,
  );

  if (!editor) return <div>Loading editor...</div>;

  return (
    <EditorProvider editor={editor} plugins={plugins}>
      {frame(
        <EditorLayout>
          {toolbar && <EditorToolbar className="toolbar" />}
          <EditorContent />
          <EditorBubbleMenu />
        </EditorLayout>,
      )}
    </EditorProvider>
  );
}
