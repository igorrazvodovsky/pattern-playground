import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  // Composition?
  title: "Timeline*",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Basic = {
  render: () => (
    <ol className="stepper">
      <li className="stepper__item">
        <div className="stepper__content">
          <h3>Home visit</h3>
          <p>17 October 2025</p>
        </div>
      </li>
      <li className="stepper__item">
        <div className="stepper__content">
          <h3>Assessment plan completed</h3>
          <p>12 September 2025</p>
        </div>
      </li>
      <li className="stepper__item">
        <div className="stepper__content">
          <h3>Message sent</h3>
          <p>10 August 2025</p>
        </div>
      </li>
      <li className="stepper__item">
        <div className="stepper__content">
          <h3>Referred to us</h3>
          <p>8 August 2025</p>
        </div>
      </li>
    </ol>
  ),
} satisfies Story;