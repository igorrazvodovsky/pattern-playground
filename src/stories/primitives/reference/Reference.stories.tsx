import type { Meta, StoryObj } from "@storybook/react-vite";
import { useCallback } from 'react';
import { ReferenceEditor } from '../../../components/reference';
import { referenceCategories, basicReferenceCategories, getReferenceContentById } from '../../shared-data';
import type { SelectedReference } from '../../../components/reference';
// TODO: Add quote objects to reference categories for comprehensive object linking

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
  }, []);

  return (
    <div className="layer">
      <ReferenceEditor
        data={referenceCategories}
        onReferenceSelect={handleReferenceSelect}
        placeholder="Type @ to open hierarchical reference picker..."
        content={getReferenceContentById('sustainability-meeting-content')?.content || {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Loading reference content... In quote object system, this will include rich quote references alongside user/document mentions.' }]
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
        story: 'Complete hierarchical reference system with sustainability-focused content. Shows existing references for team members (Elena, David, Sarah), projects, and documents (Climate Change Impact Report, Circular Economy Implementation Guide). Type @ to add more references or try @elena, @climate, @circular to see filtering across categories.'
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
              content: [{ type: 'text', text: 'Loading team content... Quote objects will appear here as referenceable entities alongside users.' }]
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
              content: [{ type: 'text', text: 'Loading project content... Quote objects from project documents will be linkable from here via the reference system.' }]
            }
          ]
        }}
      />
    </div>
  );
};
