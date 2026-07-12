import type { Meta, StoryObj } from "@storybook/react-vite";
import { PpToast } from "../main.ts";
import { action } from 'storybook/actions';
import { userEvent, within } from '@storybook/testing-library';

interface ToastArgs {
  message: string;
}

const meta = {
  title: "Components/Toast",
  tags: ["activity-level:operation", "atomic:primitive", 'mediation:individual'],
  argTypes: {
    message: {
      control: { type: 'text' },
      description: 'Toast message text',
    },
  },
} satisfies Meta<ToastArgs>;

export default meta;
type Story = StoryObj<ToastArgs>;

export const Default: Story = {
  args: { message: 'Something happened' },
  render: ({ message }) => (
    <div className="inline-flow">
      <button
        className="button"
        onClick={() => {
          action('toast-shown')(message);
          PpToast.show(message);
        }}
      >
        Show toast
      </button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Show toast' }));
    await within(document.body).findByRole('alert');
  },
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
