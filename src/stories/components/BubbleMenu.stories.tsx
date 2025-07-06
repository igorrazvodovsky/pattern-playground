import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { useCallback } from 'react';

const meta = {
  title: "Components/Bubble menu",
} satisfies Meta;

export default meta;
type Story = StoryObj;

// Simple editor hook for BubbleMenu
const useSimpleEditor = (content: string) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'rich-editor',
      }
    }
  });

  return editor;
};

export const ExplainText: Story = {
  args: {},
  render: () => {
    const editor = useSimpleEditor(`
      <p>Changes in temperature and precipitation are also throwing off the rhythms of nature. Many species rely on environmental cues for breeding, migration, and feeding. When spring arrives earlier, some birds migrate before their food sources are abundant. If insects hatch too early or too late for birds to feed their chicks, or if flowers bloom before pollinators are active, the entire chain can fall apart. These mismatches can ripple through ecosystems, weakening the interdependence that many species rely on to survive.</p>
    `);

    const handleExplain = useCallback(() => {
      if (editor) {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, ' ');
        if (selectedText) {
          alert(`Explaining: "${selectedText}"\n\nThis would trigger an AI explanation with full context.`);
        }
      }
    }, [editor]);

    return (
      <div className="layer">
        <div className="rich-editor-container">
          {editor && (
            <BubbleMenu
              editor={editor}
              pluginKey="bubbleMenuExplain"
              shouldShow={({ state }) => {
                const { from, to } = state.selection;
                const isEmpty = from === to;
                return !isEmpty;
              }}
            >
              <div className="bubble-menu">
                <button
                  className="button button--small button--plain"
                  is="pp-button"
                  onClick={handleExplain}
                  title="Explain this"
                >
                  <iconify-icon className="icon" icon="ph:question"></iconify-icon>
                  Explain this
                </button>
              </div>
            </BubbleMenu>
          )}
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  },
};

export const MultipleActions: Story = {
  args: {},
  render: () => {
    const editor = useSimpleEditor(`
      <p>Warming oceans are particularly devastating. <mark>Coral reefs, which are biodiversity hotspots, are bleaching and dying due to heat stress.</mark> Marine animals that depend on these reefs for food and shelter are left vulnerable. Ocean acidification, another by-product of increased CO₂ levels, is making it harder for shellfish and corals to build their skeletons. The decline of keystone species can cause cascading effects, altering food webs and leading to further biodiversity loss. In short, climate change is a force multiplier for stressors already facing wildlife, accelerating extinction rates and making conservation efforts more urgent and complex.</p>
    `);

    const handleExplain = useCallback(() => {
      if (editor) {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, ' ');
        if (selectedText) {
          alert(`Explaining: "${selectedText}"`);
        }
      }
    }, [editor]);

    const handleSummarize = useCallback(() => {
      if (editor) {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, ' ');
        if (selectedText) {
          alert(`Summarizing: "${selectedText}"`);
        }
      }
    }, [editor]);

    const handleHighlight = useCallback(() => {
      if (editor) {
        editor.chain().focus().toggleHighlight().run();
      }
    }, [editor]);

    const handleCreateTask = useCallback(() => {
      if (editor) {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, ' ');
        if (selectedText) {
          alert(`Creating task from: "${selectedText}"`);
        }
      }
    }, [editor]);

    return (
      <div className="layer">
        <div className="rich-editor-container">
          {editor && (
            <BubbleMenu
              editor={editor}
              pluginKey="bubbleMenuMultiple"
              shouldShow={({ state }) => {
                const { from, to } = state.selection;
                const isEmpty = from === to;
                return !isEmpty;
              }}
            >
              <div className="bubble-menu inline-flow">
                <button
                  className="button button--small button--plain"
                  is="pp-button"
                  onClick={handleExplain}
                  title="Explain this"
                >
                  <iconify-icon className="icon" icon="ph:question"></iconify-icon>
                  <span className="inclusively-hidden">Explain</span>
                </button>
                <button
                  className="button button--small button--plain"
                  is="pp-button"
                  onClick={handleSummarize}
                  title="Summarize this text"
                >
                  <iconify-icon className="icon" icon="ph:list-dashes"></iconify-icon>
                  <span className="inclusively-hidden">Summarize</span>
                </button>
                <button
                  className="button button--small button--plain"
                  is="pp-button"
                  onClick={handleCreateTask}
                  title="Create task from this text"
                >
                  <iconify-icon className="icon" icon="ph:plus-circle"></iconify-icon>
                  <span className="inclusively-hidden">Create task</span>
                </button>
                <button
                  className={`button button--small button--plain ${editor?.isActive('highlight') ? 'button--active' : ''}`}
                  is="pp-button"
                  onClick={handleHighlight}
                  title="Highlight text"
                >
                  <iconify-icon className="icon" icon="ph:highlighter"></iconify-icon>
                  <span className="inclusively-hidden">Highlight</span>
                </button>
              </div>
            </BubbleMenu>
          )}
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  },
};

export const InlineComment: Story = {
  args: {},
  render: () => {
    const editor = useSimpleEditor(`
      <p>Climate change is reshaping ecosystems at a pace that many species can't keep up with. As temperatures rise, animals and plants are being pushed out of their natural habitats. Species adapted to cold environments—like polar bears, snow leopards, and certain alpine plants—are seeing their habitats shrink or disappear entirely. Some animals are migrating to higher altitudes or latitudes, but these shifts aren't always possible or fast enough, especially for species with limited mobility or specialised diets.</p>
    `);

    const handleComment = useCallback(() => {
      if (editor) {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, ' ');
        if (selectedText) {
          alert(`Adding comment to: "${selectedText}"`);
        }
      }
    }, [editor]);

    const handleHighlight = useCallback(() => {
      if (editor) {
        editor.chain().focus().toggleHighlight().run();
      }
    }, [editor]);

    return (
      <div className="layer">
        <div className="rich-editor-container">
          {editor && (
            <BubbleMenu
              editor={editor}
              pluginKey="bubbleMenuComment"
              shouldShow={({ state }) => {
                const { from, to } = state.selection;
                const isEmpty = from === to;
                return !isEmpty;
              }}
            >
              <div className="bubble-menu inline-flow">
                <button
                  className="button button--small button--plain"
                  is="pp-button"
                  onClick={handleComment}
                  title="Add comment"
                >
                  <iconify-icon className="icon" icon="ph:chat-circle"></iconify-icon>
                  Comment
                </button>
                <button
                  className={`button button--small button--plain ${editor?.isActive('highlight') ? 'button--active' : ''}`}
                  is="pp-button"
                  onClick={handleHighlight}
                  title="Highlight text"
                >
                  <iconify-icon className="icon" icon="ph:highlighter"></iconify-icon>
                  <span className="inclusively-hidden">Highlight</span>
                </button>
              </div>
            </BubbleMenu>
          )}
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  },
};