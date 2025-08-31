import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { ItemView } from '../../components/item-view/ItemView';
import { ContentAdapterProvider } from '../../components/item-view/ContentAdapterRegistry';
import { taskAdapter } from '../../components/item-view/adapters';
import type { TaskObject } from '../../components/item-view/types';
import { tasks, taskToItemObject } from '../data';

const meta = {
  title: "Compositions/Item view",
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
    item: getSampleTaskObject() as any,
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
    item: getSampleTaskObject() as any,
    contentType: 'task',
    scope: 'mid',
    mode: 'preview',
  },
  render: (args) => (
    <div style={{
      padding: '1rem',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <ItemView {...args} />
    </div>
  ),
};

export const TaskMini: Story = {
  args: {
    item: getSampleTaskObject() as any,
    contentType: 'task',
    scope: 'mini',
    mode: 'preview',
  },
  render: (args) => (
    <div style={{
      padding: '1rem',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      <ItemView {...args} />
    </div>
  ),
};



