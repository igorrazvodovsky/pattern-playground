import type { Meta, StoryObj } from '@storybook/react-vite';
import '../jsx-types';

const Body = () => (
  <>
    <h2>Problem</h2>
    <p>
      A long page is read in parts. When an actor wants to point a colleague at one part, a link to
      the page leaves the colleague to find it.
    </p>
    <h3>Where the actor already looks</h3>
    <p>
      The heading names the part, so it is where the actor looks for a way to point at it. Hovering
      it shows a mark; following it puts the section's address in the location bar, ready to copy.
    </p>
    <h2>Solution</h2>
    <p>
      Make each heading a link to its own section. The heading still reads as a heading: it keeps
      its colour and has no underline.
    </p>
  </>
);

const meta = {
  title: 'Components/Heading anchors',
  tags: ['activity-level:operation', 'mediation:individual'],
  parameters: {
    docs: {
      description: {
        component:
          'An actor who wants to share or return to one part of a long page needs a link that lands on that part, and the heading that names it is where they look for one.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Wrap the content. Each `h2`–`h6` becomes a link to itself; the mark appears on hover and keyboard focus, and stays visible on devices without hover.',
      },
    },
  },
  render: () => (
    <pp-heading-anchors>
      <article className="flow">
        <Body />
      </article>
    </pp-heading-anchors>
  ),
};

export const Start: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`placement="start"` hangs the mark in the margin ahead of the heading, so the heading text stays aligned with the paragraphs. The content needs room in its inline-start margin.',
      },
    },
  },
  render: () => (
    <pp-heading-anchors placement="start">
      <article className="flow">
        <Body />
      </article>
    </pp-heading-anchors>
  ),
};

export const Scoped: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'When the content cannot be wrapped, place the element inside it and name the ancestor with `scope`. Here `levels="h2"` also leaves the `h3` alone.',
      },
    },
  },
  render: () => (
    <article className="flow">
      <pp-heading-anchors scope="article" levels="h2"></pp-heading-anchors>
      <Body />
    </article>
  ),
};

export const LeftAlone: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Headings a link cannot wrap are skipped: one that already holds a link, and the headings pp-sections turns into tab triggers. `data-anchor-ignore` opts out any other subtree.',
      },
    },
  },
  render: () => (
    <pp-heading-anchors>
      <article className="flow">
        <h2>
          Read <a href="https://www.patternlanguage.com/">A pattern language</a> first
        </h2>
        <p>The heading already holds a link, so it stays as written.</p>
        <pp-sections affordance="tab-bar">
          <h2>Overview</h2>
          <p>Section headings here are tab triggers.</p>
          <h2>Details</h2>
          <p>A link inside a tab would compete with it.</p>
        </pp-sections>
        <aside data-anchor-ignore>
          <h2>Aside</h2>
          <p>Opted out.</p>
        </aside>
      </article>
    </pp-heading-anchors>
  ),
};
