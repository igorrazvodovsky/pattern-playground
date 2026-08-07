import type { Meta, StoryObj } from "@storybook/react-vite";
import { PpToast } from "../main.ts";
import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from 'storybook/test';

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
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Show toast' }));
    // Toasts live in a singleton group on document.body, so match on the
    // message this story passed rather than on the first alert found. The
    // toast enters on a fade-in, so it sits in the document at opacity 0
    // before it is visible — hence the wait rather than a bare assertion.
    await waitFor(() => {
      const toast = within(document.body)
        .getAllByRole('alert')
        .find((el) => el.textContent?.includes(args.message));
      expect(toast).toBeVisible();
    });
  },
};

export const Multiple: Story = {
  render: () => (
    <div className="inline-flow">
      <button
        className="button"
        onClick={() => {
          PpToast.show("First toast message");
          setTimeout(() => PpToast.show("Second toast message — open", () => {
            action('toast-action')('second');
          }), 500);
          setTimeout(() => PpToast.show("Third toast message"), 1000);
        }}
      >
        Show toasts
      </button>
    </div>
  ),
};
