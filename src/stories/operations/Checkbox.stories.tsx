import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Operations/Checkbox",
  render: () => (
    <label className="form-control">
      <input type="checkbox" defaultChecked />
      Checkbox
    </label>
  ),
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Checkbox: Story = {};