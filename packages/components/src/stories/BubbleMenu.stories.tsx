import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  BasicDemo,
  TextLensDemo,
  CommentingDemo,
  DynamicExplanationDemo,
} from '../demos/bubble-menu';

const meta = {
  title: "Components/Bubble menu",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  render: () => <BasicDemo />,
};

export const TextLense: Story = {
  render: () => <TextLensDemo />,
};

export const Commenting: Story = {
  render: () => <CommentingDemo />,
};

export const DynamicExplanation: Story = {
  render: () => <DynamicExplanationDemo />,
};
