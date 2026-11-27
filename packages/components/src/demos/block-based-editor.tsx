import { useMemo } from 'react';
import { referenceCategories } from '@shared/data';
import { PluginEditor } from '../components/editor/PluginEditor';
import { formattingPlugin } from '../components/editor-plugins/formatting/FormattingPlugin';
import { Reference, createReferenceSuggestion } from '../components/reference/Reference';

// Shared block-based-editor demo consumed by the Storybook story
// (BlockBasedEditor.stories.tsx) and the pattern site (via @pkg/demos/block-based-editor).

const extensions = [
  Reference.configure({
    HTMLAttributes: { class: 'reference-mention reference' },
    suggestion: createReferenceSuggestion(referenceCategories),
  }),
];

const content = '<p>Select some text to format it, or type @ to reference a document.</p>';

export function BlockBasedEditorDemo() {
  const plugins = useMemo(() => [formattingPlugin()], []);
  return (
    <PluginEditor
      plugins={plugins}
      content={content}
      label="Block editor"
      extensions={extensions}
    />
  );
}
