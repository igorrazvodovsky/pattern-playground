// TODO: caret

import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

const meta = {
  title: "Components/Dropdown",
  argTypes: {},
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Dropdown: Story = {
  args: {},
  render: () => (
    <pp-dropdown>
      <button className="button" is="pp-button" slot="trigger">
        Dropdown
        <iconify-icon className="icon" icon="ph:caret-down" aria-hidden="true"></iconify-icon>
      </button>
      <pp-list>
        <pp-list-item>Dropdown Item 1</pp-list-item>
        <pp-list-item>Dropdown Item 2</pp-list-item>
        <pp-list-item>Dropdown Item 3</pp-list-item>
      </pp-list>
    </pp-dropdown>
  ),
};