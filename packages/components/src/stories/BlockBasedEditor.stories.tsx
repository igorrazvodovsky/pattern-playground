import type { Meta, StoryObj } from "@storybook/react-vite";
import { BlockBasedEditorDemo } from '../demos/block-based-editor';

const meta = {
  title: "Components/Block-based editor",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  render: () => <BlockBasedEditorDemo />,
};
