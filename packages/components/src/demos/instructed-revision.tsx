import React from 'react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { Reference, createReferenceSuggestion } from '../components/reference/index.js';
import { EditorProvider } from '../components/editor/EditorProvider.tsx';
import { usePluginEditor } from '../components/editor/usePluginEditor.ts';
import { EditorLayout } from '../components/editor/EditorLayout.tsx';
import { EditorContent as PluginEditorContent } from '../components/editor/slots/EditorContent.tsx';
import { EditorBubbleMenu } from '../components/editor/slots/EditorBubbleMenu.tsx';
import {
  aiAssistantPlugin,
  type RevisionPreset,
} from '../components/editor-plugins/ai-assistant/index.ts';
import { getDocumentContentRich, referenceCategories } from '@shared/data';

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

export const InstructedRevisionDemo: React.FC = () => {
  const richContent = getDocumentContentRich('doc-climate-change');
  const plugins = React.useMemo(
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

  const editor = usePluginEditor(
    {
      extensions: [
        StarterKit,
        Highlight,
        Reference.configure({
          suggestion: createReferenceSuggestion(referenceCategories),
        }),
      ],
      content: richContent || '',
      editorProps: {
        attributes: {
          'class': 'rich-editor',
          'aria-label': 'Document editor',
        },
      },
      immediatelyRender: false,
    },
    plugins,
  );

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <EditorProvider editor={editor} plugins={plugins}>
      <EditorLayout>
        <PluginEditorContent />
        <EditorBubbleMenu />
      </EditorLayout>
    </EditorProvider>
  );
};
