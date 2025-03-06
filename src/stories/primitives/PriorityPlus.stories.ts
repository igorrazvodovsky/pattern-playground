import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";

// import iconsData from "./icons"
import { faker } from '@faker-js/faker';

// const icons = Object.keys(iconsData).filter((icon) => !icon.includes("fill"));
// function randomIcon() { return icons[icons.length * Math.random() << 0] }

const meta = {
  title: "Primitives/Priority+ 🚧",
  argTypes: {},
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {},
  render: () => html``,
};

