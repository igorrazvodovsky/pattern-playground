import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	DefaultActionsMenu,
	DefaultQuickActions,
	DefaultStylePanel,
	TLComponents,
	Tldraw,
	TldrawOptions,
	TldrawUiToolbar,
	useEditor,
	useValue,
} from 'tldraw'

import { OnCanvasComponentPicker } from '../../../tldraw/components/OnCanvasComponentPicker.tsx'
import { WorkflowRegions } from '../../../tldraw/components/WorkflowRegions.tsx'
import { overrides, WorkflowToolbar } from '../../../tldraw/components/WorkflowToolbar.tsx'
import { ConnectionBindingUtil } from '../../../tldraw/connection/ConnectionBindingUtil'
import { ConnectionShapeUtil } from '../../../tldraw/connection/ConnectionShapeUtil'
import { keepConnectionsAtBottom } from '../../../tldraw/connection/keepConnectionsAtBottom'
import { disableTransparency } from '../../../tldraw/disableTransparency.tsx'
import { NodeShapeUtil } from '../../../tldraw/nodes/NodeShapeUtil'
import { PointingPort } from '../../../tldraw/ports/PointingPort'

// Define custom shape utilities that extend tldraw's shape system
const shapeUtils = [NodeShapeUtil, ConnectionShapeUtil]
// Define binding utilities that handle relationships between shapes
const bindingUtils = [ConnectionBindingUtil]

// Customize tldraw's UI components to add workflow-specific functionality
const components: TLComponents = {
	InFrontOfTheCanvas: () => (
		<>
			<OnCanvasComponentPicker />
			{/* <WorkflowRegions /> */}
		</>
	),
	Toolbar: () => (
		<>
			<WorkflowToolbar />
			<div className="tlui-main-toolbar tlui-main-toolbar--horizontal">
				<TldrawUiToolbar className="tlui-main-toolbar__tools" label="Actions">
					<DefaultQuickActions />
					<DefaultActionsMenu />
				</TldrawUiToolbar>
			</div>
		</>
	),

	MenuPanel: () => null,
	StylePanel: () => {
		const editor = useEditor()
		const shouldShowStylePanel = useValue(
			'shouldShowStylePanel',
			() => {
				return (
					!editor.isIn('select') ||
					editor.getSelectedShapes().some((s) => s.type !== 'node' && s.type !== 'connection')
				)
			},
			[editor]
		)
		if (!shouldShowStylePanel) return
		return <DefaultStylePanel />
	},
}

const options: Partial<TldrawOptions> = {
	actionShortcutsLocation: 'menu',
	maxPages: 1,
}

function DefaultWorkflow() {
	return (
		<div style={{ position: 'fixed', inset: 0 }}>
			<Tldraw
				licenseKey="tldraw-2030-10-02/WyJhU2o4TlRIdCIsWyIqLnBhdHRlcm4tcGxheWdyb3VuZC5vbnJlbmRlci5jb20iXSw5LCIyMDMwLTEwLTAyIl0.jPYfftBSCICOdDXZwxj+tWGLQgbITA9SJ0tHGUGBYmo8oJT8ZaY1j+8vkkzLbWx8KNs6EnjZJMnNlCqads8xVA"
				persistenceKey="workflow"
				options={options}
				overrides={overrides}
				shapeUtils={shapeUtils}
				bindingUtils={bindingUtils}
				components={components}
				onMount={(editor) => {
					;(window as any).editor = editor
					if (!editor.getCurrentPageShapes().some((s) => s.type === 'node')) {
						editor.createShape({ type: 'node', x: 200, y: 200 })
					}

					editor.user.updateUserPreferences({ isSnapMode: true })

					// Add our custom pointing port tool to the select tool's state machine
					// This allows users to create connections by pointing at ports
					editor.getStateDescendant('select')!.addChild(PointingPort)

					// Ensure connections always stay at the bottom of the shape stack
					// This prevents them from covering other shapes
					keepConnectionsAtBottom(editor)

					// Disable transparency for workflow shapes
					disableTransparency(editor, ['node', 'connection'])
				}}
			/>
		</div>
	)
}

const meta = {
  title: "Compositions/Workflow",
	tags: ['!autodocs'],

} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {},
  render: () => <DefaultWorkflow />,
};