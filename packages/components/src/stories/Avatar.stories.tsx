import type { Meta, StoryObj } from "@storybook/react-vite";
import { icons as phosphorIcons } from '@iconify-json/ph';

const filledIconNames = Object.keys(phosphorIcons.icons).filter(name => name.endsWith('-fill'));

function getRandomFilledIcon() {
  const randomIndex = Math.floor(Math.random() * filledIconNames.length);
  return "ph:" + filledIconNames[randomIndex];
}

interface AvatarProps {
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  initials?: string;
}

const meta = {
  title: 'Components/Avatar',
  tags: ['autodocs', 'activity-level:operation', 'atomic:component', 'role:component', 'mediation:individual'],
  parameters: {
    docs: {
      description: {
        component: 'Visual representation of a user or entity.',
      },
    },
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['xsmall', 'small', 'medium', 'large'],
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
  render: (args) => (
    <img className="avatar" data-size={args.size} src="https://i.pravatar.cc/150?img=5" alt="John Doe" />
  ),
};

export const WithIcon: Story = {
  render: () => (
    <span className="avatar">
      <iconify-icon className="icon" icon={getRandomFilledIcon()}></iconify-icon>
    </span>
  ),
};

export const Sizes: Story = {
  render: () => (
    <>
      <img className="avatar" data-size="small" src="https://i.pravatar.cc/150?img=1" alt="Small Avatar" />
      <img className="avatar" src="https://i.pravatar.cc/150?img=2" alt="Medium Avatar" />
      <img className="avatar" data-size="large" src="https://i.pravatar.cc/150?img=4" alt="Large Avatar" />
    </>
  ),
};

export const AvatarGroup: Story = {
  render: () => (
    <div className="avatar-group">
      <img className="avatar" src="https://i.pravatar.cc/150?img=13" alt="First member" />
      <img className="avatar" src="https://i.pravatar.cc/150?img=16" alt="Second member" />
      <img className="avatar" src="https://i.pravatar.cc/150?img=17" alt="Third member" />
    </div>
  ),
};