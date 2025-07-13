import type { Meta, StoryObj } from "@storybook/react-vite";
import { useCallback, useState } from 'react';
import { ReferenceEditor } from '../../../components/reference';
import { ItemInteraction } from '../../../components/item-view';
import { ContentAdapterProvider } from '../../../components/item-view/ContentAdapterRegistry';
import { referenceContentAdapter } from '../../../components/reference';
import { referenceCategories_transformed, basicReferenceCategories_transformed } from '../../shared-data';
import { createUserReference, createProjectReference, createDocumentReference } from '../../shared-data/reference-utils';
import type { SelectedReference } from '../../../components/reference';

const meta = {
  title: "Primitives/Reference",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const ReferenceEditorExample = () => {
  const handleReferenceSelect = useCallback((reference: SelectedReference) => {
    console.log('Reference selected:', reference);
  }, []);

  return (
    <div className="layer">
      <ReferenceEditor
        data={referenceCategories_transformed}
        onReferenceSelect={handleReferenceSelect}
        placeholder="Type @ to open hierarchical reference picker..."
        content={{
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'The quarterly review will be led by ' },
                createUserReference('user-1'),
                { type: 'text', text: ', with support from the ' },
                createProjectReference('project-1'),
                { type: 'text', text: ' team. Please review the ' },
                createDocumentReference('doc-1'),
                { type: 'text', text: ' before the next meeting. ' },
                { type: 'text', text: 'For financial questions, contact our ' },
                createUserReference('user-10'),
                { type: 'text', text: ' or for legal matters, reach out to ' },
                createUserReference('user-11'),
                { type: 'text', text: '. Details are in the ' },
                createDocumentReference('doc-2'),
                { type: 'text', text: '.' }
              ].filter(Boolean)
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
        story: 'Complete hierarchical reference system with generic workplace content. Shows existing references for team members (Sarah, David), projects (Customer Survey Analysis), and documents (Team Handbook, Budget Proposal). Type @ to add more references or try @sarah, @survey, @handbook, @budget to see filtering across categories.'
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
        data={basicReferenceCategories_transformed}
        onReferenceSelect={handleReferenceSelect}
        placeholder="Type @ to mention a user..."
        content={{
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: "In today's meeting, " },
                createUserReference('user-6'),
                { type: 'text', text: ' shared updates on the client presentation. ' },
                createUserReference('user-7'),
                { type: 'text', text: ' will handle the technical implementation, while our ' },
                createUserReference('user-10'),
                { type: 'text', text: ' reviews the budget. ' },
                { type: 'text', text: 'For legal review, ' },
                createUserReference('user-11'),
                { type: 'text', text: ' will join next week along with ' },
                createUserReference('user-12'),
                { type: 'text', text: ' for HR coordination.' }
              ].filter(Boolean)
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
        story: 'Single-category reference picker with simple meeting content. Shows existing user mentions (Alice, Bob, Charlie, David, Eve) in a business context. Automatically skips category selection since there\'s only users. Type @ followed by a name to filter users directly.'
      }
    }
  }
};




