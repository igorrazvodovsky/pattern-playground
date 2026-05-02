import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

const meta = {
  title: "Actions/Evaluation/List",
  tags: ['activity-level:action', 'atomic:component', 'role:component', 'lifecycle:evaluation', 'mediation:individual'],
  parameters: {
    docs: {
      description: {
        component: 'Composable list component for menus, option sets, and vertical navigation. List items support inline checkboxes, radios, toggles, and separators.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const List: Story = {
  args: {},
  render: () => (
    <pp-list style={{ maxWidth: '320px' }}>
      <pp-list-item>Option 1</pp-list-item>
      <pp-list-item>Option 2</pp-list-item>
      <pp-list-item>Option 3</pp-list-item>
      <hr />
      <pp-list-item type="checkbox" checked>Checkbox, radio or toggle</pp-list-item>
      <pp-list-item disabled>Disabled</pp-list-item>
      <pp-list-item>
        Prefix
        <iconify-icon className="icon" slot="prefix" icon="ph:circle-dashed"></iconify-icon>
      </pp-list-item>
      <pp-list-item>
        Suffix
        <iconify-icon className="icon" slot="suffix" icon="ph:circle-dashed"></iconify-icon>
      </pp-list-item>
    </pp-list>
  ),
};