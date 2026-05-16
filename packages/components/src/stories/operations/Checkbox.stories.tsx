import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef } from "react";
import { action } from 'storybook/actions';
import { userEvent, within } from '@storybook/testing-library';

interface CheckboxArgs {
  label: string;
  checked: boolean;
  disabled: boolean;
  indeterminate: boolean;
}

function CheckboxStory({ label, checked, disabled, indeterminate }: CheckboxArgs) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <label className="form-control">
      <input
        type="checkbox"
        ref={ref}
        defaultChecked={checked}
        disabled={disabled}
        onChange={action('change')}
      />
      {label}
    </label>
  );
}

const meta = {
  title: "Operations/Checkbox",
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Checkbox label',
    },
    checked: {
      control: { type: 'boolean' },
      description: 'Checked state',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disabled state',
    },
    indeterminate: {
      control: { type: 'boolean' },
      description: 'Indeterminate state (partial selection)',
    },
  },
} satisfies Meta<CheckboxArgs>;

export default meta;
type Story = StoryObj<CheckboxArgs>;

export const Checkbox: Story = {
  args: {
    label: 'Checkbox',
    checked: false,
    disabled: false,
    indeterminate: false,
  },
  render: (args) => <CheckboxStory key={String(args.checked)} {...args} />,
};

export const ToggleInteraction: Story = {
  render: () => (
    <label className="form-control">
      <input type="checkbox" />
      Click to toggle
    </label>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox') as HTMLInputElement;
    await userEvent.click(checkbox);
    await userEvent.click(checkbox);
  },
};

export const States: Story = {
  render: () => (
    <div className="flow">
      <label className="form-control">
        <input type="checkbox" />
        Unchecked
      </label>
      <label className="form-control">
        <input type="checkbox" defaultChecked />
        Checked
      </label>
      <label className="form-control">
        <input type="checkbox" disabled />
        Disabled
      </label>
      <label className="form-control">
        <input type="checkbox" defaultChecked disabled />
        Checked disabled
      </label>
    </div>
  ),
};
