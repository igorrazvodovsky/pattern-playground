import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";

const meta = {
  title: "Primitives/Popover",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <button popovertarget="my-popover" style="anchor-name: --anchor_1;">Popover</button>
    <div id="my-popover" popover>
      <p>I am a popover with more information. Hit <kbd>esc</kbd> or click away to close me.</p>
    </div>
  `,
};