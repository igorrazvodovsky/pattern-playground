// TODO: caret

import type { Meta, StoryObj } from "@storybook/react-vite";
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

export const DropdownWithSubmenus: Story = {
  args: {},
  render: () => (
    <pp-dropdown>
      <button className="button" is="pp-button" slot="trigger">
        Dropdown with Submenus
        <iconify-icon className="icon" icon="ph:caret-down" aria-hidden="true"></iconify-icon>
      </button>
      <pp-list>
        <pp-list-item>Simple Item 1</pp-list-item>
        <pp-list-item has-submenu>
          File
          <pp-list slot="submenu">
            <pp-list-item>New</pp-list-item>
            <pp-list-item>Open</pp-list-item>
            <pp-list-item>Save</pp-list-item>
            <pp-list-item has-submenu>
              Recent Files
              <pp-list slot="submenu">
                <pp-list-item>Document 1.txt</pp-list-item>
                <pp-list-item>Document 2.txt</pp-list-item>
                <pp-list-item>Document 3.txt</pp-list-item>
              </pp-list>
            </pp-list-item>
            <pp-list-item>Exit</pp-list-item>
          </pp-list>
        </pp-list-item>
        <pp-list-item has-submenu>
          Edit
          <pp-list slot="submenu">
            <pp-list-item>Cut</pp-list-item>
            <pp-list-item>Copy</pp-list-item>
            <pp-list-item>Paste</pp-list-item>
          </pp-list>
        </pp-list-item>
        <pp-list-item>Simple Item 2</pp-list-item>
      </pp-list>
    </pp-dropdown>
  ),
};