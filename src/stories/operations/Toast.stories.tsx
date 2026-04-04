import type { Meta, StoryObj } from "@storybook/react-vite";
import { PpToast } from "../../main.ts";
import { faker } from '@faker-js/faker';
import { useState } from "react";
import { action } from 'storybook/actions';
import { userEvent, within } from '@storybook/testing-library';

interface ToastArgs {
  message: string;
}

const meta = {
  title: "Operations/Toast",
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

export const ToastWithUndo: Story = {
  tags: ['!autodocs', '!dev'],
  render: () => {
    const Component = () => {
      const [items, setItems] = useState(() =>
        Array.from({ length: 5 }, () => faker.commerce.productName())
      );

      const handleDelete = (item: string, index: number) => {
        setItems(items.filter((_, i) => i !== index));
        PpToast.show(`${item} deleted`);
      };

      return (
        <>
          <pp-list className="borderless">
            {items.map((item, index) => (
              <pp-list-item key={`${item}-${index}`}>
                {item}
                <button
                  slot="suffix"
                  className="button button--plain button--small"
                  onClick={() => handleDelete(item, index)}
                >
                  <iconify-icon
                    className="icon"
                    icon="ph:trash-simple"
                  />
                  <span className="inclusively-hidden">
                    Button
                  </span>
                </button>
              </pp-list-item>
            ))}
          </pp-list>
          {items.length === 0 && (
            <p className="muted">No items left</p>
          )}
        </>
      );
    };

    return <Component />;
  },
  parameters: {
    docs: {
      description: {
        story: "Confirms a destructive action with immediate toast feedback, giving users a clear signal the operation completed without interrupting their flow."
      }
    }
  }
};
