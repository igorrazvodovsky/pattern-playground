import type { Meta, StoryObj } from "@storybook/react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import { mentionSuggestion } from '../compositions/BlockBasedEditor/mentionSuggestion'; // Adjusted path
import '../../styles/mentions.css'; // Ensure styles are loaded for the story
import '../../styles/bubble-menu.css'; // Base styles for editor
import '../../styles/main.css'; // Ensure all styles are loaded for consistency

const meta = {
  title: "Primitives/Mention",
  component: EditorContent, // We are showcasing the editor's mention capability
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof EditorContent>;

export default meta;
type Story = StoryObj<typeof meta>;

const MentionEditor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Mention.configure({
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

  return <EditorContent editor={editor} />;
};

export const Default: Story = {
  render: () => <MentionEditor />,
  args: {},
};

export const PreFilled: Story = {
    render: () => {
        const editor = useEditor({
            extensions: [
              StarterKit,
              Mention.configure({
                HTMLAttributes: {
                  class: 'mention',
                },
                suggestion: mentionSuggestion,
              }),
            ],
            content: `
              <p>
                This editor starts with a pre-filled mention: <span data-type="mention" data-id="3" class="mention">Charlie</span>.
              </p>
              <p>You can add more, like @Dav</p>
            `,
            editorProps: {
              attributes: {
                class: 'tiptap-editor-basic',
              },
            },
          });
        return <EditorContent editor={editor} />;
    },
    args: {},
}
