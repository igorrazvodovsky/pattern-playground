import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Mention as TiptapMention } from '@tiptap/extension-mention';
import { mentionSuggestion } from '../compositions/BlockBasedEditor/mentionSuggestion'; // Adjusted path

const meta = {
  title: "Primitives/Mention",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const MentionEditor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapMention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: mentionSuggestion,
      }),
    ],
    content: `
      <p>
        Try typing @ to trigger mention suggestions. For example, @Al or @Bo.
      </p>
      <p>
        You can mention users like <span data-type="mention" data-id="1" class="mention">Alice</span> or <span data-type="mention" data-id="2" class="mention">Bob</span>.
      </p>
    `,
    editorProps: {
      attributes: {
        class: 'tiptap-editor-basic', // Add a class for basic editor styling if needed
      },
    },
  });

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', minHeight: '200px' }}>
      <EditorContent editor={editor} />
    </div>
  );
};

export const Mention: Story = {
  render: () => <MentionEditor />,
};

