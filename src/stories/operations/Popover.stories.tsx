import type { Meta, StoryObj } from "@storybook/react-vite";
import { faker } from '@faker-js/faker';
import { userEvent, within } from '@storybook/testing-library';

const meta = {
  title: "Operations/Popover",
  tags: ["activity-level:operation", "atomic:primitive", "mediation:individual"],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Popover: Story = {
  render: () => (
    <>
      <button className="button" popoverTarget="popover-1">Click me</button>
      <div id="popover-1" popover="auto">
        <strong>Popover header</strong>
        <p>{faker.hacker.phrase()}</p>
      </div>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Click me' });
    await userEvent.click(trigger);
  },
};

export const Tooltip: Story = {
  render: () => (
    <pp-tooltip content="Supplementary information about this control.">
      <button className="button">Hover me</button>
    </pp-tooltip>
  ),
};

export const TooltipOnIcon: Story = {
  name: "Tooltip on icon",
  render: () => (
    <pp-tooltip content="Delete this item permanently">
      <button className="button button--plain">
        <iconify-icon className="icon" icon="ph:trash-simple" />
        <span className="inclusively-hidden">Delete</span>
      </button>
    </pp-tooltip>
  ),
};
