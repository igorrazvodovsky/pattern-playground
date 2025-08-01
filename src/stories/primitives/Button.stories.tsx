import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Primitives/Button",
} satisfies Meta;

export default meta;
type Story = StoryObj<{ label?: string }>;

export const Default: Story = {
  args: { label: "Button" },
  render: (args) => <button className="button" is="pp-button">{args.label}</button>,
};

export const Variants: Story = {
  render: () => (
    <div className="inline-flow">
      <button className="button button--primary" is="pp-button">Primary</button>
      <button className="button button--danger" is="pp-button">Danger</button>
      <button className="button button--plain" is="pp-button">Plain</button>
      <button className="button" is="pp-button" disabled>Disabled</button>
    </div>
  ),
};

export const Prefixes: Story = {
  render: () => (
    <div className="inline-flow">
      <button className="button" is="pp-button">
        <iconify-icon className="icon" icon="ph:circle-dashed"></iconify-icon> With prefix
      </button>
      <button className="button" is="pp-button">
        With suffix <iconify-icon className="icon" icon="ph:circle-dashed"></iconify-icon>
      </button>
      <button className="button" is="pp-button">
        <iconify-icon className="icon" icon="ph:circle-dashed"></iconify-icon> With both <iconify-icon className="icon" icon="ph:circle-dashed"></iconify-icon>
      </button>
      <button className="button" is="pp-button">
        With keyboard shortcut <kbd>ESC</kbd>
      </button>
    </div>
  ),
};

export const Toggle: Story = {
  render: () => (
    <div className="inline-flow">
      <button className="button" is="pp-button">Simple toggle</button>
      <button className="button" is="pp-button">Multiple state toggle</button>
    </div>
  ),
};

export const IconButton: Story = {
  args: { label: "Button" },
  render: (args) => (
    <button className="button" is="pp-button">
      <iconify-icon className="icon" icon="ph:circle-dashed"></iconify-icon>
      <span className="inclusively-hidden">{args.label}</span>
    </button>
  ),
};

