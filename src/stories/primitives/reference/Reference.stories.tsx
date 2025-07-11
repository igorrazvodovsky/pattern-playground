import type { Meta, StoryObj } from "@storybook/react-vite";
import { useCallback } from 'react';
import { ReferenceEditor } from '../../../components/reference-picker';
import { unifiedReferenceData } from './unifiedReferenceData';
import type { SelectedReference, ReferenceCategory } from '../../../components/reference-picker';
import basicReferenceData from './basicReferenceData.json' with { type: 'json' };

const meta = {
  title: "Primitives/Reference",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const ReferenceEditorExample = () => {
  const handleReferenceSelect = useCallback((reference: SelectedReference) => {
    console.log('Reference selected:', reference);
  }, []);

  return (
    <div className="layer">
      <ReferenceEditor
        data={unifiedReferenceData}
        onReferenceSelect={handleReferenceSelect}
        placeholder="Type @ to open hierarchical reference picker..."
        content="<p>This quarter, <span data-type='reference-mention' data-id='user-1' data-label='Sarah Chen' data-reference-type='user'>Sarah Chen</span> has been leading the <span data-type='reference-mention' data-id='project-1' data-label='Mobile App Redesign' data-reference-type='project'>Mobile App Redesign</span> project. She's been collaborating closely with <span data-type='reference-mention' data-id='user-2' data-label='Marcus Rodriguez' data-reference-type='user'>Marcus Rodriguez</span> on implementation details and <span data-type='reference-mention' data-id='user-3' data-label='Emily Watson' data-reference-type='user'>Emily Watson</span> for user research insights.</p><p>The team has been referencing the <span data-type='reference-mention' data-id='doc-1' data-label='Design System Guidelines' data-reference-type='document'>Design System Guidelines</span> and <span data-type='reference-mention' data-id='doc-3' data-label='User Research Report' data-reference-type='document'>User Research Report</span> to ensure consistency. Meanwhile, <span data-type='reference-mention' data-id='user-4' data-label='David Kim' data-reference-type='user'>David Kim</span> is working on the <span data-type='reference-mention' data-id='project-2' data-label='Performance Optimization' data-reference-type='project'>Performance Optimization</span> project, with <span data-type='reference-mention' data-id='doc-2' data-label='API Documentation' data-reference-type='document'>API Documentation</span> updates in progress.</p><p>Next week, we'll need to involve <span data-type='reference-mention' data-id='user-5' data-label='Alex Thompson' data-reference-type='user'>Alex Thompson</span> in reviewing the <span data-type='reference-mention' data-id='project-3' data-label='Dark Mode Implementation' data-reference-type='project'>Dark Mode Implementation</span> designs. Try typing @ here to add more references!</p>"
      />
    </div>
  );
};

export const Reference: Story = {
  render: () => <ReferenceEditorExample />,
  parameters: {
    docs: {
      description: {
        story: 'Complete hierarchical reference system with realistic team collaboration content. Shows existing references for users (Sarah, Marcus, Emily, David), projects (Mobile App Redesign, Performance Optimization), and documents (Design Guidelines, API Documentation). Type @ to add more references or try @sarah, @mobile, @api, @performance to see filtering across categories.'
      }
    }
  }
};

const BasicReferenceEditor = () => {
  const handleReferenceSelect = useCallback((reference: SelectedReference) => {
    console.log('User selected:', reference);
  }, []);

  return (
    <div className="layer">
      <ReferenceEditor
        data={basicReferenceData as ReferenceCategory[]}
        onReferenceSelect={handleReferenceSelect}
        placeholder="Type @ to mention a user..."
        content="<p>In today's standup, <span data-type='reference-mention' data-id='1' data-label='Alice' data-reference-type='user'>Alice</span> reported progress on the frontend components, while <span data-type='reference-mention' data-id='2' data-label='Bob' data-reference-type='user'>Bob</span> focused on the API integration. <span data-type='reference-mention' data-id='3' data-label='Charlie' data-reference-type='user'>Charlie</span> completed the user testing with <span data-type='reference-mention' data-id='4' data-label='David' data-reference-type='user'>David</span> providing design feedback.</p><p><span data-type='reference-mention' data-id='5' data-label='Eve' data-reference-type='user'>Eve</span> will be joining the team next week to help with the final sprint. Try typing @ here to mention more team members (alice, bob, charlie, david, eve)!</p>"
      />
    </div>
  );
};

export const Basic: Story = {
  render: () => <BasicReferenceEditor />,
  parameters: {
    docs: {
      description: {
        story: 'Single-category reference picker with realistic team standup content. Shows existing user mentions (Alice, Bob, Charlie, David, Eve) in a team collaboration context. Automatically skips category selection since there\'s only users. Type @ followed by a name to filter users directly.'
      }
    }
  }
};


