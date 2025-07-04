import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';

const meta = {
  title: "Components/Bubble menu",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const ExplainText: Story = {
  args: {},
  render: () => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        Highlight,
      ],
      content: `
        <p>Changes in temperature and precipitation are also throwing off the rhythms of nature. Many species rely on environmental cues for breeding, migration, and feeding. When spring arrives earlier, some birds migrate before their food sources are abundant. If insects hatch too early or too late for birds to feed their chicks, or if flowers bloom before pollinators are active, the entire chain can fall apart. These mismatches can ripple through ecosystems, weakening the interdependence that many species rely on to survive.</p>
      `,
      editorProps: {
        attributes: {
          class: 'rich-editor rich-editor--readonly',
        }
      }
    });

    const handleExplain = () => {
      const selectedText = editor?.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to,
        ' '
      );

      if (selectedText) {
        console.log('Would explain:', selectedText);
        // Here we would trigger the explanation functionality
        // For now, just show an alert
        alert(`Explaining: "${selectedText}"\n\nThis would trigger an AI explanation of the selected text.`);
      }
    };

    return (
      <div className="layer">
        <div className="rich-editor-container">
          {editor && (
            <BubbleMenu
              editor={editor}
              tippyOptions={{
                duration: 100,
                placement: 'top',
              }}
              shouldShow={({ state }) => {
                const { from, to } = state.selection;
                const selectedText = state.doc.textBetween(from, to, ' ');
                return selectedText.length > 0;
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
    const editor = useEditor({
      extensions: [
        StarterKit,
        Highlight,
      ],
      content: `
        <p>Warming oceans are particularly devastating. <mark>Coral reefs, which are biodiversity hotspots, are bleaching and dying due to heat stress.</mark> Marine animals that depend on these reefs for food and shelter are left vulnerable. Ocean acidification, another by-product of increased CO₂ levels, is making it harder for shellfish and corals to build their skeletons. The decline of keystone species can cause cascading effects, altering food webs and leading to further biodiversity loss. In short, climate change is a force multiplier for stressors already facing wildlife, accelerating extinction rates and making conservation efforts more urgent and complex.</p>
      `,
      editorProps: {
        attributes: {
          class: 'rich-editor rich-editor--readonly',
        }
      }
    });

    const handleExplain = () => {
      const selectedText = editor?.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to,
        ' '
      );
      alert(`Explaining: "${selectedText}"`);
    };

    const handleSummarize = () => {
      const selectedText = editor?.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to,
        ' '
      );
      alert(`Summarizing: "${selectedText}"`);
    };

    const handleHighlight = () => {
      if (editor) {
        editor.chain().focus().toggleHighlight().run();
      }
    };

    const handleCreateTask = () => {
      const selectedText = editor?.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to,
        ' '
      );
      alert(`Creating task from: "${selectedText}"`);
    };

    return (
      <div className="layer">
        <div className="rich-editor-container">
          {editor && (
            <BubbleMenu
              editor={editor}
              tippyOptions={{
                duration: 100,
                placement: 'top',
              }}
              shouldShow={({ state }) => {
                const { from, to } = state.selection;
                const selectedText = state.doc.textBetween(from, to, ' ');
                return selectedText.length > 0;
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
    const editor = useEditor({
      extensions: [
        StarterKit,
        Highlight,
      ],
      content: `
        <p>Climate change is reshaping ecosystems at a pace that many species can't keep up with. As temperatures rise, animals and plants are being pushed out of their natural habitats. Species adapted to cold environments—like polar bears, snow leopards, and certain alpine plants—are seeing their habitats shrink or disappear entirely. Some animals are migrating to higher altitudes or latitudes, but these shifts aren't always possible or fast enough, especially for species with limited mobility or specialised diets.</p>
      `,
      editorProps: {
        attributes: {
          class: 'rich-editor rich-editor--readonly',
        }
      }
    });

    const handleComment = () => {
      const selectedText = editor?.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to,
        ' '
      );
      alert(`Adding comment to: "${selectedText}"`);
    };

    const handleHighlight = () => {
      if (editor) {
        editor.chain().focus().toggleHighlight().run();
      }
    };

    return (
      <div className="layer">
        <div className="rich-editor-container">
          {editor && (
            <BubbleMenu
              editor={editor}
              tippyOptions={{
                duration: 100,
                placement: 'top',
              }}
              shouldShow={({ state }) => {
                const { from, to } = state.selection;
                const selectedText = state.doc.textBetween(from, to, ' ');
                return selectedText.length > 0;
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