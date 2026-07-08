import type { Meta, StoryObj } from '@storybook/react-vite'

import { SemanticZoomDemo } from '../../../demos/semantic-zoom'

const meta = {
	title: 'Actions/Evaluation/Semantic zoom',
	tags: ['!autodocs', 'activity-level:action', 'atomic:component', 'role:component', 'lifecycle:evaluation', 'mediation:individual'],
	parameters: {
		layout: 'fullscreen',
	},
} satisfies Meta

export default meta
type Story = StoryObj

export const Default: Story = {
	render: () => <SemanticZoomDemo height="100vh" />,
}
