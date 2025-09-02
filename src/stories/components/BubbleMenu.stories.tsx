import type { Meta, StoryObj } from "@storybook/react-vite";
import React from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import '../../components/modal/modal.ts';
import { Reference, createReferenceSuggestion } from '../../components/reference/index.js';
import { referenceCategories } from '../data/index.js';
import { EditorProvider } from '../../components/editor/EditorProvider';
import { EditorLayout } from '../../components/editor/EditorLayout';
import { EditorContent as PluginEditorContent } from '../../components/editor/slots/EditorContent';
import { EditorBubbleMenu } from '../../components/editor/slots/EditorBubbleMenu';
import { formattingPlugin } from '../../components/editor-plugins/formatting/FormattingPlugin';
import { commentingPlugin } from '../../components/editor-plugins/commenting/CommentingPlugin';
import { CommentingIntegration } from '../../components/editor-plugins/commenting/components/CommentingIntegration';
import { aiAssistantPlugin } from '../../components/editor-plugins/ai-assistant';
import { getDocumentContentText, getDocumentContentRich } from '../data/index.ts';

const meta = {
  title: "Components/Bubble menu",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  args: {},
  render: () => {
    const documentId = 'doc-climate-change';
    const sectionId = 'ecological-timing';
    const content = getDocumentContentText(documentId, sectionId);

    const editor = useEditor({
      extensions: [StarterKit, Highlight],
      content: `<p>${content}</p>`,
    });

    if (!editor) {
      return <div>Loading editor...</div>;
    }

    return (
      <div className="layer">
        <EditorProvider editor={editor} plugins={[formattingPlugin()]}>
          <EditorLayout>
            <div className="editor-content-wrapper">
              <PluginEditorContent />
              <EditorBubbleMenu />
            </div>
          </EditorLayout>
        </EditorProvider>
      </div>
    );
  },
};

// Create a separate component for TextLense to properly use hooks
const TextLenseEditor: React.FC = () => {
  const documentId = 'doc-climate-change';
  const sectionId = 'habitat-displacement';
  const content = getDocumentContentText(documentId, sectionId);

  const editor = useEditor({
    extensions: [StarterKit, Highlight],
    content: `<p>${content} As temperatures rise, animals and plants are being pushed out of their natural habitats.</p>`,
  });

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="layer">
      <EditorProvider editor={editor} plugins={[
        formattingPlugin(),
        aiAssistantPlugin({
          enableExplain: false,
          enableSummarize: false,
          enableZoomIn: true,
          enableZoomOut: true,
          streamingEnabled: false,
          zoomIntensity: 30,
        })
      ]}>
        <EditorLayout>
          <div className="editor-content-wrapper">
            <PluginEditorContent />
            <EditorBubbleMenu />
          </div>
        </EditorLayout>
      </EditorProvider>
    </div>
  );
};

export const TextLense: Story = {
  args: {},
  render: () => <TextLenseEditor />,
};

const CommentingEditor: React.FC = () => {
  const richContent = getDocumentContentRich('doc-climate-change');

  // Initialize mock comments on mount
  React.useEffect(() => {
    import('../../services/commenting/mock-data/initialize-mock-comments').then(({ initializeMockComments }) => {
      initializeMockComments();
    });
  }, []);

  // Use direct Tiptap useEditor hook with minimal extensions
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Reference.configure({
        suggestion: createReferenceSuggestion(referenceCategories),
      })
    ],
    content: richContent || '',
    editorProps: {
      attributes: {
        class: 'rich-editor',
      }
    },
    immediatelyRender: false,
  });

  // Initialize content
  React.useEffect(() => {
    if (editor && richContent && !editor.getHTML().includes('Marine ecosystems')) {
      editor.commands.setContent(richContent);
    }
  }, [editor, richContent]);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="layer">
      <EditorProvider
        editor={editor}
        plugins={[
          formattingPlugin(),
          commentingPlugin({
            documentId: 'doc-climate-change',
            currentUser: 'user-1',
            bubbleMenu: true,
            toolbar: false,
            enableQuoteComments: true,
          })
        ]}
      >
        <CommentingIntegration
          editor={editor}
          config={{
            documentId: 'doc-climate-change',
            currentUser: 'user-1',
            enableQuoteComments: true,
          }}
        >
          <EditorLayout>
            <div className="rich-editor-container">
              <PluginEditorContent />
              <EditorBubbleMenu />
            </div>
          </EditorLayout>
        </CommentingIntegration>
      </EditorProvider>
    </div>
  );
};

export const Commenting: Story = {
  render: () => <CommentingEditor />,
};

