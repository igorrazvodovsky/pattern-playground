// TODO: caret

import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";

const meta = {
  title: "Components/Dropdown",
  argTypes: {},
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Dropdown: Story = {
  args: {},
  render: () => html`
    <pp-dropdown>
      <button class="button" is="pp-buton" slot="trigger">
        Dropdown
        <iconify-icon class="icon" icon="ph:caret-down" aria-hidden="true"></iconify-icon>
      </button>
      <pp-list>
        <pp-list-item>Dropdown Item 1</pp-list-item>
        <pp-list-item>Dropdown Item 2</pp-list-item>
        <pp-list-item>Dropdown Item 3</pp-list-item>
      </pp-list>
    </pp-dropdown>
  `,
};
