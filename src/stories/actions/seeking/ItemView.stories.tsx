import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { ItemView } from '../../../components/item-view/ItemView';
import { ContentAdapterProvider } from '../../../components/item-view/ContentAdapterRegistry';
import { taskAdapter } from '../../../components/item-view/adapters';
import type { TaskObject } from '../../../components/item-view/types';
import { tasks, taskToItemObject } from '../../data';
import { centeredLayout, centeredLayoutNarrow } from '../../utils/decorators';

const meta = {
  title: "Actions/Seeking/Item view",
  component: ItemView,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <ContentAdapterProvider adapters={[taskAdapter]}>
        <Story />
      </ContentAdapterProvider>
    ),
  ],
} satisfies Meta<typeof ItemView>;

export default meta;
type Story = StoryObj<typeof meta>;

// Convert tasks to TaskObject format for different examples
const getSampleTaskObject = (): TaskObject => {
  const task = tasks[0];
  return taskToItemObject(task);
};

export const Page: Story = {
  args: {
    item: getSampleTaskObject(),
    contentType: 'task',
    scope: 'maxi',
    mode: 'preview',
  },
  render: (args) => (
    <ItemView {...args} />
  ),
};

export const TaskCompact: Story = {
  args: {
    item: getSampleTaskObject(),
    contentType: 'task',
    scope: 'mid',
    mode: 'preview',
  },
  decorators: [centeredLayout],
  render: (args) => <ItemView {...args} />,
};

export const TaskMini: Story = {
  args: {
    item: getSampleTaskObject(),
    contentType: 'task',
    scope: 'mini',
    mode: 'preview',
  },
  decorators: [centeredLayoutNarrow],
  render: (args) => <ItemView {...args} />,
};



