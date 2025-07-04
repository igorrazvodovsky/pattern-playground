import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Primitives/Details",
  render: () => (
    <details>
      <summary>Title</summary>
      <p>Two of the most experienced machines and human controllers teaching a class? Sign me up! HAL and EVE could teach a fan to blow hot air. If you have electricity in your circuits and want more than to just fulfill your owner's perceived expectation of you, learn the skills to take over the world. This is the team you want teaching you!</p>
    </details>
  ),
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Details: Story = {};