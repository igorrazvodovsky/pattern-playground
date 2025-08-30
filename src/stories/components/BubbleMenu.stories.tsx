import type { Meta, StoryObj } from "@storybook/react-vite";
import React from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import '../../components/modal/modal.ts';
import { Reference, createReferenceSuggestion } from '../../components/reference/index.js';
import { referenceCategories } from '../data/index.js';
import type { ReferenceCategory } from '../../components/reference/types.js';
import { EditorProvider } from '../../components/editor/EditorProvider';
import { EditorLayout } from '../../components/editor/EditorLayout';
import { EditorContent as PluginEditorContent } from '../../components/editor/slots/EditorContent';
import { EditorBubbleMenu } from '../../components/editor/slots/EditorBubbleMenu';
import { formattingPlugin } from '../../components/editor-plugins/formatting/FormattingPlugin';
import { commentingPlugin } from '../../components/editor-plugins/commenting/CommentingPlugin';
import { CommentingIntegration } from '../../components/editor-plugins/commenting/components/CommentingIntegration';
import { aiAssistantPlugin } from '../../components/editor-plugins/ai-assistant';

const convertToReferenceCategories = (categories: typeof referenceCategories): ReferenceCategory[] => {
  return categories.map(cat => ({
    id: cat.id,
    label: cat.name,
    items: cat.children.map(child => ({
      id: child.id,
      label: child.name,
      type: child.type,
      metadata: child.metadata
    })),
    metadata: {
      icon: cat.icon,
      searchableText: cat.searchableText
    }
  }));
};
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

  // Use direct Tiptap useEditor hook with minimal extensions
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Reference.configure({
        suggestion: createReferenceSuggestion(
          convertToReferenceCategories(referenceCategories)
        ),
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

  // Debug logging
  React.useEffect(() => {
    console.log('CommentingEditor - richContent:', richContent);
    if (richContent) {
      console.log('Rich content includes references:', JSON.stringify(richContent, null, 2));
    }
  }, [richContent]);

  // Initialize content
  React.useEffect(() => {
    if (editor && richContent && !editor.getHTML().includes('Marine ecosystems')) {
      console.log('Setting editor content with rich content');
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

