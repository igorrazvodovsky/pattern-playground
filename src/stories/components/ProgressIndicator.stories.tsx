import type { Meta, StoryObj } from "@storybook/react";
import '../../components/spinner/spinner.ts';

const meta = {
  title: "Components/Progress indicator*",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Basic = {
  render: () => (
    <ol className="stepper">
      <li className="stepper__item stepper__item--done">
        <i className="stepper__icon">
          <iconify-icon icon="ph:check-bold"></iconify-icon>
        </i>
        <div className="stepper__content">
          <h3>Step 1</h3>
          <p>This one is done</p>
        </div>
      </li>
      <li className="stepper__item stepper__item--current" aria-current="step">
        <i className="stepper__icon">
          <iconify-icon icon="ph:circle-half-fill" aria-hidden="true"></iconify-icon>
        </i>
        <div className="stepper__content">
          <h3>Step 2</h3>
          <p>This one is current</p>
        </div>
      </li>
      <li className="stepper__item stepper__item--running" aria-current="step">
         <i className="stepper__icon">
           <pp-spinner aria-label="Step in progress"></pp-spinner>
         </i>
         <div className="stepper__content">
           <h3>Step 2</h3>
           <p>This one is current <i>and</i> running 😱</p>
         </div>
       </li>
      <li className="stepper__item stepper__item--next">
        <div className="stepper__content muted">
          <h3>Step 3</h3>
          <p>This one is next</p>
        </div>
      </li>
    </ol>
  ),
} satisfies Story;