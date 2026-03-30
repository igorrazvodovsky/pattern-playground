import type { Meta, StoryObj } from "@storybook/react-vite";

interface ButtonArgs {
  label: string;
  variant: 'default' | 'primary' | 'danger' | 'plain';
  disabled: boolean;
  iconPosition: 'none' | 'prefix' | 'suffix' | 'both';
}

const meta = {
  title: "Operations/Button",
  argTypes: {
    label: {
      control: 'text',
      description: 'Button label',
    },
    variant: {
      control: { type: 'radio' },
      options: ['default', 'primary', 'danger', 'plain'],
      description: 'Visual variant',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    iconPosition: {
      control: { type: 'radio' },
      options: ['none', 'prefix', 'suffix', 'both'],
      description: 'Icon position relative to label',
    },
  },
} satisfies Meta<ButtonArgs>;

export default meta;
type Story = StoryObj<ButtonArgs>;

export const Default: Story = {
  args: {
    label: 'Button',
    variant: 'default',
    disabled: false,
    iconPosition: 'none',
  },
  render: (args) => {
    const classes = ['button', args.variant !== 'default' ? `button--${args.variant}` : ''].filter(Boolean).join(' ');
    const icon = <iconify-icon className="icon" icon="ph:circle-dashed" />;
    return (
      <button className={classes} is="pp-button" disabled={args.disabled}>
        {(args.iconPosition === 'prefix' || args.iconPosition === 'both') && icon}
        {args.label}
        {(args.iconPosition === 'suffix' || args.iconPosition === 'both') && icon}
      </button>
    );
  },
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

