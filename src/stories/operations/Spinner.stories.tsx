import type { Meta, StoryObj } from "@storybook/react-vite";
import "../../jsx-types";

const meta = {
  title: "Operations/Spinner",
  tags: ['!autodocs', 'activity-level:operation', 'atomic:primitive', 'mediation:individual'],
  render: () => <pp-spinner></pp-spinner>,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Spinner: Story = {};