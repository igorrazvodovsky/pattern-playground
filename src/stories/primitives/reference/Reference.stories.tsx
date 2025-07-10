import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEditor, EditorContent } from '@tiptap/react';
import { useState, useCallback } from 'react';
import type { Node } from '@tiptap/pm/model';
import StarterKit from '@tiptap/starter-kit';
import { Mention as TiptapMention } from '@tiptap/extension-mention';
import { ReferenceEditor as UnifiedReferenceEditor } from '../../../components/reference-picker';
import { unifiedReferenceData } from './unifiedReferenceData';
import type { SelectedReference } from '../../../components/reference-picker';
import mockUsers from './mockUsers.json' with { type: 'json' };

const meta = {
  title: "Primitives/Reference",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Simple legacy reference example using basic TipTap mention
const createSimpleMentionSuggestion = () => ({
  items: ({ query }: { query: string }) => {
    return mockUsers
      .filter(user => user.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  },
  render: () => {
    let component: any;

    return {
      onStart: (props: any) => {
        // Simple implementation without complex rendering
        console.log('Mention started with', props.items.length, 'items');
      },
      onUpdate: (props: any) => {
        console.log('Mention updated with', props.items.length, 'items');
      },
      onKeyDown: (props: any) => {
        if (props.event.key === 'Escape') {
          return true;
        }
        return false;
      },
      onExit: () => {
        console.log('Mention exited');
      },
    };
  },
});

const ReferenceEditor = () => {
  const [setReferences] = useState<Array<{id: string, label: string}>>([]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapMention.configure({
        HTMLAttributes: {
          class: 'reference',
        },
        suggestion: createSimpleMentionSuggestion(),
      }),
    ],
    editorProps: {
      attributes: {
        class: 'tiptap-editor-basic',
      },
    },
    content: '<p>This is a legacy example. Type @ to see basic mentions (may not work fully).</p>',
    onUpdate: useCallback(({ editor }) => {
      // Track references for analytics or other purposes
      const currentReferences: Array<{id: string, label: string}> = [];
      editor.state.doc.descendants((node: Node) => {
        if (node.type.name === 'mention') {
          currentReferences.push({
            id: node.attrs.id,
            label: node.attrs.label
          });
        }
      });
      setReferences(currentReferences);
    }, [setReferences]),
  });

  return (
    <div className="layer">
      <EditorContent editor={editor} />
    </div>
  );
};

export const Reference: Story = {
  render: () => <ReferenceEditor />,
  parameters: {
    docs: {
      description: {
        story: 'Legacy example using basic TipTap mention extension. This is kept for compatibility but may not work fully. Use the Unified Hierarchical Reference below for the recommended approach.'
      }
    }
  }
};

// Unified Hierarchical Reference System (Recommended)
const HierarchicalReferenceEditor = () => {
  const [references, setReferences] = useState<SelectedReference[]>([]);

  const handleReferenceSelect = useCallback((reference: SelectedReference) => {
    setReferences(prev => [...prev, reference]);
    console.log('Reference selected:', reference);
  }, []);

  return (
    <div className="layer">
      <UnifiedReferenceEditor
        data={unifiedReferenceData}
        onReferenceSelect={handleReferenceSelect}
        placeholder="Type @ to open hierarchical reference picker..."
        content="<p>Try typing @ to experience the unified hierarchical navigation. Browse categories first (Users, Documents, Projects, Files, APIs) then drill down to specific items. Use Escape to go back to category view.</p>"
      />
    </div>
  );
};

export const UnifiedHierarchicalReference: Story = {
  render: () => <HierarchicalReferenceEditor />,
  parameters: {
    docs: {
      description: {
        story: 'Unified hierarchical reference system following the same navigation pattern as Command Menu and Filtering. Features: dual-mode operation (global/contextual), consistent escape handling, progressive disclosure, and structured search results. This provides a consistent experience across all three systems.'
      }
    }
  }
};

