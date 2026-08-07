import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef } from "react";
import { action } from 'storybook/actions';
import { expect, userEvent, within } from 'storybook/test';

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
  title: "Components/Checkbox",
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
    expect(checkbox).toBeChecked();
    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  },
};

/**
 * Space toggles, Tab moves on, and a disabled checkbox is skipped rather than
 * focused — the actor tabbing through a form never lands somewhere they
 * cannot act.
 */
export const KeyboardOperation: Story = {
  name: 'Keyboard operation',
  render: () => (
    <div className="flow">
      <label className="form-control">
        <input type="checkbox" />
        First
      </label>
      <label className="form-control">
        <input type="checkbox" disabled />
        Disabled
      </label>
      <label className="form-control">
        <input type="checkbox" />
        Last
      </label>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [first, , last] = canvas.getAllByRole('checkbox') as HTMLInputElement[];

    await userEvent.tab();
    expect(first).toHaveFocus();

    await userEvent.keyboard(' ');
    expect(first).toBeChecked();
    await userEvent.keyboard(' ');
    expect(first).not.toBeChecked();

    // The disabled one is not a tab stop.
    await userEvent.tab();
    expect(last).toHaveFocus();
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
