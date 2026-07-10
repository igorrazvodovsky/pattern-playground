import type { Meta, StoryObj } from "@storybook/react-vite";
import '../jsx-types';

const meta = {
  title: "Utilities/Visually hidden",
  tags: ['activity-level:operation', 'atomic:primitive', 'role:component', 'mediation:individual'],
  parameters: {
    docs: {
      description: {
        component: 'Hides content visually while keeping it available to assistive technology — icon-only button labels, announcement prefixes, off-screen context. The `.visually-hidden` class lives in the `utilities` layer of `main.css`. Shadow-DOM components carry their own copy where needed (e.g. the "Error:" prefix in `pp-select`).',
      },
    },
  },
  render: () => (
    <button className="button" type="button">
      <iconify-icon className="icon" icon="ph:bell" aria-hidden="true" />
      <span className="visually-hidden">Notifications</span>
    </button>
  ),
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const VisuallyHidden: Story = {};
