import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Operations/Sections",
  tags: ["autodocs", "activity-level:operation", "atomic:component", "mediation:individual"],
  parameters: {
    docs: {
      description: {
        component: [
          'Content often divides into a small, stable set of named parts — overview, details, references.',
          'How those parts are presented depends on context: horizontal tabs when space allows, collapsible regions when it doesn\'t.',
          'Sections bridges these two affordances, adapting presentation to conditions without restructuring the content.',
          'The switch can be driven entirely from CSS, making the transition between layouts invisible to both author and reader.',
        ].join('\n'),
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const TabBar: Story = {
  render: () => (
    <pp-sections affordance="tab-bar">
      <h2>Overview</h2>
      <p>The overview gives a high-level summary of the subject. It sets expectations and helps the reader decide whether to continue into the detail sections below.</p>
      <h2>Details</h2>
      <p>Details go deeper into the mechanics. Here you would find specifications, constraints, and the nuanced decisions that shape implementation.</p>
      <h2>References</h2>
      <p>References list the source material, prior art, and external standards that informed the design. Cite liberally; attribution is free.</p>
    </pp-sections>
  ),
};

export const Details: Story = {
  render: () => (
    <pp-sections affordance="details">
      <h2>Overview</h2>
      <p>The overview gives a high-level summary of the subject. It sets expectations and helps the reader decide whether to continue into the detail sections below.</p>
      <h2>Details</h2>
      <p>Details go deeper into the mechanics. Here you would find specifications, constraints, and the nuanced decisions that shape implementation.</p>
      <h2>References</h2>
      <p>References list the source material, prior art, and external standards that informed the design. Cite liberally; attribution is free.</p>
    </pp-sections>
  ),
};

export const Responsive: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Same markup, affordance switched purely by CSS. Resize the viewport below ~800 px to see the layout change from `tab-bar` to `details`.',
      },
    },
  },
  render: () => (
    <>
      <style>{`
        .responsive-demo {
          --pp-affordance: details;
        }
        @media (min-width: 50em) {
          .responsive-demo {
            --pp-affordance: tab-bar;
          }
        }
      `}</style>
      <div className="responsive-demo">
        <pp-sections>
          <h2>Overview</h2>
          <p>The overview gives a high-level summary of the subject. It sets expectations and helps the reader decide whether to continue into the detail sections below.</p>
          <h2>Details</h2>
          <p>Details go deeper into the mechanics. Here you would find specifications, constraints, and the nuanced decisions that shape implementation.</p>
          <h2>References</h2>
          <p>References list the source material, prior art, and external standards that informed the design. Cite liberally; attribution is free.</p>
        </pp-sections>
      </div>
    </>
  ),
};

export const WithPpH: Story = {
  name: 'With pp-h shim',
  parameters: {
    docs: {
      description: {
        story: '`pp-h` renders as a heading-shaped block without contributing to the document outline — useful when `h2` would create unwanted hierarchy.',
      },
    },
  },
  render: () => (
    <pp-sections affordance="tab-bar">
      <pp-h>Overview</pp-h>
      <p>The overview gives a high-level summary of the subject. It sets expectations and helps the reader decide whether to continue into the detail sections below.</p>
      <pp-h>Details</pp-h>
      <p>Details go deeper into the mechanics. Here you would find specifications, constraints, and the nuanced decisions that shape implementation.</p>
      <pp-h>References</pp-h>
      <p>References list the source material, prior art, and external standards that informed the design. Cite liberally; attribution is free.</p>
    </pp-sections>
  ),
};
