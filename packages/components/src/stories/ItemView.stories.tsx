import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ItemViewFullDemo,
  ItemViewSummaryDemo,
  ItemViewTransitionsDemo,
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

export const Escalation: Story = {
  decorators: [centeredLayoutNarrow],
  render: () => <ItemViewTransitionsDemo />,
  parameters: {
    docs: {
      description: {
        story: 'One entity walked up and down the ladder from an inline reference. Hovering the mention glances at the summary in a popover; clicking commits to a working view — the drawer or the full dialog — and the level-of-detail control in every header moves between rungs. The same `ItemInteraction` drives references in the editor.'
      }
    }
  },
};
