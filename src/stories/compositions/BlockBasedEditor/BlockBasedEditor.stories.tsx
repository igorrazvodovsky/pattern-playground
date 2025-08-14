import type { Meta, StoryObj } from "@storybook/react-vite";
import { BubbleMenu, FloatingMenu, useEditor, EditorContent } from '@tiptap/react'
import { useState, useCallback } from 'react'
import type { Node } from '@tiptap/pm/model'
import StarterKit from '@tiptap/starter-kit'
import { Reference, createReferenceSuggestion } from '../../../components/reference/Reference';
import { referenceCategories } from '../../data';
import '../../../jsx-types';

const meta = {
  title: "Compositions/Block-based editor",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  args: {},
  render: () => {
    const [selection, setSelection] = useState({ from: 0, to: 0, text: '' });
    const [mentions, setMentions] = useState<Array<{id: string, label: string}>>([]);

    const editor = useEditor({
      extensions: [
        StarterKit,
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
      onTransaction: useCallback(({ editor }) => {
        // Track selection for bubble menu optimization
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, ' ');
        setSelection({ from, to, text: selectedText });

        // Track mentions
        const currentMentions: Array<{id: string, label: string}> = [];
        editor.state.doc.descendants((node: Node) => {
          if (node.type.name === 'reference-mention') {
            currentMentions.push({
              id: node.attrs.id,
              label: node.attrs.label
            });
          }
        });
        setMentions(currentMentions);
      }, []),
    })

    // Optimized handlers with useCallback
    const handleBold = useCallback(() => {
      editor?.chain().focus().toggleBold().run();
    }, [editor]);

    const handleItalic = useCallback(() => {
      editor?.chain().focus().toggleItalic().run();
    }, [editor]);

    const handleStrike = useCallback(() => {
      editor?.chain().focus().toggleStrike().run();
    }, [editor]);

    return (
      <div className="layer">
        {editor && (
          <BubbleMenu
            editor={editor}
            pluginKey="bubbleMenuEditor"
            shouldShow={({ state }) => {
              const { from, to } = state.selection;
              const isEmpty = from === to;
              return !isEmpty;
            }}
          >
            <div className="bubble-menu inline-flow">
              <button
                onClick={handleBold}
                className={`button button--small button--plain ${editor.isActive('bold') ? 'button--active' : ''}`}
                is="pp-button"
                title="Bold"
              >
                <iconify-icon className="icon" icon="ph:text-b"></iconify-icon>
                <span className="inclusively-hidden">Bold</span>
              </button>
              <button
                onClick={handleItalic}
                className={`button button--small button--plain ${editor.isActive('italic') ? 'button--active' : ''}`}
                is="pp-button"
                title="Italic"
              >
                <iconify-icon className="icon" icon="ph:text-italic"></iconify-icon>
                <span className="inclusively-hidden">Italic</span>
              </button>
              <button
                onClick={handleStrike}
                className={`button button--small button--plain ${editor.isActive('strike') ? 'button--active' : ''}`}
                is="pp-button"
                title="Strikethrough"
              >
                <iconify-icon className="icon" icon="ph:text-strikethrough"></iconify-icon>
                <span className="inclusively-hidden">Strike</span>
              </button>
            </div>
          </BubbleMenu>
        )}

        <div className="rich-editor-container">
          <EditorContent editor={editor} className="rich-editor" />
        </div>
      </div>
    )
  },
};

