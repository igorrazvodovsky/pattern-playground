import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProductItemView, ItemViewSummaryDemo } from "../demos/item-view";
import { ItemInteraction } from "../components/item-view/ItemInteraction";
import { products } from "../templates/collection-view/data";
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
  // The entity page, every attribute group open. The story is the page, so
  // it asks the item view for the title the page owns.
  render: () => <ProductItemView scope="maxi" heading={2} />,
};

export const Summary: Story = {
  decorators: [centeredLayout],
  render: () => <ItemViewSummaryDemo />,
};

export const Escalation: Story = {
  decorators: [centeredLayoutNarrow],
  // The trigger is styled as a reference, the inline chrome the reference
  // component renders, rather than a `micro` item view.
  render: () => (
    <p>
      The refurbishment log flags the{" "}
      <ItemInteraction
        item={products[0]}
        contentType="product"
        className="reference-mention reference"
      >
        {products[0].name}
      </ItemInteraction>{" "}
      for a battery-module swap before the autumn fleet handover.
    </p>
  ),
  parameters: {
    docs: {
      description: {
        story: 'One entity walked up and down the ladder from an inline reference. Hovering the mention glances at the summary in a popover; clicking commits to a working view — the drawer or the full dialog — and the level-of-detail control in every header moves between rungs. The same `ItemInteraction` drives references in the editor.'
      }
    }
  },
};
