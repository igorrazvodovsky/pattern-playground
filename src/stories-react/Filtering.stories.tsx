import type { Meta, StoryObj } from '@storybook/react';
import { FilteringDemo } from './Filtering';
import { FilterType, FilterOperator, Status, Priority } from '../components/filter/filter-types'

const meta: Meta<typeof FilteringDemo> = {
  title: "Compositions/Browsing & sensemaking*/Filtering",
  component: FilteringDemo,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof FilteringDemo>;

export const Filtering: Story = {
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
      }
    ]
  },
};

export const EmptyFilters: Story = {
  name: "Global Search Demo",
  args: {
    initialFilters: []
  },
  parameters: {
    docs: {
      description: {
        story: `This story demonstrates the global search functionality. Try typing "feature" to see how it finds the "Feature" value across different filter types, or search for "high" to find the priority value.`
      }
    }
  }
};