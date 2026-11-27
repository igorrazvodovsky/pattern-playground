import { useMemo } from 'react';
import { getDocumentContentRich, referenceCategories } from '@shared/data';
import { PluginEditor } from '../components/editor/PluginEditor';
import { aiAssistantPlugin, type RevisionPreset } from '../components/editor-plugins/ai-assistant';
import { Reference, createReferenceSuggestion } from '../components/reference/Reference';

// Instructed revision: the actor selects a passage of the document and says
// what to change about it. The revision replaces the passage in the document
// itself, so it is what everyone who opens the document reads, and the
// editor's undo is the only way back. Consumed by the instructed-revision
// pattern page and BubbleMenu.stories.tsx.

const revisions: RevisionPreset[] = [
  { id: 'shorter', label: 'Shorter', instruction: 'Make it shorter.' },
  { id: 'longer', label: 'Longer', instruction: 'Make it longer, with more detail.' },
  { id: 'formal', label: 'More formal', instruction: 'Make the tone more formal.' },
  { id: 'casual', label: 'More casual', instruction: 'Make the tone more casual.' },
];

const extensions = [
  Reference.configure({ suggestion: createReferenceSuggestion(referenceCategories) }),
];

const content = getDocumentContentRich('doc-climate-change') || '';

export function InstructedRevisionDemo() {
  const plugins = useMemo(
    () => [
      aiAssistantPlugin({
        enableSummarize: false,
        enableZoomIn: false,
        enableZoomOut: false,
        streamingEnabled: false,
        revisions,
      }),
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
