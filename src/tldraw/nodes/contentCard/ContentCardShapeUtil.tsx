import {
	Circle2d,
	Group2d,
	HTMLContainer,
	Rectangle2d,
	ShapeUtil,
	useEditor,
	useValue,
} from 'tldraw'
import {
	ContentCardProps,
	ContentCardShape,
	CONTENT_CARD_DIMENSIONS,
	CONTENT_CARD_PORT_RADIUS_PX,
	contentCardPropsValidator,
	getLODFromZoom,
	LODLevel,
} from './types'

interface ShapePort {
	id: string
	x: number
	y: number
	terminal: 'start' | 'end'
}

function getPortsForLOD(lod: LODLevel): { input: ShapePort; output: ShapePort } {
	const dimensions = CONTENT_CARD_DIMENSIONS[lod]
	const centerY = dimensions.height / 2

	return {
		input: {
			id: 'input',
			x: 0,
			y: centerY,
			terminal: 'end',
		},
		output: {
			id: 'output',
			x: dimensions.width,
			y: centerY,
			terminal: 'start',
		},
	}
}

export class ContentCardShapeUtil extends ShapeUtil<ContentCardShape> {
	static override type = 'contentCard' as const
	static override props = contentCardPropsValidator

	getDefaultProps(): ContentCardProps {
		return {
			title: 'Untitled',
			summary: 'Summary text goes here...',
			fullText: 'Full text content goes here...',
		}
	}

	override canEdit() {
		return false
	}

	override canResize() {
		return false
	}

	override hideResizeHandles() {
		return true
	}

	override hideRotateHandle() {
		return true
	}

	override hideSelectionBoundsBg() {
		return true
	}

	override hideSelectionBoundsFg() {
		return true
	}

	override isAspectRatioLocked() {
		return false
	}

	override getBoundsSnapGeometry(_shape: ContentCardShape) {
		return {
			points: [{ x: 0, y: 0 }],
		}
	}

	getGeometry(_shape: ContentCardShape) {
		const zoom = this.editor.getZoomLevel()
		const lod = getLODFromZoom(zoom)
		const dimensions = CONTENT_CARD_DIMENSIONS[lod]
		const ports = getPortsForLOD(lod)

		const portGeometries = Object.values(ports).map(
			(port) =>
				new Circle2d({
					x: port.x - CONTENT_CARD_PORT_RADIUS_PX,
					y: port.y - CONTENT_CARD_PORT_RADIUS_PX,
					radius: CONTENT_CARD_PORT_RADIUS_PX,
					isFilled: true,
					isLabel: true,
					excludeFromShapeBounds: true,
				})
		)

		// LOD A uses circular geometry
		if (lod === 'A') {
			const circleGeometry = new Circle2d({
				x: 0,
				y: 0,
				radius: dimensions.width / 2,
				isFilled: true,
			})

			return new Group2d({
				children: [circleGeometry, ...portGeometries],
			})
		}

		// LOD B-D use rectangular geometry
		const bodyGeometry = new Rectangle2d({
			width: dimensions.width,
			height: dimensions.height,
			isFilled: true,
		})

		return new Group2d({
			children: [bodyGeometry, ...portGeometries],
		})
	}

	component(shape: ContentCardShape) {
		return <ContentCardComponent shape={shape} />
	}

	getIndicatorPath(_shape: ContentCardShape): Path2D {
		const zoom = this.editor.getZoomLevel()
		const lod = getLODFromZoom(zoom)
		const dimensions = CONTENT_CARD_DIMENSIONS[lod]
		const ports = getPortsForLOD(lod)
		const path = new Path2D()

		if (lod === 'A') {
			const r = dimensions.width / 2
			const cx = r
			const cy = r
			path.moveTo(cx + r, cy)
			path.arc(cx, cy, r, 0, Math.PI * 2)
		} else {
			const borderRadius = lod === 'B' ? dimensions.height / 2 : 9
			path.roundRect(0, 0, dimensions.width, dimensions.height, borderRadius)
		}

		for (const port of Object.values(ports)) {
			path.moveTo(port.x + CONTENT_CARD_PORT_RADIUS_PX, port.y)
			path.arc(port.x, port.y, CONTENT_CARD_PORT_RADIUS_PX, 0, Math.PI * 2)
		}

		return path
	}
}

function ContentCardComponent({ shape }: { shape: ContentCardShape }) {
	const editor = useEditor()
	const lod = useValue('content-card-lod', () => getLODFromZoom(editor.getZoomLevel()), [editor])
	const { title, summary, fullText } = shape.props

	return (
		<HTMLContainer className="ContentCard" data-lod={lod}>
			{/* LOD A: Solid circle */}
			<div className="ContentCard-lod-a">
				<div className="ContentCard-circle" />
			</div>

			{/* LOD B: Pill/chip with title */}
			<div className="ContentCard-lod-b">
				<span className="ContentCard-chip">{title}</span>
			</div>

			{/* LOD C: Card with title and summary */}
			<div className="ContentCard-lod-c">
				<h3 className="ContentCard-title">{title}</h3>
				<p className="ContentCard-summary">{summary}</p>
			</div>

			{/* LOD D: Full reading panel */}
			<div className="ContentCard-lod-d">
				<h3 className="ContentCard-title">{title}</h3>
				<div className="ContentCard-fulltext">{fullText}</div>
			</div>
		</HTMLContainer>
	)
}
