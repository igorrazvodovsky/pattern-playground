// TODO: caret

import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Components/Dropdown",
  tags: ['activity-level:action', 'atomic:component', 'lifecycle:coordination', 'mediation:coordination'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Dropdown: Story = {
  args: {},
  render: () => (
    <pp-dropdown>
      <button className="button" data-slot="trigger">
        Dropdown
        <iconify-icon className="icon" icon="ph:caret-down" aria-hidden="true"></iconify-icon>
      </button>
      <pp-popup>
        <pp-list>
          <pp-list-item>Dropdown Item 1</pp-list-item>
          <pp-list-item>Dropdown Item 2</pp-list-item>
          <pp-list-item>Dropdown Item 3</pp-list-item>
        </pp-list>
      </pp-popup>
    </pp-dropdown>
  ),
  // ArrowUp on the trigger opens the dropdown on its last item. The item stays
  // current once the popup has animated in, so the next ArrowUp moves to the
  // item above it rather than counting from the first.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dropdown = canvasElement.querySelector("pp-dropdown")!;
    const shown = new Promise(resolve => dropdown.addEventListener("pp-after-show", resolve, { once: true }));
    canvas.getByRole("button", { name: /Dropdown/ }).focus();
    await userEvent.keyboard("{ArrowUp}");
    await shown;
    const items = [...canvasElement.querySelectorAll("pp-list-item")];
    await waitFor(() => expect(items[2]).toHaveFocus());
    expect(items[2]).toHaveAttribute("tabindex", "0");
    await userEvent.keyboard("{ArrowUp}");
    expect(items[1]).toHaveFocus();
    await userEvent.keyboard("{Escape}");
  },
};

export const DropdownWithSubmenus: Story = {
  args: {},
  render: () => (
    <pp-dropdown>
      <button className="button" data-slot="trigger">
        Dropdown with Submenus
        <iconify-icon className="icon" icon="ph:caret-down" aria-hidden="true"></iconify-icon>
      </button>
      <pp-popup>
        <pp-list>
          <pp-list-item>Simple Item 1</pp-list-item>
          <pp-list-item has-submenu>
            File
            <pp-list data-slot="submenu">
              <pp-list-item>New</pp-list-item>
              <pp-list-item>Open</pp-list-item>
              <pp-list-item>Save</pp-list-item>
              <pp-list-item has-submenu>
                Recent Files
                <pp-list data-slot="submenu">
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
            <pp-list data-slot="submenu">
              <pp-list-item>Cut</pp-list-item>
              <pp-list-item>Copy</pp-list-item>
              <pp-list-item>Paste</pp-list-item>
            </pp-list>
          </pp-list-item>
          <pp-list-item>Simple Item 2</pp-list-item>
        </pp-list>
      </pp-popup>
    </pp-dropdown>
  ),
};