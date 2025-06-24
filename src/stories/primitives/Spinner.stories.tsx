import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Primitives/Spinner",
  tags: ['!autodocs'],
  render: () => <pp-spinner></pp-spinner>,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Spinner: Story = {};