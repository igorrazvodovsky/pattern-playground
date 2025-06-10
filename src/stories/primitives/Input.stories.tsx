import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import type { InputProps } from "../../components/input/input";

const meta = {
  title: "Primitives/Input",
} satisfies Meta<InputProps>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    value: 'Test',
  },
  render: () => <pp-input></pp-input>,
};

export const Disabled: Story = {
  args: {
    value: 'Test',
  },
  render: () => (
    <pp-input placeholder="Disabled" disabled></pp-input>
  ),
};

/**
 * TODO: Prefix color
 */
export const Addons: Story = {
  render: () => (
    <>
      <pp-input value="Value">
        <iconify-icon className="icon" icon="ph:circle-dashed" slot="prefix"></iconify-icon>
      </pp-input>
      <br />
      <pp-input value="Value">
        <iconify-icon className="icon" icon="ph:magnifying-glass" slot="suffix"></iconify-icon>
      </pp-input>
      <br />
      <pp-input value="Value">
        <iconify-icon className="icon" icon="ph:chat" slot="prefix"></iconify-icon>
        <iconify-icon className="icon" icon="ph:arrow-elbow-down-left" slot="suffix"></iconify-icon>
      </pp-input>
      <br />
      <pp-input value="100">
        <iconify-icon className="icon" icon="ph:currency-dollar" slot="prefix"></iconify-icon>
      </pp-input>
      <br />
      <pp-input value="1">
        <small slot="suffix">+112.00 €/ pc.</small>
        <iconify-icon className="icon" icon="ph:caret-down" slot="suffix"></iconify-icon>
      </pp-input>
    </>
  ),
};
