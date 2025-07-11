import type { Meta, StoryObj } from "@storybook/react-vite";
import { useCallback } from 'react';
import { ReferenceEditor } from '../../../components/reference-picker';
import { referenceCategories, basicReferenceCategories } from '../../shared-data';
import type { SelectedReference, ReferenceCategory } from '../../../components/reference-picker';

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
        data={referenceCategories}
        onReferenceSelect={handleReferenceSelect}
        placeholder="Type @ to open hierarchical reference picker..."
        content={{
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'The quarterly review will be led by ' },
                {
                  type: 'reference',
                  attrs: {
                    id: 'user-1',
                    label: 'Sarah Chen',
                    type: 'user'
                  }
                },
                { type: 'text', text: ', with support from the ' },
                {
                  type: 'reference',
                  attrs: {
                    id: 'project-4',
                    label: 'Customer Survey Analysis',
                    type: 'project'
                  }
                },
                { type: 'text', text: ' team. Please review the ' },
                {
                  type: 'reference',
                  attrs: {
                    id: 'doc-5',
                    label: 'Team Handbook',
                    type: 'document'
                  }
                },
                { type: 'text', text: ' before the next meeting. ' },
                { type: 'text', text: 'For questions about the new policies, contact ' },
                {
                  type: 'reference',
                  attrs: {
                    id: 'user-4',
                    label: 'David Kim',
                    type: 'user'
                  }
                },
                { type: 'text', text: ' or check the ' },
                {
                  type: 'reference',
                  attrs: {
                    id: 'doc-2',
                    label: 'Budget Proposal',
                    type: 'document'
                  }
                },
                { type: 'text', text: ' details.' }
              ]
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
        data={basicReferenceCategories}
        onReferenceSelect={handleReferenceSelect}
        placeholder="Type @ to mention a user..."
        content={{
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: "In today's meeting, " },
                {
                  type: 'reference',
                  attrs: {
                    id: 'user-6',
                    label: 'Alice Johnson',
                    type: 'user'
                  }
                },
                { type: 'text', text: ' shared updates on the client presentation. ' },
                {
                  type: 'reference',
                  attrs: {
                    id: 'user-7',
                    label: 'Bob Smith',
                    type: 'user'
                  }
                },
                { type: 'text', text: ' will handle the budget review, and ' },
                {
                  type: 'reference',
                  attrs: {
                    id: 'user-8',
                    label: 'Charlie Brown',
                    type: 'user'
                  }
                },
                { type: 'text', text: ' is coordinating with the vendors. ' },
                { type: 'text', text: 'Next week, ' },
                {
                  type: 'reference',
                  attrs: {
                    id: 'user-4',
                    label: 'David Kim',
                    type: 'user'
                  }
                },
                { type: 'text', text: ' and ' },
                {
                  type: 'reference',
                  attrs: {
                    id: 'user-9',
                    label: 'Eve Davis',
                    type: 'user'
                  }
                },
                { type: 'text', text: ' will join the project.' }
              ]
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


