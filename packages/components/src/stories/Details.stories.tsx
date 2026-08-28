import type { Meta, StoryObj } from "@storybook/react-vite";

const body =
  "Two of the most experienced machines and human controllers teaching a class? Sign me up! HAL and EVE could teach a fan to blow hot air. If you have electricity in your circuits and want more than to just fulfill your owner's perceived expectation of you, learn the skills to take over the world. This is the team you want teaching you!";

const meta = {
  title: "Components/Details",
  tags: ['activity-level:operation', 'atomic:primitive', 'role:component', 'mediation:individual'],
  parameters: {
    docs: {
      description: {
        component:
          '`<details>`/`<summary>` disclosure widget for progressive reveal of supplementary content. A triangle marker states open or closed. It sits at the start of the summary by default; `.marker-end` moves it to the far end with the label pushed away from it, and `.marker-hanging` moves it out into the gutter, for a list where only some rows expand. Both go on the `<details>`, or on a wrapper around several.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Details: Story = {
  render: () => (
    <details>
      <summary>Title</summary>
      <p>{body}</p>
    </details>
  ),
};

/** The marker at the far inline end, the arrangement to use when the summary
 *  reads as a row header and its text should start where its neighbours' does. */
export const MarkerAtEnd: Story = {
  name: "Marker at end",
  render: () => (
    <details className="marker-end">
      <summary>Title</summary>
      <p>{body}</p>
    </details>
  ),
};

/** A summary can carry a count beside its label. The end marker takes the free
 *  space between itself and the label, so the badge stays with the text. */
export const WithBadge: Story = {
  name: "With a count",
  render: () => (
    // Each disclosure in its own wrapper: adjacent `details` siblings are the
    // stacked-accordion case, which would restyle both frames and confuse a
    // side-by-side comparison of the two marker positions.
    <div className="flow">
      <div>
        <details open>
          <summary>
            Attributes <span className="badge">4</span>
          </summary>
          <p>{body}</p>
        </details>
      </div>
      <div>
        <details className="marker-end" open>
          <summary>
            Attributes <span className="badge">4</span>
          </summary>
          <p>{body}</p>
        </details>
      </div>
    </div>
  ),
};

/** The marker hung outside the text column. In a list where only some rows
 *  expand, the rows that don't carry no marker at all, so an in-flow triangle
 *  would step its own row's text sideways from theirs. */
export const MarkerHanging: Story = {
  name: "Marker hanging",
  render: () => (
    <ol className="stepper">
      <li className="stepper__item">
        <div className="stepper__content">
          <details className="marker-hanging">
            <summary>An entry that expands into its own reasoning.</summary>
            <p>Why it happened, and what triggered it.</p>
          </details>
        </div>
      </li>
      <li className="stepper__item">
        <div className="stepper__content">
          <p>An entry that is only a record.</p>
        </div>
      </li>
      <li className="stepper__item">
        <div className="stepper__content">
          <p>Another entry that is only a record.</p>
        </div>
      </li>
    </ol>
  ),
};

/** A summary that runs to several lines keeps the marker on the first one. */
export const MultiLineSummary: Story = {
  name: "Multi-line summary",
  render: () => (
    <details>
      <summary>{body}</summary>
      <p>Contents.</p>
    </details>
  ),
};
