import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";

interface RangeArgs {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  disabled: boolean;
  size: 'small' | 'medium' | 'large';
}

const meta = {
  title: "Operations/Range",
  tags: ['autodocs', 'activity-level:operation', 'atomic:primitive', 'mediation:individual'],
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Accessible label (aria-label on the internal input)',
    },
    min: {
      control: { type: 'number' },
      description: 'Minimum value',
    },
    max: {
      control: { type: 'number' },
      description: 'Maximum value',
    },
    step: {
      control: { type: 'number' },
      description: 'Increment between steps',
    },
    value: {
      control: { type: 'number' },
      description: 'Current value',
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
} satisfies Meta<RangeArgs>;

export default meta;
type Story = StoryObj<RangeArgs>;

function ControlledRange(props: RangeArgs) {
  const ref = useRef<HTMLElement>(null);
  const [value, setValue] = useState(props.value);

  useEffect(() => setValue(props.value), [props.value]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ value: number }>).detail;
      if (detail) setValue(detail.value);
    };
    el.addEventListener('input', handler);
    return () => el.removeEventListener('input', handler);
  }, []);

  return (
    <pp-range
      ref={ref}
      label={props.label}
      min={props.min}
      max={props.max}
      step={props.step}
      value={value}
      disabled={props.disabled}
      size={props.size}
    />
  );
}

export const Default: Story = {
  args: {
    label: 'Volume',
    min: 0,
    max: 100,
    step: 1,
    value: 50,
    disabled: false,
    size: 'medium',
  },
  render: (args) => <ControlledRange {...args} />,
};

/**
 * Shadow DOM inputs can't be associated with a `<label for="…">` — the label can't
 * reach across the shadow boundary. Use `aria-labelledby` and `aria-describedby`
 * instead: give the label and hint elements `id`s and pass them through.
 */
export const WithLabelAndHint: Story = {
  render: () => (
    <div className="flow">
      <label id="brightness-label">Brightness</label>
      <pp-range
        labelledby="brightness-label"
        describedby="brightness-help"
        min={0}
        max={100}
        value={60}
      />
      <small id="brightness-help">Adjusts the display brightness across the entire interface.</small>
    </div>
  ),
};

export const WithMarks: Story = {
  render: () => (
    <pp-range
      label="Difficulty"
      min={0}
      max={10}
      step={1}
      value={4}
      marks
    />
  ),
};

export const WithPrefixAndSuffix: Story = {
  render: () => (
    <pp-range
      label="Price ceiling"
      min={0}
      max={1000}
      step={10}
      value={250}
      hide-value
    >
      <iconify-icon icon="ph:currency-gbp" slot="prefix" />
      <small slot="suffix">£1000</small>
    </pp-range>
  ),
};

/**
 * When the displayed value is formatted (currency, units, labels), pass the
 * formatted string as `value-text` so screen readers announce the formatted
 * form rather than the raw number.
 */
export const FormattedValue: Story = {
  render: () => {
    function FormattedRange() {
      const ref = useRef<HTMLElement>(null);
      const [value, setValue] = useState(50);
      const formatted = `£${value}`;

      useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const handler = (event: Event) => {
          const detail = (event as CustomEvent<{ value: number }>).detail;
          if (detail) setValue(detail.value);
        };
        el.addEventListener('input', handler);
        return () => el.removeEventListener('input', handler);
      }, []);

      return (
        <pp-range
          ref={ref}
          label="Monthly budget"
          min={0}
          max={200}
          step={5}
          value={value}
          hide-value
          value-text={formatted}
        >
          <span slot="suffix">{formatted}</span>
        </pp-range>
      );
    }
    return <FormattedRange />;
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flow">
      <pp-range label="Small" min={0} max={100} value={30} size="small" />
      <pp-range label="Medium" min={0} max={100} value={50} size="medium" />
      <pp-range label="Large" min={0} max={100} value={70} size="large" />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <pp-range label="Locked" min={0} max={100} value={40} disabled />
  ),
};
