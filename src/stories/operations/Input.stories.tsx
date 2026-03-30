import type { Meta, StoryObj } from "@storybook/react-vite";

interface InputArgs {
  label: string;
  value: string;
  placeholder: string;
  disabled: boolean;
  addon: 'none' | 'prefix' | 'suffix' | 'both';
}

const meta = {
  title: "Operations/Input",
  argTypes: {
    label: {
      control: 'text',
      description: 'Accessible label (aria-label on the internal input)',
    },
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
    label: 'Search',
    value: '',
    placeholder: 'Enter value…',
    disabled: false,
    addon: 'none',
  },
  render: (args) => (
    <pp-input label={args.label} value={args.value} placeholder={args.placeholder} disabled={args.disabled}>
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
    label: 'Search',
    value: '',
    placeholder: 'Disabled',
    disabled: true,
    addon: 'none',
  },
  render: (args) => (
    <pp-input label={args.label} placeholder={args.placeholder} disabled={args.disabled}></pp-input>
  ),
};

/**
 * Shadow DOM inputs can't be associated with a `<label for="…">` — the label can't
 * reach across the shadow boundary. Use `aria-labelledby` instead: give the label an
 * `id` and pass it to the `labelledby` prop.
 */
export const WithLabel: Story = {
  render: () => (
    <div className="flow">
      <label id="name-label" htmlFor="">Name</label>
      <pp-input labelledby="name-label" placeholder="e.g. Jane Doe" />
    </div>
  ),
};

export const WithHelpText: Story = {
  render: () => (
    <div className="flow">
      <label id="email-label">Email</label>
      <pp-input labelledby="email-label" describedby="email-help" placeholder="e.g. jane.doe@example.com" />
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
      <pp-input label="Icon prefix" value="Value">
        <iconify-icon className="icon" icon="ph:circle-dashed" slot="prefix"></iconify-icon>
      </pp-input>
      <br />
      <pp-input label="Search" value="Value">
        <iconify-icon className="icon" icon="ph:magnifying-glass" slot="suffix"></iconify-icon>
      </pp-input>
      <br />
      <pp-input label="Message" value="Value">
        <iconify-icon className="icon" icon="ph:chat" slot="prefix"></iconify-icon>
        <iconify-icon className="icon" icon="ph:arrow-elbow-down-left" slot="suffix"></iconify-icon>
      </pp-input>
      <br />
      <pp-input label="Amount" value="100">
        <iconify-icon className="icon" icon="ph:currency-dollar" slot="prefix"></iconify-icon>
      </pp-input>
      <br />
      <pp-input label="Quantity" value="1">
        <small slot="suffix">+112.00 €/ pc.</small>
        <iconify-icon className="icon" icon="ph:caret-down" slot="suffix"></iconify-icon>
      </pp-input>
    </>
  ),
};
