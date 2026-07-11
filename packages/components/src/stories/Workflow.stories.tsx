import type { Meta, StoryObj } from "@storybook/react-vite";
import { WorkflowDemo } from '../demos/workflow';

const meta = {
  title: "Components/Workflow",
  tags: ['activity-level:activity', 'atomic:composition', 'role:component', 'mediation:coordination'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {},
  render: () => <WorkflowDemo />,
};
