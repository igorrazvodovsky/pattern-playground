import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

const meta = {
  title: "Compositions/Browsing & sensemaking/Sorting",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Sorting: Story = {
  args: {},
  render: () => (
    <div className="button-group">
      <pp-dropdown>
        <button className="button" is="pp-button" slot="trigger">
          Sorting criteria 1
          <iconify-icon className="icon" icon="ph:caret-down" aria-hidden="true"></iconify-icon>
        </button>
        <pp-list>
          <pp-list-item type="checkbox" defaultChecked>Sorting criteria 1</pp-list-item>
          <pp-list-item>Sorting criteria 2</pp-list-item>
          <pp-list-item>Sorting criteria 3</pp-list-item>
        </pp-list>
      </pp-dropdown>
      <button className="button" is="pp-button">
        <iconify-icon className="icon" icon="ph:sort-ascending" aria-hidden="true"></iconify-icon>
      </button>
    </div>
  ),
};