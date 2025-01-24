import type { Meta, StoryObj } from "@storybook/web-components";
import type { ButtonProps } from "../components/button/button";
import { html } from "lit";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: "Components/Button",
  tags: ["autodocs"],
  argTypes: {
    // backgroundColor: { control: "color" },
    onClick: { action: "onClick" },
    size: {
      control: { type: "select" },
      options: ["small", "medium", "large"],
    },
    loading: { control: 'boolean' }
  },
} satisfies Meta<ButtonProps>;

export default meta;
type Story = StoryObj<ButtonProps>;

export const Default: Story = {
  args: {
    label: "Button",
    loading: false,
    size: "medium"
  },
  render: (args) => html` <ir-button> <iconify-icon icon="ph:circle-dashed"></iconify-icon> ${args.label} </ir-button>`,
};


