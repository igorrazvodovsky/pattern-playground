import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { action } from 'storybook/actions';
import { userEvent, within } from '@storybook/testing-library';

const meta = {
  title: "Actions/Seeking/Sorting",
  parameters: {
    docs: {
      description: {
        component: 'Controls for applying and chaining sort criteria to a dataset. Each criterion exposes an attribute selector and a direction toggle.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Sorting: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /sorting criteria 1/i }));
  },
  render: () => (
    <div className="button-group">
      <pp-dropdown>
        <button className="button" is="pp-button" slot="trigger">
          Sorting criteria 1
          <iconify-icon className="icon" icon="ph:caret-down" aria-hidden="true"></iconify-icon>
        </button>
        <pp-list>
          <pp-list-item type="checkbox" defaultChecked onClick={action('sort-change')}>Sorting criteria 1</pp-list-item>
          <pp-list-item type="checkbox" onClick={action('sort-change')}>Sorting criteria 2</pp-list-item>
          <pp-list-item type="checkbox" onClick={action('sort-change')}>Sorting criteria 3</pp-list-item>
        </pp-list>
      </pp-dropdown>
      <button className="button" is="pp-button" aria-label="Sort ascending">
        <iconify-icon className="icon" icon="ph:sort-ascending" aria-hidden="true"></iconify-icon>
      </button>
    </div>
  ),
};