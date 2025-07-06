import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEditor, EditorContent } from '@tiptap/react';
import { useState, useCallback } from 'react';
import type { Node } from '@tiptap/pm/model';
import StarterKit from '@tiptap/starter-kit';
import { Mention as TiptapMention } from '@tiptap/extension-mention';
import { mentionSuggestion } from '../compositions/BlockBasedEditor/mentionSuggestion';

const meta = {
  title: "Primitives/Mention",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const MentionEditor = () => {
  const [setMentions] = useState<Array<{id: string, label: string}>>([]);

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
    editorProps: {
      attributes: {
        class: 'tiptap-editor-basic',
      },
    },
    onTransaction: useCallback(({ editor }) => {
      // Track mentions for analytics or other purposes
      const currentMentions: Array<{id: string, label: string}> = [];
      editor.state.doc.descendants((node: Node) => {
        if (node.type.name === 'mention') {
          currentMentions.push({
            id: node.attrs.id,
            label: node.attrs.label
          });
        }
      });
      setMentions(currentMentions);
    }, []),
  });

  return (
    <div className="layer">
      <EditorContent editor={editor} />
    </div>
  );
};

export const Mention: Story = {
  render: () => <MentionEditor />,
};

