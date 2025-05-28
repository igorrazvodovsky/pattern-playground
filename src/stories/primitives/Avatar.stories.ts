import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import '../../components/avatar/avatar';
import { icons as phosphorIcons } from '@iconify-json/ph';

const filledIconNames = Object.keys(phosphorIcons.icons).filter(name => name.endsWith('-fill'));

function getRandomFilledIcon() {
  const randomIndex = Math.floor(Math.random() * filledIconNames.length);
  return "ph:" + filledIconNames[randomIndex];
}

interface AvatarProps {
  size?: 'small' | 'medium' | 'large';
  initials?: string;
}

const meta = {
  title: 'Primitives/Avatar',
  component: 'pp-avatar',
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'The size of the avatar',
    }
  },
} satisfies Meta<AvatarProps>;

export default meta;
type Story = StoryObj<AvatarProps>;

export const WithImage: Story = {
  args: {
    size: 'medium',
  },
  render: (args) => html`
    <pp-avatar size=${args.size}>
      <img src="https://i.pravatar.cc/150?img=5" alt="John Doe" />
    </pp-avatar>
  `,
};

export const WithIcon: Story = {
  render: () => html`
    <pp-avatar>
      <iconify-icon class="icon" icon="${getRandomFilledIcon()}"></iconify-icon>
    </pp-avatar>
  `,
};

export const Sizes: Story = {
  render: () => html`
    <pp-avatar size="small">
      <img src="https://i.pravatar.cc/150?img=1" alt="Small Avatar" />
    </pp-avatar>
    <pp-avatar size="medium">
      <img src="https://i.pravatar.cc/150?img=2" alt="Medium Avatar" />
    </pp-avatar>
    <pp-avatar size="large">
      <img src="https://i.pravatar.cc/150?img=4" alt="Large Avatar" />
    </pp-avatar>
  `,
};

export const AvatarGroup: Story = {
  render: () => html`
    <div class="avatar-group">
      <pp-avatar>
        <img src="https://i.pravatar.cc/150?img=13" alt="Small Avatar" />
      </pp-avatar>
      <pp-avatar>
        <img src="https://i.pravatar.cc/150?img=16" alt="Medium Avatar" />
      </pp-avatar>
      <pp-avatar>
        <img src="https://i.pravatar.cc/150?img=17" alt="Large Avatar" />
      </pp-avatar>
    </div>
  `,
};