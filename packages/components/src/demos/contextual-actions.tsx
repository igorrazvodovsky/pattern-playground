import { useMemo } from 'react';
import { referenceCategories } from '@shared/data';
import { PluginEditor } from '../components/editor/PluginEditor';
import { formattingPlugin } from '../components/editor-plugins/formatting/FormattingPlugin';
import { commentingPlugin } from '../components/editor-plugins/commenting/CommentingPlugin';
import { CommentingIntegration } from '../components/editor-plugins/commenting/components/CommentingIntegration';
import { aiAssistantPlugin, type RevisionPreset } from '../components/editor-plugins/ai-assistant';
import { slashCommandsPlugin } from '../components/editor-plugins/slash-commands';

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

const currentUser = 'user-1';

export function ContextualActionsDemo() {
  const plugins = useMemo(
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
        currentUser,
        bubbleMenu: true,
        toolbar: false,
        referenceCategories,
      }),
      slashCommandsPlugin(),
    ],
    [],
  );

  return (
    <PluginEditor
      plugins={plugins}
      content={content}
      className="rich-editor"
      frame={(layout) => (
        <CommentingIntegration config={{ currentUser }}>{layout}</CommentingIntegration>
      )}
    />
  );
}
