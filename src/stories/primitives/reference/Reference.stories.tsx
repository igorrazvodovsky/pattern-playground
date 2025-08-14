import type { Meta, StoryObj } from "@storybook/react-vite";
import { useCallback, useMemo } from 'react';
import { ReferenceEditor } from '../../../components/reference';
import { referenceCategories, basicReferenceCategories, getReferenceContentById, quotes } from '../../data';
import type { SelectedReference } from '../../../components/reference';

type FilterPattern = `@${string}` | `#${string}` | `/${string}`;
type ReferenceType = 'user' | 'project' | 'document';

const meta = {
  title: "Primitives/Reference",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const ReferenceEditorExample = () => {
  const handleReferenceSelect = useCallback((reference: SelectedReference) => {
    console.log('Reference selected:', reference);
    if (reference.referenceType === 'quote') {
      console.log('Quote object selected for cross-document referencing:', reference);
    }
  }, []);

  // Enhanced reference categories with quotes
  const enhancedReferenceCategories = useMemo(() => [
    ...referenceCategories,
    {
      id: 'quotes',
      name: 'Quote Objects',
      icon: 'ph:quotes',
      searchableText: 'quotes excerpts selections text references',
      children: quotes.map(quote => ({
        id: quote.id,
        name: quote.name,
        icon: 'ph:quotes',
        searchableText: `${quote.searchableText} ${quote.metadata.selectedText}`,
        type: 'quote' as const,
        metadata: {
          sourceDocument: quote.metadata.sourceDocument,
          createdBy: quote.metadata.createdBy,
          selectedText: quote.metadata.selectedText,
          description: quote.description
        }
      }))
    }
  ], []);

  return (
    <div className="layer">
      <ReferenceEditor
        data={enhancedReferenceCategories}
        onReferenceSelect={handleReferenceSelect}
        placeholder="Type @ to open reference picker (includes users, documents, projects & quotes)..."
        content={getReferenceContentById('sustainability-meeting-content')?.content || {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Enhanced reference system with Quote Objects! Try @reshaping, @habitats, or @coral to reference specific quote objects across documents. Also supports @elena, @climate, @circular for traditional references.' }]
            }
          ]
        }}
      />
    </div>
  );
};

export const Reference: Story = {
  render: () => <ReferenceEditorExample />,
  parameters: {
    docs: {
      description: {
        story: 'Enhanced reference system with Quote Objects integration. Now includes quote objects as referenceable entities alongside users, projects, and documents. Type @ and try @reshaping, @habitats, @coral for quote objects, or @elena, @climate, @circular for traditional references. Demonstrates cross-document quote referencing capabilities.'
      }
    }
  }
};

const BasicReferenceEditor = () => {
  const handleReferenceSelect = useCallback((reference: SelectedReference) => {
    console.log('User selected:', reference);
  }, []);

  return (
    <div className="layer">
      <ReferenceEditor
        data={basicReferenceCategories}
        onReferenceSelect={handleReferenceSelect}
        placeholder="Type @ to mention a user..."
        content={getReferenceContentById('sustainability-team-meeting-content')?.content || {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Basic user references for team collaboration. In the full system, quote objects would also be available here for cross-document referencing and discussions.' }]
            }
          ]
        }}
      />
    </div>
  );
};

export const Basic: Story = {
  render: () => <BasicReferenceEditor />,
  parameters: {
    docs: {
      description: {
        story: 'Single-category reference picker with sustainability meeting content. Shows existing user mentions from our sustainability team directory. Automatically skips category selection since there\'s only users. Type @ followed by a name to filter users directly.'
      }
    }
  }
};

const ProjectPlanningEditor = () => {
  const handleReferenceSelect = useCallback((reference: SelectedReference) => {
    console.log('Project reference selected:', reference);
  }, []);

  return (
    <div className="layer">
      <ReferenceEditor
        data={referenceCategories}
        onReferenceSelect={handleReferenceSelect}
        placeholder="Type @ to open reference picker..."
        content={getReferenceContentById('project-planning-content')?.content || {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Project planning content with full reference support. Quote objects from related documents can be referenced here for comprehensive project discussions and analysis.' }]
            }
          ]
        }}
      />
    </div>
  );
};
