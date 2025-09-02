import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { Reference, createReferenceSuggestion } from '../../../components/reference/Reference';
import { referenceCategories } from '../../data';
import { users, projects, documents } from '../../data';
import { EditorProvider } from '../../../components/editor/EditorProvider';
import { EditorLayout } from '../../../components/editor/EditorLayout';
import { EditorContent } from '../../../components/editor/slots/EditorContent';
import { EditorBubbleMenu } from '../../../components/editor/slots/EditorBubbleMenu';
import { formattingPlugin } from '../../../components/editor-plugins/formatting/FormattingPlugin';
import type { ReferenceCategory } from '../../../components/reference/types';
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


