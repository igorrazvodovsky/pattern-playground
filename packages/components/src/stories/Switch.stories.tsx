import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { expect, userEvent, within } from 'storybook/test';

interface SwitchArgs {
  label: string;
  checked: boolean;
  disabled: boolean;
  size: 'small' | 'medium' | 'large';
}

const sizeClass = (size: SwitchArgs['size']) =>
  size === 'medium' ? 'switch' : `switch switch--${size}`;

const meta = {
  title: "Components/Switch",
  tags: ['autodocs', 'activity-level:operation', 'atomic:primitive', 'mediation:individual'],
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Accessible label (aria-label on the input)',
    },
    checked: {
      control: { type: 'boolean' },
      description: 'On/off state',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disabled state',
    },
    size: {
      control: { type: 'radio' },
      options: ['small', 'medium', 'large'],
      description: 'Track and thumb size',
    },
  },
} satisfies Meta<SwitchArgs>;

export default meta;
type Story = StoryObj<SwitchArgs>;

function ControlledSwitch(props: SwitchArgs) {
  const [checked, setChecked] = useState(props.checked);

  useEffect(() => setChecked(props.checked), [props.checked]);

  return (
    <input
      type="checkbox"
      role="switch"
      className={sizeClass(props.size)}
      aria-label={props.label}
      checked={checked}
      disabled={props.disabled}
      onChange={(event) => setChecked(event.target.checked)}
    />
  );
}

export const Switch: Story = {
  args: {
    label: 'Dark mode',
    checked: false,
    disabled: false,
    size: 'medium',
  },
  render: (args) => <ControlledSwitch {...args} />,
};

export const Checked: Story = {
  render: () => (
    <input type="checkbox" role="switch" className="switch" aria-label="Dark mode" defaultChecked />
  ),
};

export const Disabled: Story = {
  render: () => (
    <input type="checkbox" role="switch" className="switch" aria-label="Notifications" disabled />
  ),
};

export const DisabledChecked: Story = {
  render: () => (
    <input type="checkbox" role="switch" className="switch" aria-label="Notifications" defaultChecked disabled />
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <input type="checkbox" role="switch" className="switch switch--small" aria-label="Small" />
      <input type="checkbox" role="switch" className="switch" aria-label="Medium" />
      <input type="checkbox" role="switch" className="switch switch--large" aria-label="Large" />
    </div>
  ),
};

export const ToggleInteraction: Story = {
  render: () => (
    <input type="checkbox" role="switch" className="switch" aria-label="Toggle me" />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch') as HTMLInputElement;
    await userEvent.click(switchEl);
    expect(switchEl).toBeChecked();
    await userEvent.click(switchEl);
    expect(switchEl).not.toBeChecked();
  },
};

/**
 * The switch is a checkbox wearing `role="switch"`, which is the point: it
 * inherits the platform's keyboard contract rather than reimplementing it.
 * Tab reaches it, Space toggles it, and the focus ring is the browser's.
 */
export const KeyboardOperation: Story = {
  name: 'Keyboard operation',
  render: () => (
    <input type="checkbox" role="switch" className="switch" aria-label="Toggle me" />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch') as HTMLInputElement;

    await userEvent.tab();
    expect(switchEl).toHaveFocus();

    await userEvent.keyboard(' ');
    expect(switchEl).toBeChecked();
    await userEvent.keyboard(' ');
    expect(switchEl).not.toBeChecked();
  },
};
