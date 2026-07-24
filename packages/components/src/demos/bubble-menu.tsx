import React from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { Reference, createReferenceSuggestion } from '../components/reference/index.js';
import { EditorProvider } from '../components/editor/EditorProvider.tsx';
import { EditorLayout } from '../components/editor/EditorLayout.tsx';
import { EditorContent as PluginEditorContent } from '../components/editor/slots/EditorContent.tsx';
import { EditorBubbleMenu } from '../components/editor/slots/EditorBubbleMenu.tsx';
import { formattingPlugin } from '../components/editor-plugins/formatting/FormattingPlugin.ts';
import { commentingPlugin } from '../components/editor-plugins/commenting/CommentingPlugin.ts';
import { CommentingIntegration } from '../components/editor-plugins/commenting/components/CommentingIntegration.tsx';
import { aiAssistantPlugin } from '../components/editor-plugins/ai-assistant/index.ts';
import { explanationPlugin } from '../components/editor-plugins/explanation/index.ts';
import { getDocumentContentText, getDocumentContentRich, referenceCategories } from '@shared/data';

// Shared bubble-menu demos consumed by both the Storybook stories
// (BubbleMenu.stories.tsx) and the pattern site (via @pkg/demos/bubble-menu).
// `immediatelyRender: false` keeps each editor safe to mount inside an Astro
// client-only island; it is harmless in Storybook.

export const BasicDemo: React.FC = () => {
  const content = getDocumentContentText('doc-climate-change', 'ecological-timing');

  const editor = useEditor({
    extensions: [StarterKit, Highlight],
    content: `<p>${content}</p>`,
    editorProps: {
      attributes: {
        'aria-label': 'Document editor',
      },
    },
    immediatelyRender: false,
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
};

export const TextLensDemo: React.FC = () => {
  const content = getDocumentContentText('doc-climate-change', 'habitat-displacement');

  const editor = useEditor({
    extensions: [StarterKit, Highlight],
    content: `<p>${content} As temperatures rise, animals and plants are being pushed out of their natural habitats.</p>`,
    editorProps: {
      attributes: {
        'aria-label': 'Document editor',
      },
    },
    immediatelyRender: false,
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

export const CommentingDemo: React.FC = () => {
  const richContent = getDocumentContentRich('doc-climate-change');

  React.useEffect(() => {
    import('../services/commenting/mock-data/initialize-mock-comments.ts').then(({ initializeMockComments }) => {
      initializeMockComments();
    });
  }, []);

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

  React.useEffect(() => {
    if (editor && richContent && !editor.getHTML().includes('Marine ecosystems')) {
      editor.commands.setContent(richContent);
    }
  }, [editor, richContent]);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
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
  );
};

export const DynamicExplanationDemo: React.FC = () => {
  const richContent = getDocumentContentRich('doc-climate-change');

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

  React.useEffect(() => {
    if (editor && richContent && !editor.getHTML().includes('Marine ecosystems')) {
      editor.commands.setContent(richContent);
    }
  }, [editor, richContent]);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <EditorProvider
      editor={editor}
      plugins={[
        explanationPlugin({
          enableExplain: true,
          streamingEnabled: true,
          includeReferences: true,
        })
      ]}
    >
      <EditorLayout>
        <div className="rich-editor-container">
          <PluginEditorContent />
          <EditorBubbleMenu />
        </div>
      </EditorLayout>
    </EditorProvider>
  );
};
