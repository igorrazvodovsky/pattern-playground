import type { Meta, StoryObj } from "@storybook/react-vite";
import { WorkflowDemo } from '../../demos/workflow';

const meta = {
  title: "Activities/Workflow",
  tags: ['!autodocs', 'activity-level:activity', 'atomic:composition', 'role:component', 'mediation:coordination'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {},
  render: () => <WorkflowDemo />,
};
