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
        <pp-input className="field--w2" label="Day" placeholder="DD" inputmode="numeric"></pp-input>
        <pp-input className="field--w2" label="Month" placeholder="MM" inputmode="numeric"></pp-input>
        <pp-input className="field--w4" label="Year" placeholder="YYYY" inputmode="numeric"></pp-input>
      </div>
    </fieldset>
  ),
};
