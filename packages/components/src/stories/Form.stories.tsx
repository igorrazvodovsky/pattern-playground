import type { Meta, StoryObj } from "@storybook/react-vite";
import { action } from 'storybook/actions';
import { FormDemo } from '../demos/form';

const meta = {
  title: "Components/Form",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <FormDemo onSubmit={action('submit')} />,
};

export const FieldsetComposite: Story = {
  render: () => (
    <fieldset className="flow">
      <legend>Date of birth</legend>
      <div className="flex">
        <pp-input className="field--w2"><input aria-label="Day" placeholder="DD" inputMode="numeric" /></pp-input>
        <pp-input className="field--w2"><input aria-label="Month" placeholder="MM" inputMode="numeric" /></pp-input>
        <pp-input className="field--w4"><input aria-label="Year" placeholder="YYYY" inputMode="numeric" /></pp-input>
      </div>
    </fieldset>
  ),
};
