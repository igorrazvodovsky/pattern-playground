import type { Meta, StoryObj } from "@storybook/react";
import { PpToast } from "../../main.ts";
import { faker } from '@faker-js/faker';

const meta = {
  title: "Primitives/Toast",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="inline-flow">
      <button
        className="button"
        onClick={() => PpToast.show(faker.word.words())}
      >
        Show Toast
      </button>
    </div>
  ),
};

export const Multiple: Story = {
  render: () => (
    <div className="inline-flow">
      <button
        className="button"
        onClick={() => {
          PpToast.show("First toast message");
          setTimeout(() => PpToast.show("Second toast message"), 500);
          setTimeout(() => PpToast.show("Third toast message"), 1000);
        }}
      >
        Show Multiple Toasts
      </button>
    </div>
  ),
};
