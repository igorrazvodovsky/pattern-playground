import type { Meta, StoryObj } from "@storybook/react-vite";
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
        Show toast
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
          setTimeout(() => PpToast.show("Second toast message", () => {
            alert("Clicked second toast!");
          }), 500);
          setTimeout(() => PpToast.show("Third toast message"), 1000);
        }}
      >
        Show toasts
      </button>
    </div>
  ),
};

export const Notification: Story = {
  render: () => (
    <button
      className="button"
      onClick={() => PpToast.show("Something done!")}
    >
      Do something
    </button>
  ),
};
