import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Operations/Counter",
  tags: ['activity-level:operation', 'atomic:primitive', 'mediation:individual'],
  render: () => <span className="counter" role="status" aria-live="polite"></span>,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Counter: Story = {};