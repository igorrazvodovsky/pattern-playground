import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";

const meta = {
  title: "Primitives/Spinner",
  render: () => html` <ir-spinner></ir-spinner>`,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Spinner: Story = {};
