import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ItemViewFullDemo,
  ItemViewSummaryDemo,
  ItemViewReferenceDemo,
} from "../demos/item-view";
import { centeredLayout, centeredLayoutNarrow } from "./utils/decorators";

const meta = {
  title: "Templates/Item view",
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const FullView: Story = {
  render: () => <ItemViewFullDemo />,
};

export const Summary: Story = {
  decorators: [centeredLayout],
  render: () => <ItemViewSummaryDemo />,
};

export const Reference: Story = {
  decorators: [centeredLayoutNarrow],
  render: () => <ItemViewReferenceDemo />,
};
