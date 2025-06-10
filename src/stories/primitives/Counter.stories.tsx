import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

const meta = {
  title: "Primitives/Counter",
  render: () => <span className="counter" role="status" aria-live="polite"></span>,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Counter: Story = {};