import type { Meta, StoryObj } from "@storybook/react";
import { FloatingMenu, BubbleMenu, useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const meta = {
  title: "Compositions/Block-based editor*",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  args: {},
  render: () => {
    const editor = useEditor({
      extensions: [
        StarterKit,
      ],
      content: `
        <p>
          Hey, try to select some text here. There will popup a menu for selecting some inline styles.
        </p>
      `,
    })

    return (
      <>
        {editor && <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="bubble-menu inline-flow">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'is-active' : ''}
            >
              Bold
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'is-active' : ''}
            >
              Italic
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={editor.isActive('strike') ? 'is-active' : ''}
            >
              Strike
            </button>
          </div>
        </BubbleMenu>}
        <EditorContent editor={editor} />
      </>
    )
  },
};