import type { Meta, StoryObj } from "@storybook/react-vite";
import { action } from 'storybook/actions';
import { expect, userEvent, within } from 'storybook/test';

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
    const [optionA, optionB] = canvas.getAllByRole('radio') as HTMLInputElement[];
    await userEvent.click(optionB);
    expect(optionB).toBeChecked();
    expect(optionA).not.toBeChecked();
  },
};

/**
 * A radio group is one tab stop, not three: Tab lands on the current choice
 * and arrow keys move between the alternatives, selecting as they go. That is
 * the platform's behaviour for same-named radios, and it is why a group of
 * choices should be radios rather than a row of buttons — the actor gets past
 * it in one key when they don't want to change anything.
 */
export const KeyboardOperation: Story = {
  name: 'Keyboard operation',
  render: () => (
    <fieldset className="flow">
      <legend>Choose an option</legend>
      <label className="form-control">
        <input type="radio" name="keyboard-operation" defaultChecked />
        Option A
      </label>
      <label className="form-control">
        <input type="radio" name="keyboard-operation" />
        Option B
      </label>
      <label className="form-control">
        <input type="radio" name="keyboard-operation" />
        Option C
      </label>
    </fieldset>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [optionA, optionB, optionC] = canvas.getAllByRole('radio') as HTMLInputElement[];

    await userEvent.tab();
    expect(optionA).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    expect(optionB).toHaveFocus();
    expect(optionB).toBeChecked();
    expect(optionA).not.toBeChecked();

    // The walk wraps, so no option is out of reach in either direction.
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    expect(optionC).toHaveFocus();
    expect(optionC).toBeChecked();

    // One more Tab leaves the whole group, not just this option.
    await userEvent.tab();
    expect(optionC).not.toHaveFocus();
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
