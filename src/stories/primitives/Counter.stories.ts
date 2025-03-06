import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";

const meta = {
  title: "Primitives/Counter",
  render: () => html`<span class="counter" role="status" aria-live="polite"></span>`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Counter: Story = {};
