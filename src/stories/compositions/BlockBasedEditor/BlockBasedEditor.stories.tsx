import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { Reference, createReferenceSuggestion } from '../../../components/reference/Reference';
import { referenceCategories } from '../../data';
import { users, projects, documents } from '../../data';
import { EditorProvider } from '../../../components/editor/EditorProvider';
import { EditorPlugin } from '../../../components/editor/EditorPlugin';
import { LazyEditorPlugin } from '../../../components/editor/LazyEditorPlugin';
import { EditorLayout } from '../../../components/editor/EditorLayout';
import { EditorContent } from '../../../components/editor/slots/EditorContent';
import { EditorToolbar } from '../../../components/editor/slots/EditorToolbar';
import { EditorBubbleMenu } from '../../../components/editor/slots/EditorBubbleMenu';
import { EditorFloatingMenu } from '../../../components/editor/slots/EditorFloatingMenu';
import { formattingPlugin } from '../../../components/editor-plugins/formatting/FormattingPlugin';
import { commentingPlugin } from '../../../components/editor-plugins/commenting/CommentingPlugin';
import { CommentingIntegration } from '../../../components/editor-plugins/commenting/components/CommentingIntegration';
import { TaskComments } from '../../../components/commenting/examples/TaskComments';
import { referencesPlugin } from '../../../components/editor-plugins/references';
import { aiAssistantPlugin } from '../../../components/editor-plugins/ai-assistant';
import type { ReferenceCategory, SelectedReference } from '../../../components/reference/types';
import '../../../jsx-types';

const meta = {
  title: "Compositions/Block-based editor",
} satisfies Meta;

export default meta;
type Story = StoryObj;

const referenceData: ReferenceCategory[] = [
  {
    id: 'people',
    label: 'People',
    items: users.map(user => ({
      id: user.id,
      label: user.name,
      type: 'user' as const,
      metadata: user.metadata,
    })),
  },
  {
    id: 'projects',
    label: 'Projects',
    items: projects.map(project => ({
      id: project.id,
      label: project.name,
      type: 'project' as const,
      metadata: project.metadata,
    })),
  },
  {
    id: 'documents',
    label: 'Documents',
    items: documents.map(doc => ({
      id: doc.id,
      label: doc.name,
      type: 'document' as const,
      metadata: doc.metadata,
    })),
  },
];

export const Basic: Story = {
  args: {},
  render: () => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        Highlight,
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
    });

    if (!editor) {
      return <div>Loading editor...</div>;
    }

    return (
      <div className="layer">
        <EditorProvider editor={editor} plugins={[formattingPlugin()]}>
          <EditorLayout>
            <div className="editor-content-wrapper">
              <EditorContent />
              <EditorBubbleMenu />
            </div>
          </EditorLayout>
        </EditorProvider>
      </div>
    );
  },
};

export const WithFloatingMenu: Story = {
  args: {},
  render: () => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        Highlight,
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
    });

    if (!editor) {
      return <div>Loading editor...</div>;
    }

    return (
      <div className="layer">
        <EditorProvider editor={editor} plugins={[formattingPlugin()]}>
          <EditorLayout>
            <div className="editor-content-wrapper">
              <EditorContent />
              <EditorBubbleMenu />
              <EditorFloatingMenu />
            </div>
          </EditorLayout>
        </EditorProvider>
      </div>
    );
  },
};

