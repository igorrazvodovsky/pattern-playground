import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { faker } from '@faker-js/faker';

const meta = {
  title: "Compositions/Item view",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Page: Story = {
  args: {},
  render: () => (
    <div>Test</div>
  ),
};