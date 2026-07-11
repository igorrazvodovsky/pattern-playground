import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { Reference, createReferenceSuggestion } from '../components/reference/Reference';
import { referenceCategories } from '@shared/data';
import { EditorProvider } from '../components/editor/EditorProvider';
import { EditorLayout } from '../components/editor/EditorLayout';
import { EditorContent } from '../components/editor/slots/EditorContent';
import { EditorBubbleMenu } from '../components/editor/slots/EditorBubbleMenu';
import { formattingPlugin } from '../components/editor-plugins/formatting/FormattingPlugin';
import '../jsx-types';

// Shared block-based-editor demo consumed by the Storybook story
// (BlockBasedEditor.stories.tsx) and the pattern site (via @pkg/demos/block-based-editor).

export const BlockBasedEditorDemo = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Reference.configure({
        HTMLAttributes: {
          class: 'reference-mention reference',
        },
        suggestion: createReferenceSuggestion(referenceCategories),
      }),
    ],
    content: `
      <p>
        Hey, try to select some text here. There will popup a menu for selecting some inline styles. Try typing @ to trigger mentions!
      </p>
    `,
    editorProps: {
      attributes: {
        'aria-label': 'Block editor',
      },
    },
    immediatelyRender: false,
  });

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="layer">
      <EditorProvider editor={editor} plugins={[formattingPlugin()]}>
        <EditorLayout>
          <div className="editor-content-wrapper">
            <EditorContent />
            <EditorBubbleMenu />
          </div>
        </EditorLayout>
      </EditorProvider>
    </div>
  );
};