export const WithFloatingMenu: Story = {
  args: {},
  render: () => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        Reference.configure({
          HTMLAttributes: {
            class: 'reference-mention reference',
          },
          suggestion: createReferenceSuggestion(referenceCategories),
        }),
      ],
      content: `
        <p>Click at the end of this paragraph to see the floating menu.</p>
        <p></p>
        <p>The floating menu appears when you're in an empty paragraph or at the end of a block. Try clicking after this sentence.</p>
        <p></p>
        <p>You can also press Enter to create a new paragraph and see the menu appear.</p>
      `,
      immediatelyRender: true,
    });

    // Handlers for floating menu actions
    const insertHeading = useCallback((level: 1 | 2 | 3) => {
      if (editor) {
        editor.chain().focus().toggleHeading({ level }).run();
      }
    }, [editor]);

    const insertBulletList = useCallback(() => {
      if (editor) {
        editor.chain().focus().toggleBulletList().run();
      }
    }, [editor]);

    const insertOrderedList = useCallback(() => {
      if (editor) {
        editor.chain().focus().toggleOrderedList().run();
      }
    }, [editor]);

    const insertCodeBlock = useCallback(() => {
      if (editor) {
        editor.chain().focus().toggleCodeBlock().run();
      }
    }, [editor]);

    const insertBlockquote = useCallback(() => {
      if (editor) {
        editor.chain().focus().toggleBlockquote().run();
      }
    }, [editor]);

    return (
      <div className="layer">
        {editor && (
          <FloatingMenu
            editor={editor}
            pluginKey="floatingMenuExample"
            shouldShow={({ state }) => {
              // Show when cursor is in empty paragraph or at start of document
              const { $anchor } = state.selection;
              const isEmptyTextBlock = $anchor.parent.textContent === '';
              const isAtStart = $anchor.pos === 1;
              return isEmptyTextBlock || isAtStart;
            }}
          >
            <div className="floating-menu">
              <div className="floating-menu__section">
                <button
                  className="button button--small button--plain"
                  is="pp-button"
                  onClick={() => insertHeading(1)}
                  title="Heading 1"
                >
                  <iconify-icon className="icon" icon="ph:text-h-one"></iconify-icon>
                  <span className="inclusively-hidden">H1</span>
                </button>
                <button
                  className="button button--small button--plain"
                  is="pp-button"
                  onClick={() => insertHeading(2)}
                  title="Heading 2"
                >
                  <iconify-icon className="icon" icon="ph:text-h-two"></iconify-icon>
                  <span className="inclusively-hidden">H2</span>
                </button>
                <button
                  className="button button--small button--plain"
                  is="pp-button"
                  onClick={() => insertHeading(3)}
                  title="Heading 3"
                >
                  <iconify-icon className="icon" icon="ph:text-h-three"></iconify-icon>
                  <span className="inclusively-hidden">H3</span>
                </button>
              </div>

              <div className="floating-menu__section">
                <button
                  className="button button--small button--plain"
                  is="pp-button"
                  onClick={insertBulletList}
                  title="Bullet List"
                >
                  <iconify-icon className="icon" icon="ph:list-bullets"></iconify-icon>
                  <span className="inclusively-hidden">Bullet List</span>
                </button>
                <button
                  className="button button--small button--plain"
                  is="pp-button"
                  onClick={insertOrderedList}
                  title="Numbered List"
                >
                  <iconify-icon className="icon" icon="ph:list-numbers"></iconify-icon>
                  <span className="inclusively-hidden">Numbered List</span>
                </button>
              </div>

              <div className="floating-menu__section">
                <button
                  className="button button--small button--plain"
                  is="pp-button"
                  onClick={insertCodeBlock}
                  title="Code Block"
                >
                  <iconify-icon className="icon" icon="ph:code"></iconify-icon>
                  <span className="inclusively-hidden">Code Block</span>
                </button>
                <button
                  className="button button--small button--plain"
                  is="pp-button"
                  onClick={insertBlockquote}
                  title="Quote"
                >
                  <iconify-icon className="icon" icon="ph:quotes"></iconify-icon>
                  <span className="inclusively-hidden">Quote</span>
                </button>
              </div>
            </div>
          </FloatingMenu>
        )}

        <div className="rich-editor-container">
          <EditorContent editor={editor} className="rich-editor" />
        </div>
      </div>
    );
  },
};