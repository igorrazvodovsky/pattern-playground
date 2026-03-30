import type { Meta, StoryObj } from "@storybook/react-vite";

interface InputArgs {
  value: string;
  placeholder: string;
  disabled: boolean;
  addon: 'none' | 'prefix' | 'suffix' | 'both';
}

const meta = {
  title: "Operations/Input",
  argTypes: {
    value: {
      control: 'text',
      description: 'Input value',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    addon: {
      control: { type: 'radio' },
      options: ['none', 'prefix', 'suffix', 'both'],
      description: 'Icon addon position',
    },
  },
} satisfies Meta<InputArgs>;

export default meta;
type Story = StoryObj<InputArgs>;

export const Default: Story = {
  args: {
    value: '',
    placeholder: 'Enter value…',
    disabled: false,
    addon: 'none',
  },
  render: (args) => (
    <pp-input value={args.value} placeholder={args.placeholder} disabled={args.disabled}>
      {(args.addon === 'prefix' || args.addon === 'both') && (
        <iconify-icon className="icon" icon="ph:magnifying-glass" slot="prefix" />
      )}
      {(args.addon === 'suffix' || args.addon === 'both') && (
        <iconify-icon className="icon" icon="ph:x" slot="suffix" />
      )}
    </pp-input>
  ),
};

export const Disabled: Story = {
  args: {
    value: '',
    placeholder: 'Disabled',
    disabled: true,
    addon: 'none',
  },
  render: (args) => (
    <pp-input placeholder={args.placeholder} disabled={args.disabled}></pp-input>
  ),
};

/**
 * TODO: Prefix color
 */
export const Addons: Story = {
  render: () => (
    <>
      <pp-input value="Value">
        <iconify-icon className="icon" icon="ph:circle-dashed" slot="prefix"></iconify-icon>
      </pp-input>
      <br />
      <pp-input value="Value">
        <iconify-icon className="icon" icon="ph:magnifying-glass" slot="suffix"></iconify-icon>
      </pp-input>
      <br />
      <pp-input value="Value">
        <iconify-icon className="icon" icon="ph:chat" slot="prefix"></iconify-icon>
        <iconify-icon className="icon" icon="ph:arrow-elbow-down-left" slot="suffix"></iconify-icon>
      </pp-input>
      <br />
      <pp-input value="100">
        <iconify-icon className="icon" icon="ph:currency-dollar" slot="prefix"></iconify-icon>
      </pp-input>
      <br />
      <pp-input value="1">
        <small slot="suffix">+112.00 €/ pc.</small>
        <iconify-icon className="icon" icon="ph:caret-down" slot="suffix"></iconify-icon>
      </pp-input>
    </>
  ),
};
