import type { Meta, StoryObj } from '@storybook/react-vite';
import { FilteringDemo } from './Filtering';
import { FilterType, FilterOperator, Status, Priority, Assignee } from '../../../components/filter/filter-types';
import { userEvent, within } from '@storybook/testing-library';

const meta = {
  title: 'Actions/Seeking/Filtering',
  component: FilteringDemo,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof FilteringDemo>;

export default meta;
type Story = StoryObj<typeof FilteringDemo>;

export const Filtering: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Filter' }));
  },
  args: {
    initialFilters: [
      {
        id: '1',
        type: FilterType.STATUS,
        operator: FilterOperator.IS,
        value: [Status.TODO]
      },
      {
        id: '2',
        type: FilterType.PRIORITY,
        operator: FilterOperator.IS_ANY_OF,
        value: [Priority.HIGH, Priority.URGENT]
      },
      {
        id: '3',
        type: FilterType.ASSIGNEE,
        operator: FilterOperator.IS_ANY_OF,
        value: [Assignee.SARAH_CHEN, Assignee.DAVID_KIM]
      }
    ]
  },
};

export const LLMFilter: Story = {
  render: () => (
    <div className="flex">
      <button className="tag"><iconify-icon icon="ph:sparkle" /><span className="shimmer">Thinking...</span></button>
      <div className="tag-group">
        <button className="tag"><iconify-icon icon="ph:sparkle" /> Things that are good for me</button>
        <button className="tag tag-group__remove">
          <iconify-icon icon="ph:x" /><span className="inclusively-hidden">Clear filter</span>
        </button>
      </div>
    </div>
  )
};

