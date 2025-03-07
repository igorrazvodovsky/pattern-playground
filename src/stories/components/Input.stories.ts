import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import type { InputProps } from "../../components/input/input";

const meta = {
  title: "Components/Input",
} satisfies Meta<InputProps>;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    value: 'Test',
  },
  render: () => html` <pp-input></pp-input>`,
};

export const Disabled: Story = {
  args: {
    value: 'Test',
  },
  render: () => html`
  <pp-input placeholder="Disabled" disabled></pp-input>
  `,
};

/**
 * TODO: Prefix color
 */
export const Addons: Story = {
  render: () => html`
    <pp-input value="Value">
      <iconify-icon class="icon" icon="ph:circle-dashed" slot="prefix"></iconify-icon>
    </pp-input>
    <br />
    <pp-input value="Value">
      <iconify-icon class="icon" icon="ph:magnifying-glass" slot="suffix"></iconify-icon>
    </pp-input>
    <br />
    <pp-input value="Value">
      <iconify-icon class="icon" icon="ph:chat" slot="prefix"></iconify-icon>
      <iconify-icon class="icon" icon="ph:arrow-elbow-down-left" slot="suffix"></iconify-icon>
    </pp-input>
    <br />
    <pp-input value="100">
      <iconify-icon class="icon" icon="ph:currency-dollar" slot="prefix"></iconify-icon>
    </pp-input>
    <br />
    <pp-input value="1">
      <small slot="suffix">+112.00 €/pc.</small>
      <iconify-icon class="icon" icon="ph:caret-down" slot="suffix"></iconify-icon>
    </pp-input>
  `,
};
