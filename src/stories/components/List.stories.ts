import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const meta = {
  title: "Components/List",
  argTypes: {},
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const List: Story = {
  args: {},
  render: () => html`
    <pp-list style="max-width: 240px;">
      <pp-list-item>Option 1</pp-list-item>
      <pp-list-item>Option 2</pp-list-item>
      <pp-list-item>Option 3</pp-list-item>
      <hr />
      <pp-list-item type="checkbox" checked>Checkbox, radio or toggle</pp-list-item>
      <pp-list-item disabled>Disabled</pp-list-item>
      <pp-list-item>
        Prefix
        <iconify-icon class="icon" slot="prefix" icon="ph:circle-dashed"></iconify-icon>
      </pp-list-item>
      <pp-list-item>
        Suffix
        <iconify-icon class="icon" slot="suffix" icon="ph:circle-dashed"></iconify-icon>
      </pp-list-item>
    </pp-list>
  `,
};
