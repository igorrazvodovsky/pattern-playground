import type { Meta, StoryObj } from "@storybook/react-vite";
import "../../jsx-types";

const meta = {
  title: "Primitives/Spinner",
  tags: ['!autodocs'],
  render: () => <pp-spinner></pp-spinner>,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Spinner: Story = {};