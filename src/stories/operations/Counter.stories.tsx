import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Operations/Counter",
  tags: ['activity-level:operation', 'atomic:primitive', 'role:component', 'mediation:individual'],
  parameters: {
    docs: {
      description: {
        component: 'Accessible inline counter for notification badges, unread counts, and item tallies. Announces updates via `aria-live`.',
      },
    },
  },
  render: () => <span className="counter" role="status" aria-live="polite"></span>,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Counter: Story = {};