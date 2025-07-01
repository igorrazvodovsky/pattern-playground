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
        Show Basic Toast
      </button>
      <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.875rem' }}>
        Basic toast notification without click interactions.
      </p>
    </div>
  ),
};

export const Clickable: Story = {
  render: () => (
    <div className="inline-flow">
      <button
        className="button"
        onClick={() => {
          const message = faker.word.words();
          PpToast.show(message, () => {
            console.log('Toast clicked!', message);
            alert(`You clicked on toast: "${message}"`);
          });
        }}
      >
        Show Clickable Toast
      </button>
      <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.875rem' }}>
        Click on the toast content (button) to perform an action. Use keyboard navigation to focus and activate.
      </p>
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
        Show Mixed Toasts
      </button>
      <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.875rem' }}>
        Mix of clickable and non-clickable toasts. The second toast has click interaction.
      </p>
    </div>
  ),
};
