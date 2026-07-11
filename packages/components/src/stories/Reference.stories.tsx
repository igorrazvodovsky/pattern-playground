import type { Meta, StoryObj } from "@storybook/react-vite";
import { ReferenceDemo, BasicReferenceDemo } from "../demos/reference";

const meta = {
  title: "Primitives/Reference",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Reference: Story = {
  render: () => <ReferenceDemo />,
  parameters: {
    docs: {
      description: {
        story: 'Enhanced reference system with Quote Objects integration. Now includes quote objects as referenceable entities alongside users, projects, and documents. Type @ and try @reshaping, @habitats, @coral for quote objects, or @elena, @climate, @circular for traditional references. Demonstrates cross-document quote referencing capabilities.'
      }
    }
  }
};

export const Basic: Story = {
  render: () => <BasicReferenceDemo />,
  parameters: {
    docs: {
      description: {
        story: 'Single-category reference picker with sustainability meeting content. Shows existing user mentions from our sustainability team directory. Automatically skips category selection since there\'s only users. Type @ followed by a name to filter users directly.'
      }
    }
  }
};
