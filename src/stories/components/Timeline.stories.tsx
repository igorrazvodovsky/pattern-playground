import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Components/Timeline*",
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

export const Nested = {
  render: () => (
    <ol className="stepper" style={{ '--_circle-size': '0.5rem' } as React.CSSProperties}>
      <li className="stepper__item">
        <div className="stepper__content">
          <h4>Home visit</h4>
          <p>17 October 2025</p>
        </div>
      </li>
      <li className="stepper__item">
        <div className="stepper__content">
          <h4>Assessment</h4>
          <p>12 September 2025</p>
          <ol className="stepper muted" style={{ '--_circle-size': '0.25rem'} as React.CSSProperties}>
            <li className="stepper__item">
              <div className="stepper__content">
                <h5>10:03</h5>
                <p>Begin assessment.</p>
              </div>
            </li>
            <li className="stepper__item">
              <div className="stepper__content">
                <h5>10:15</h5>
                <p>Complete assessment.</p>
              </div>
            </li>
            <li className="stepper__item">
              <div className="stepper__content">
                <h5>10:30</h5>
                <p>Send assessment report.</p>
              </div>
            </li>
            <li className="stepper__item">
              <div className="stepper__content">
                <h5>10:45</h5>
                <p>Done.</p>
              </div>
            </li>
          </ol>
        </div>
      </li>
      <li className="stepper__item">
        <div className="stepper__content">
          <h4>Message sent</h4>
          <p>10 August 2025</p>
        </div>
      </li>
      <li className="stepper__item">
        <div className="stepper__content">
          <h4>Referred to us</h4>
          <p>8 August 2025</p>
        </div>
      </li>
    </ol>
  ),
} satisfies Story;