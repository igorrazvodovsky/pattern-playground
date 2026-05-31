import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  PromptBasicDemo,
  PromptQualityFeedbackDemo,
  PromptWithMaterialReferencesDemo,
  PromptTemplateDemo,
} from '../../demos/prompt';

const meta = {
  title: "Activities/Prompt",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  render: () => <PromptBasicDemo />,
};

export const QualityFeedback: Story = {
  render: () => <PromptQualityFeedbackDemo />,
};

export const WithMaterialReferences: Story = {
  render: () => <PromptWithMaterialReferencesDemo />,
};

export const PromptTemplate: Story = {
  render: () => <PromptTemplateDemo />,
};
