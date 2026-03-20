import type { Meta, StoryObj } from '@storybook/react-vite';
import { DynamicHyperlinksDemo } from './DynamicHyperlinksDemo';

const meta = {
  title: 'Actions/Seeking/Dynamic hyperlinks',
  component: DynamicHyperlinksDemo,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof DynamicHyperlinksDemo>;

export default meta;
type Story = StoryObj<typeof DynamicHyperlinksDemo>;

export const Heatmap: Story = {};
