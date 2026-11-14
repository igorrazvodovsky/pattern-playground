import React from 'react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { EditorProvider } from '../components/editor/EditorProvider.tsx';
import { usePluginEditor } from '../components/editor/usePluginEditor.ts';
import { EditorLayout } from '../components/editor/EditorLayout.tsx';
import { EditorContent as PluginEditorContent } from '../components/editor/slots/EditorContent.tsx';
import { EditorBubbleMenu } from '../components/editor/slots/EditorBubbleMenu.tsx';
import { formattingPlugin } from '../components/editor-plugins/formatting/FormattingPlugin.ts';
import { commentingPlugin } from '../components/editor-plugins/commenting/CommentingPlugin.ts';
import { CommentingIntegration } from '../components/editor-plugins/commenting/components/CommentingIntegration.tsx';
import {
  aiAssistantPlugin,
  type RevisionPreset,
} from '../components/editor-plugins/ai-assistant/index.ts';
import { slashCommandsPlugin } from '../components/editor-plugins/slash-commands/index.ts';
import { referenceCategories } from '@shared/data';

// Contextual actions: selecting a passage brings up, next to it, the actions
// that apply to that passage and no others: formatting, revision presets and
// commenting, each contributed to the one bubble menu by its own plugin. A
// slash typed at the caret opens the command menu there instead: the action
// comes first and nothing is selected.
// Consumed by the contextual-actions pattern page.

const revisions: RevisionPreset[] = [
  { id: 'shorter', label: 'Shorter', instruction: 'Make it shorter.' },
  { id: 'formal', label: 'More formal', instruction: 'Make the tone more formal.' },
];

const content = `
  <h2>Spring arrives earlier</h2>
  <p>Many plants now flower weeks before the insects that pollinate them emerge. Select a sentence to act on it, or type / on an empty line.</p>
  <p></p>
`;

export const ContextualActionsDemo: React.FC = () => {
  const plugins = React.useMemo(
    () => [
      formattingPlugin({ toolbar: false }),
      aiAssistantPlugin({
        enableSummarize: false,
        enableZoomIn: false,
        enableZoomOut: false,
        streamingEnabled: false,
        revisions,
      }),
      commentingPlugin({
        documentId: 'doc-contextual-actions',
        currentUser: 'user-1',
        bubbleMenu: true,
        toolbar: false,
        referenceCategories,
      }),
      slashCommandsPlugin(),
    ],
    [],
  );

  const editor = usePluginEditor(
    {
      extensions: [StarterKit, Highlight],
      content,
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
      <CommentingIntegration config={{ currentUser: 'user-1' }}>
        <EditorLayout>
          <PluginEditorContent />
          <EditorBubbleMenu />
        </EditorLayout>
      </CommentingIntegration>
    </EditorProvider>
  );
};
