import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReferenceEditor } from '../components/reference';
import {
  referenceCategories,
  basicReferenceCategories,
  getReferenceContentById,
} from '@shared/data';

const fallbackDoc = (text: string) => ({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
});

const meta = {
  title: 'Components/Reference',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Reference: Story = {
  render: () => (
    <ReferenceEditor
      data={referenceCategories}
      placeholder="Type @ to open reference picker (users, documents, projects, quotes & products)..."
      content={
        getReferenceContentById('sustainability-meeting-content')?.content ??
        fallbackDoc(
          'Type @ to reference an entity — users, documents, projects, quotes or products.',
        )
      }
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Inline @mentions across users, documents, projects, quotes and products. Hovering a mention glances at its summary; clicking opens a working view.',
      },
    },
  },
};

export const Basic: Story = {
  render: () => (
    <div className="layer">
      <ReferenceEditor
        data={basicReferenceCategories}
        placeholder="Type @ to mention a user..."
        content={
          getReferenceContentById('sustainability-team-meeting-content')?.content ??
          fallbackDoc(
            'Basic user references for team collaboration. In the full system, quote objects would also be available here for cross-document referencing and discussions.',
          )
        }
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Single-category picker: only users are referenceable, so the category step is skipped. Type @ followed by a name to filter directly.',
      },
    },
  },
};
