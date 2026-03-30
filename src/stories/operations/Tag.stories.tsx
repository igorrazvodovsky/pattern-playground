import type { Meta, StoryObj } from "@storybook/react-vite";
import { faker } from '@faker-js/faker';

function capitalizeFirstLetter(v) {
  return String(v).charAt(0).toUpperCase() + String(v).slice(1);
}

interface TagArgs {
  label: string;
  pill: boolean;
  removable: boolean;
}

const meta = {
  title: "Operations/Tag",
  argTypes: {
    label: {
      control: 'text',
      description: 'Tag label',
    },
    pill: {
      control: 'boolean',
      description: 'Pill shape (rounded)',
    },
    removable: {
      control: 'boolean',
      description: 'Show remove button',
    },
  },
} satisfies Meta<TagArgs>;

export default meta;
type Story = StoryObj<TagArgs>;

export const Default: Story = {
  args: {
    label: 'Tag',
    pill: false,
    removable: false,
  },
  render: (args) => (
    <span className={['tag', args.pill ? 'tag--pill' : ''].filter(Boolean).join(' ')}>
      {args.label}
      {args.removable && (
        <button>
          <iconify-icon className="icon" icon="ph:x" />
        </button>
      )}
    </span>
  ),
};

export const Basic: Story = {
  render: () => (
    <div className="inline-flow">
      <span className="tag">{capitalizeFirstLetter(faker.word.words())}</span>
      <span className="tag">{capitalizeFirstLetter(faker.word.words())}</span>
      <span className="tag">{capitalizeFirstLetter(faker.word.words())}</span>
    </div>
  ),
};

export const Pill: Story = {
  render: () => <span className="tag tag--pill">Tag</span>,
};

export const Link: Story = {
  render: () => <span className="tag">Tag</span>,
};

export const Removable: Story = {
  render: () => (
    <div className="inline-flow">
      <span className="tag">
        Tag
        <button>
          <iconify-icon className="icon" icon="ph:x"></iconify-icon>
        </button>
      </span>
      <span className="tag tag--pill">
        Tag
        <button>
          <iconify-icon className="icon" icon="ph:x"></iconify-icon>
        </button>
      </span>
    </div>
  ),
};

export const Selectable: Story = {
  render: () => (
    <div className="inline-flow">
      <label className="form-control tag">
        <input type="checkbox" />
        Checkbox
      </label>
      <label className="form-control tag">
        <input type="checkbox" />
        Checkbox
      </label>
      <label className="form-control tag">
        <input type="checkbox" defaultChecked />
        Checkbox
      </label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="inline-flow">
      <span className="tag">
        Tag
        <button disabled>
          <iconify-icon className="icon" icon="ph:x"></iconify-icon>
        </button>
      </span>
      <label className="form-control tag">
        <input type="checkbox" disabled />
        Checkbox
      </label>
      <label className="form-control tag">
        <input type="checkbox" defaultChecked disabled />
        Checkbox
      </label>
    </div>
  ),
};

export const Purpose: Story = {
  render: () => <span className="tag">Tag</span>,
};