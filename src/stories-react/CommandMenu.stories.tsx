import type { Meta, StoryObj } from '@storybook/react';
import CommandMenu from '../components/command-menu/command-menu';

const meta = {
  title: 'Components/CommandMenu',
  component: CommandMenu,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof CommandMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};