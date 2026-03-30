import type { Meta, StoryObj } from "@storybook/react-vite";

type CalloutPurpose = 'neutral' | 'accent' | 'info' | 'success' | 'warning' | 'danger';

interface CalloutArgs {
  message: string;
  purpose: CalloutPurpose;
}

const purposeIcons: Record<CalloutPurpose, string> = {
  neutral: 'ph:info',
  accent: 'ph:star',
  info: 'ph:info',
  success: 'ph:check-circle',
  warning: 'ph:warning',
  danger: 'ph:x-circle',
};

const meta = {
  title: "Operations/Callout",
  argTypes: {
    message: {
      control: 'text',
      description: 'Callout message',
    },
    purpose: {
      control: { type: 'radio' },
      options: ['neutral', 'accent', 'info', 'success', 'warning', 'danger'],
      description: 'Semantic purpose / severity',
    },
  },
} satisfies Meta<CalloutArgs>;

export default meta;
type Story = StoryObj<CalloutArgs>;

export const Callout: Story = {
  args: {
    message: 'This is a callout.',
    purpose: 'info',
  },
  render: (args) => (
    <div className={`callout ${args.purpose !== 'neutral' ? args.purpose : 'layer'} flex`}>
      <iconify-icon className="icon" icon={purposeIcons[args.purpose]} />
      <span>{args.message}</span>
    </div>
  ),
};

export const Purpose: Story = {
  render: () => (
    <div className="flow layer">
      <div className="callout layer">Neutral callout</div>
      <div className="callout accent">Accent callout</div>
      <div className="callout info">Info callout</div>
      <div className="callout success">Success callout</div>
      <div className="callout danger">Danger callout</div>
      <div className="callout warning">Warning callout</div>
    </div>
  ),
};
