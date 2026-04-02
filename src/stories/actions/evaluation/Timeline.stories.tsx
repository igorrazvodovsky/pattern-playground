import type { Meta, StoryObj } from "@storybook/react-vite";
import { faker } from '@faker-js/faker';

interface TimelineArgs {
  count: number;
  density: 'normal' | 'compact';
}

const densityVars: Record<TimelineArgs['density'], React.CSSProperties> = {
  normal: {},
  compact: { '--_circle-size': '0.75rem', '--_item-spacing': '0.25rem' } as React.CSSProperties,
};

const meta = {
  title: "Actions/Evaluation/Timeline",
  argTypes: {
    count: {
      control: { type: 'range', min: 2, max: 10, step: 1 },
      description: 'Number of timeline items',
    },
    density: {
      control: { type: 'radio' },
      options: ['normal', 'compact'] as TimelineArgs['density'][],
      description: 'Visual density of the timeline',
    },
  },
} satisfies Meta<TimelineArgs>;

export default meta;
type Story = StoryObj<TimelineArgs>;

export const Basic: Story = {
  args: { count: 4, density: 'normal' },
  render: ({ count, density }) => {
    const items = Array.from({ length: count }, () => ({
      title: `${faker.hacker.verb()} ${faker.hacker.noun()}`,
      date: faker.date.recent({ days: 365 }).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    }));
    return (
      <ol className="stepper" style={densityVars[density]}>
        {items.map((item, i) => (
          <li key={i} className="stepper__item">
            <div className="stepper__content">
              <h3>{item.title}</h3>
              <p>{item.date}</p>
            </div>
          </li>
        ))}
      </ol>
    );
  },
};

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
