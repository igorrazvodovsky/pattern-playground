import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const meta = {
  title: "Primitives/Checkbox",
  render: () => html`
    <label class="form-control">
      <input type="checkbox" checked />
      Checkbox
    </label>
  `,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Checkbox: Story = {};
