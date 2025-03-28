import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";

const meta = {
  title: "Primitives/Textarea",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  render: () => html`
    <form action="#0">
      <label for="text">Label</label>
      <div class="grow-wrap">
        <textarea placeholder="Type something" rows="1" name="text" id="text" onInput="this.parentNode.dataset.replicatedValue = this.value"></textarea>
      </div>
      <small>Help text.</small>
    </form>
  `,
};