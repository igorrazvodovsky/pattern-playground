import type { Meta, StoryObj } from "@storybook/react-vite";

interface InputArgs {
  label: string;
  value: string;
  placeholder: string;
  disabled: boolean;
  addon: 'none' | 'prefix' | 'suffix' | 'both';
}

const meta = {
  title: "Components/Input",
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Accessible label (aria-label on the input)',
    },
    value: {
      control: { type: 'text' },
      description: 'Input value',
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text',
    },
    disabled: {
      control: { type: 'boolean' },
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
    label: 'Search',
    value: '',
    placeholder: 'Enter value…',
    disabled: false,
    addon: 'none',
  },
  render: (args) => (
    <pp-input>
      {(args.addon === 'prefix' || args.addon === 'both') && (
        <iconify-icon className="icon" icon="ph:magnifying-glass" data-slot="prefix" />
      )}
      <input
        aria-label={args.label}
        defaultValue={args.value}
        placeholder={args.placeholder}
        disabled={args.disabled}
      />
      {(args.addon === 'suffix' || args.addon === 'both') && (
        <iconify-icon className="icon" icon="ph:x" data-slot="suffix" />
      )}
    </pp-input>
  ),
};

export const Disabled: Story = {
  args: {
    label: 'Search',
    value: '',
    placeholder: 'Disabled',
    disabled: true,
    addon: 'none',
  },
  render: (args) => (
    <pp-input>
      <input aria-label={args.label} placeholder={args.placeholder} disabled={args.disabled} />
    </pp-input>
  ),
};

/**
 * The input is a real light-DOM `<input>`, so a `<label for="…">` associates
 * natively — clicking the label focuses the field.
 */
export const WithLabel: Story = {
  render: () => (
    <div className="flow">
      <label htmlFor="name-input">Name</label>
      <pp-input>
        <input id="name-input" placeholder="e.g. Jane Doe" />
      </pp-input>
    </div>
  ),
};

export const WithHelpText: Story = {
  render: () => (
    <div className="flow">
      <label htmlFor="email-input">Email</label>
      <pp-input>
        <input id="email-input" aria-describedby="email-help" placeholder="e.g. jane.doe@example.com" />
      </pp-input>
      <small id="email-help">We'll only use this to send you account notifications.</small>
    </div>
  ),
};

/**
 * TODO: Prefix color
 */
export const Addons: Story = {
  render: () => (
    <>
      <pp-input>
        <iconify-icon className="icon" icon="ph:circle-dashed" data-slot="prefix"></iconify-icon>
        <input aria-label="Icon prefix" defaultValue="Value" />
      </pp-input>
      <br />
      <pp-input>
        <input aria-label="Search" defaultValue="Value" />
        <iconify-icon className="icon" icon="ph:magnifying-glass" data-slot="suffix"></iconify-icon>
      </pp-input>
      <br />
      <pp-input>
        <iconify-icon className="icon" icon="ph:chat" data-slot="prefix"></iconify-icon>
        <input aria-label="Message" defaultValue="Value" />
        <iconify-icon className="icon" icon="ph:arrow-elbow-down-left" data-slot="suffix"></iconify-icon>
      </pp-input>
      <br />
      <pp-input>
        <iconify-icon className="icon" icon="ph:currency-dollar" data-slot="prefix"></iconify-icon>
        <input aria-label="Amount" defaultValue="100" />
      </pp-input>
      <br />
      <pp-input>
        <input aria-label="Quantity" defaultValue="1" />
        <small data-slot="suffix">+112.00 €/ pc.</small>
        <iconify-icon className="icon" icon="ph:caret-down" data-slot="suffix"></iconify-icon>
      </pp-input>
    </>
  ),
};
