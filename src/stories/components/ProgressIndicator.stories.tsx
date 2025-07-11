import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import '../../components/spinner/spinner.ts';
import { getRandomFilledIcon } from '../utils/icons';

const meta = {
  title: "Components/Progress indicator*",
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic = {
  render: () => (
    <ol className="stepper">
      <li className="stepper__item stepper__item--done">
        <i className="stepper__icon">
          <iconify-icon icon="ph:check-bold"></iconify-icon>
        </i>
        <div className="stepper__content">
          <h4>Step 1</h4>
          <small>This step is done.</small>
        </div>
      </li>
      <li className="stepper__item stepper__item--previous">
        <div className="stepper__content">
          <h4>Step 2</h4>
          <small>This step is previous (but not done).</small>
        </div>
      </li>
      <li className="stepper__item stepper__item--previous">
        <i className="stepper__icon">
          <iconify-icon icon="ph:number-three-bold" aria-hidden="true"></iconify-icon>
        </i>
        <div className="stepper__content">
          <h4>Step 3</h4>
          <small>This step is numbered.</small>
        </div>
      </li>
      <li className="stepper__item stepper__item--previous">
        <i className="stepper__icon">
          <iconify-icon icon={getRandomFilledIcon()} aria-hidden="true"></iconify-icon>
        </i>
        <div className="stepper__content">
          <h4>Step 4</h4>
          <small>This step has a random icon.</small>
        </div>
      </li>
      <li className="stepper__item stepper__item--current" aria-current="step">
        <i className="stepper__icon">
          <iconify-icon icon="ph:circle-fill" aria-hidden="true"></iconify-icon>
        </i>
        <div className="stepper__content">
          <h4>Step 5</h4>
          <small>This step is current.</small>
        </div>
      </li>
      <li className="stepper__item stepper__item--running" aria-current="step">
         <i className="stepper__icon">
           <pp-spinner aria-label="Step in progress"></pp-spinner>
         </i>
         <div className="stepper__content">
           <h4>Step 6</h4>
           <small>This step is current <i>and</i> running 😱</small>
         </div>
      </li>
      <li className="stepper__item stepper__item--danger">
        <i className="stepper__icon">
          <iconify-icon icon="ph:exclamation-mark-bold"></iconify-icon>
        </i>
        <div className="stepper__content">
          <h4>Step 7</h4>
          <small>Something is wrong.</small>
        </div>
      </li>
      <li className="stepper__item stepper__item--next">
        <div className="stepper__content muted">
          <h4>Step 8</h4>
          <small>This step is next.</small>
        </div>
      </li>
    </ol>
  ),
} satisfies Story;
