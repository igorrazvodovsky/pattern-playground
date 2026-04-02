import type { Meta, StoryObj } from "@storybook/react-vite";
import "../../jsx-types";

interface SpinnerArgs {
  size: 'small' | 'medium' | 'large';
}

const sizeMap: Record<SpinnerArgs['size'], string> = {
  small: '1rem',
  medium: '2rem',
  large: '4rem',
};

const meta = {
  title: "Operations/Spinner",
  tags: ['!autodocs', 'activity-level:operation', 'atomic:primitive', 'mediation:individual'],
  argTypes: {
    size: {
      control: { type: 'radio' },
      options: ['small', 'medium', 'large'] as SpinnerArgs['size'][],
      description: 'Spinner size — scales the SVG via font-size',
    },
  },
} satisfies Meta<SpinnerArgs>;

export default meta;
type Story = StoryObj<SpinnerArgs>;

export const Spinner: Story = {
  args: { size: 'medium' },
  render: ({ size }) => <pp-spinner style={{ fontSize: sizeMap[size] }}></pp-spinner>,
};