export const FullFeatured: Story = {
  args: {},
  render: () => {
    const [selectedReferences, setSelectedReferences] = useState<SelectedReference[]>([]);

    const editor = useEditor({
      extensions: [
        StarterKit,
        Highlight,
        Reference.configure({
          HTMLAttributes: {
            class: 'reference-mention reference',
          },
          suggestion: createReferenceSuggestion(referenceData),
        }),
      ],
      content: `
        <h2>Full-Featured Editor</h2>
        <p>This editor combines all available plugins for a comprehensive editing experience.</p>
        <p>Try selecting text to see formatting options, AI tools, and commenting features. Type @ to mention people, projects, or documents.</p>
      `,
    });

    const handleReferenceSelect = (reference: SelectedReference) => {
      setSelectedReferences(prev => [...prev, reference]);
    };

    if (!editor) {
      return <div>Loading editor...</div>;
    }

    return (
      <div className="layer">
        <EditorProvider editor={editor}>
          {/* Core formatting loads immediately */}
          <EditorPlugin plugin={formattingPlugin()} />

          {/* Collaboration features */}
          <EditorPlugin plugin={commentingPlugin({
            documentId: 'full-featured-demo',
            currentUser: 'user-1'
          })} />
          <EditorPlugin plugin={referencesPlugin({
            data: referenceData,
            onReferenceSelect: handleReferenceSelect,
          })} />

          {/* AI features load lazily as they're heavier */}
          <LazyEditorPlugin
            loader={async () => {
              const module = await import('../../../components/editor-plugins/ai-assistant');
              return {
                default: () => module.aiAssistantPlugin({
                  enableExplain: true,
                  enableSummarize: true,
                  enableZoomIn: true,
                  enableZoomOut: true,
                  streamingEnabled: true,
                })
              };
            }}
          />

          <CommentingIntegration
            editor={editor}
            config={{
              documentId: 'full-featured-demo',
              currentUser: 'user-1',
              enableQuoteComments: true,
            }}
          >
            <EditorLayout>
              <EditorToolbar />
              <div className="editor-content-wrapper">
                <EditorContent />
                <EditorBubbleMenu />
                <EditorFloatingMenu />
              </div>
            </EditorLayout>
          </CommentingIntegration>
        </EditorProvider>

        {selectedReferences.length > 0 && (
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <h4>Selected References:</h4>
            <ul>
              {selectedReferences.map((ref, index) => (
                <li key={`${ref.id}-${index}`}>
                  <strong>{ref.type}:</strong> {ref.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  },
};

export const CollaborativeEditing: Story = {
  args: {},
  render: () => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        Highlight,
        Reference.configure({
          HTMLAttributes: {
            class: 'reference-mention reference',
          },
          suggestion: createReferenceSuggestion(referenceData),
        }),
      ],
      content: `
        <h2>Collaborative Document</h2>
        <p>Select any text to add comments and create discussion threads.</p>
        <p>Use @ mentions to reference team members, projects, or documents.</p>
        <p>This setup is optimized for team collaboration with lightweight, responsive features.</p>
      `,
    });

    if (!editor) {
      return <div>Loading editor...</div>;
    }

    return (
      <div className="layer">
        <EditorProvider editor={editor}>
          <EditorPlugin plugin={formattingPlugin()} />
          <EditorPlugin plugin={commentingPlugin({
            documentId: 'collab-demo',
            currentUser: 'user-1'
          })} />
          <EditorPlugin plugin={referencesPlugin({
            data: referenceData,
            enableQuoteReferences: true,
            enableAtMentions: true,
          })} />

          <CommentingIntegration
            editor={editor}
            config={{
              documentId: 'collab-demo',
              currentUser: 'user-1',
              enableQuoteComments: true,
            }}
          >
            <EditorLayout>
              <div className="editor-content-wrapper">
                <EditorContent />
                <EditorBubbleMenu />
                <EditorFloatingMenu />
              </div>
            </EditorLayout>
          </CommentingIntegration>
          
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
            <h4>Universal Commenting Demo</h4>
            <p><strong>Instructions:</strong></p>
            <ul>
              <li>Select some text in the editor</li>
              <li>Use the bubble menu to create a quote comment</li>
              <li>The commenting system works on any object - see the task example below!</li>
            </ul>
            
            {/* Demonstrate universal commenting on a task */}
            <div style={{ marginTop: '16px', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <TaskComments 
                task={{ id: 'task-1', title: 'Implement Universal Commenting', description: 'Build the Patchwork-inspired system' }}
                currentUser='user-1'
              />
            </div>
          </div>
        </EditorProvider>
      </div>
    );
  },
};

export const AIAssisted: Story = {
  args: {},
  render: () => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        Highlight,
      ],
      content: `
        <h2>AI-Assisted Writing</h2>
        <p>Select any text to access AI-powered writing tools:</p>
        <ul>
          <li><strong>Explain:</strong> Get detailed explanations of complex text</li>
          <li><strong>Summarize:</strong> Create concise summaries of long passages</li>
          <li><strong>Zoom In:</strong> Add more detail and expand ideas</li>
          <li><strong>Zoom Out:</strong> Condense and simplify content</li>
        </ul>
        <p>The AI features use streaming responses for a responsive experience. Note: Requires backend server running on localhost:3000.</p>
      `,
    });

    if (!editor) {
      return <div>Loading editor...</div>;
    }

    return (
      <div className="layer">
        <EditorProvider editor={editor}>
          <EditorPlugin plugin={formattingPlugin()} />
          <EditorPlugin plugin={aiAssistantPlugin({
            enableExplain: true,
            enableSummarize: true,
            enableZoomIn: true,
            enableZoomOut: true,
            streamingEnabled: true,
            zoomIntensity: 30,
          })} />

          <EditorLayout>
            <EditorToolbar />
            <div className="editor-content-wrapper">
              <EditorContent />
              <EditorBubbleMenu />
            </div>
          </EditorLayout>
        </EditorProvider>
      </div>
    );
  },
};

export const Minimal: Story = {
  args: {},
  render: () => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        Highlight,
      ],
      content: `
        <h2>Minimal Editor</h2>
        <p>A clean, simple editor with just the essentials - formatting tools and nothing more.</p>
        <p>Perfect for focused writing without distractions.</p>
      `,
    });

    if (!editor) {
      return <div>Loading editor...</div>;
    }

    return (
      <div className="layer">
        <EditorProvider editor={editor} plugins={[formattingPlugin()]}>
          <EditorLayout>
            <div className="editor-content-wrapper">
              <EditorContent />
              <EditorBubbleMenu />
              <EditorFloatingMenu />
            </div>
          </EditorLayout>
        </EditorProvider>
      </div>
    );
  },
};