import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { Reference, createReferenceSuggestion } from '../../../components/reference/Reference';
import { referenceCategories } from '../../data';
import { EditorProvider } from '../../../components/editor/EditorProvider';
import { EditorLayout } from '../../../components/editor/EditorLayout';
import { EditorContent } from '../../../components/editor/slots/EditorContent';
import { EditorBubbleMenu } from '../../../components/editor/slots/EditorBubbleMenu';
import { formattingPlugin } from '../../../components/editor-plugins/formatting/FormattingPlugin';
import '../../../jsx-types';

const meta = {
  title: "Compositions/Block-based editor",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  args: {},
  render: () => {
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
  },
};


