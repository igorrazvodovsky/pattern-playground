import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Primitives/Callout",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Callout: Story = {
  render: () => (
    <div className="callout info flex"><iconify-icon className="icon" icon="ph:info"></iconify-icon><span>This is a callout.</span></div>
  ),
};

export const Purpose: Story = {
  render: () => (
  <div className='flow layer'>
    <div className="callout layer">Neutral callout</div>
    <div className="callout accent">Accent callout</div>
    <div className="callout info">Info callout</div>
    <div className="callout success">Success callout</div>
    <div className="callout danger">Danger callout</div>
    <div className="callout warning">Warning callout</div>
  </div>
),
};