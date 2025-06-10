import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

const meta = {
  title: "Primitives/Spinner",
  render: () => <pp-spinner></pp-spinner>,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Spinner: Story = {};