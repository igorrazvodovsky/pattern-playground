import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { userEvent, within } from '@storybook/testing-library';

interface SwitchArgs {
  label: string;
  checked: boolean;
  disabled: boolean;
  size: 'small' | 'medium' | 'large';
}

const meta = {
  title: "Components/Switch",
  tags: ['autodocs', 'activity-level:operation', 'atomic:primitive', 'mediation:individual'],
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Accessible label (aria-label on the internal input)',
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
  const ref = useRef<HTMLElement>(null);
  const [checked, setChecked] = useState(props.checked);

  useEffect(() => setChecked(props.checked), [props.checked]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ checked: boolean }>).detail;
      if (detail !== undefined) setChecked(detail.checked);
    };
    el.addEventListener('change', handler);
    return () => el.removeEventListener('change', handler);
  }, []);

  return (
    <pp-switch
      ref={ref}
      label={props.label}
      checked={checked}
      disabled={props.disabled}
      size={props.size}
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
  render: () => <pp-switch label="Dark mode" checked />,
};

export const Disabled: Story = {
  render: () => <pp-switch label="Notifications" disabled />,
};

export const DisabledChecked: Story = {
  render: () => <pp-switch label="Notifications" checked disabled />,
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <pp-switch label="Small" size="small" />
      <pp-switch label="Medium" size="medium" />
      <pp-switch label="Large" size="large" />
    </div>
  ),
};

export const ToggleInteraction: Story = {
  render: () => (
    <pp-switch label="Toggle me" />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch') as HTMLInputElement;
    await userEvent.click(switchEl);
    await userEvent.click(switchEl);
  },
};
