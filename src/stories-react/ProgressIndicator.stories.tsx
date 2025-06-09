import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Progress indicator",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Basic = {
  render: () => (
    <ol className="stepper">
      <li className="stepper__item">
        <div className="stepper__content">
          <h3>Step 1</h3>
          <p>Do this first</p>
        </div>
      </li>
      <li className="stepper__item">
        <div className="stepper__content">
          <h3>Step 2</h3>
          <p>Then this</p>
        </div>
      </li>
      <li className="stepper__item">
        <div className="stepper__content">
          <h3>Step 3</h3>
          <p>Review and submit</p>
        </div>
      </li>
    </ol>
  ),
} satisfies Story;