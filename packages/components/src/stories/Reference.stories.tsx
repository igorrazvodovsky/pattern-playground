import type { Meta, StoryObj } from "@storybook/react-vite";
import { ReferenceDemo, BasicReferenceDemo } from "../demos/reference";

const meta = {
  title: "Components/Reference",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Reference: Story = {
  render: () => <ReferenceDemo />,
  parameters: {
    docs: {
      description: {
        story: 'Inline @mentions across users, documents, projects, quotes and products. Hovering a mention glances at its summary; clicking opens a working view.'
      }
    }
  }
};

export const Basic: Story = {
  render: () => <BasicReferenceDemo />,
  parameters: {
    docs: {
      description: {
        story: 'Single-category picker: only users are referenceable, so the category step is skipped. Type @ followed by a name to filter directly.'
      }
    }
  }
};
