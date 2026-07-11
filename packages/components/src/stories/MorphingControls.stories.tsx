import type { Meta, StoryObj } from "@storybook/react-vite";
import { FollowUnfollowDemo, MultiStateCloseDemo } from "../demos/morphing-controls";

const meta = {
  title: "Components/Morphing controls",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const FollowUnfollow: Story = {
  render: () => <FollowUnfollowDemo />,
};

export const MultiStateClose: Story = {
  render: () => <MultiStateCloseDemo />,
};
