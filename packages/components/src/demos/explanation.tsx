import { useMemo } from 'react';
import { getDocumentContentRich, referenceCategories } from '@shared/data';
import { PluginEditor } from '../components/editor/PluginEditor';
import { explanationPlugin } from '../components/editor-plugins/explanation';
import { Reference, createReferenceSuggestion } from '../components/reference/Reference';

// Dynamic explanation: selecting a passage offers an explanation of it in the
// bubble menu. Consumed by the explanation pattern page and
// BubbleMenu.stories.tsx.

const extensions = [
  Reference.configure({ suggestion: createReferenceSuggestion(referenceCategories) }),
];

const content = getDocumentContentRich('doc-climate-change') || '';

export function DynamicExplanationDemo() {
  const plugins = useMemo(
    () => [
      explanationPlugin({ enableExplain: true, streamingEnabled: true, includeReferences: true }),
    ],
    [],
  );
  return (
    <PluginEditor
      plugins={plugins}
      content={content}
      className="rich-editor"
      extensions={extensions}
    />
  );
}
