import type { Meta, StoryObj } from "@storybook/react-vite";
import { action } from 'storybook/actions';
import { userEvent, within } from '@storybook/testing-library';

interface RadioButtonArgs {
  label: string;
  checked: boolean;
  disabled: boolean;
}

function RadioButtonStory({ label, checked, disabled }: RadioButtonArgs) {
  return (
    <div className="flow">
      <label className="form-control">
        <input
          type="radio"
          name="radio-button-story"
          defaultChecked={checked}
          disabled={disabled}
          onChange={action('change')}
        />
        {label}
      </label>
      <label className="form-control">
        <input type="radio" name="radio-button-story" defaultChecked={!checked} />
        Another option
      </label>
      <label className="form-control">
        <input type="radio" name="radio-button-story" />
        A third option
      </label>
    </div>
  );
}

const meta = {
  title: "Components/Radio button",
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Radio button label',
    },
    checked: {
      control: { type: 'boolean' },
      description: 'Checked state',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disabled state',
    },
  },
} satisfies Meta<RadioButtonArgs>;

export default meta;
type Story = StoryObj<RadioButtonArgs>;

export const RadioButton: Story = {
  args: {
    label: 'Radio button',
    checked: false,
    disabled: false,
  },
  render: (args) => <RadioButtonStory key={String(args.checked)} {...args} />,
};

export const SelectInteraction: Story = {
  render: () => (
    <div className="flow">
      <label className="form-control">
        <input type="radio" name="select-interaction" defaultChecked />
        Option A
      </label>
      <label className="form-control">
        <input type="radio" name="select-interaction" />
        Option B
      </label>
      <label className="form-control">
        <input type="radio" name="select-interaction" />
        Option C
      </label>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [, optionB] = canvas.getAllByRole('radio') as HTMLInputElement[];
    await userEvent.click(optionB);
  },
};

export const Group: Story = {
  render: () => (
    <fieldset className="flow">
      <legend>Choose an option</legend>
      <label className="form-control">
        <input type="radio" name="group" defaultChecked />
        Option A
      </label>
      <label className="form-control">
        <input type="radio" name="group" />
        Option B
      </label>
      <label className="form-control">
        <input type="radio" name="group" />
        Option C
      </label>
    </fieldset>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flow">
      <label className="form-control">
        <input type="radio" name="states-unselected" />
        Unselected
      </label>
      <label className="form-control">
        <input type="radio" name="states-selected" defaultChecked />
        Selected
      </label>
      <label className="form-control">
        <input type="radio" name="states-disabled" disabled />
        Disabled
      </label>
      <label className="form-control">
        <input type="radio" name="states-disabled-selected" defaultChecked disabled />
        Selected disabled
      </label>
    </div>
  ),
};
