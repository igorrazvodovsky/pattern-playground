import { Tldraw, TLComponents } from 'tldraw'

import { ContentCardShapeUtil } from '../tldraw/nodes/contentCard/ContentCardShapeUtil'

// Shared semantic-zoom demo: content cards on a canvas whose representation
// switches by discrete LOD threshold as the zoom level changes
// (circle → label chip → summary card → reading panel).
// Consumed by the semantic-zoom pattern page and SemanticZoom.stories.tsx.

const shapeUtils = [ContentCardShapeUtil]

const components: TLComponents = {
	Toolbar: () => null,
	MenuPanel: () => null,
}

const cards = [
	{
		x: 200,
		y: 200,
		title: 'Introduction',
		summary: 'An overview of semantic zoom and its applications in information visualisation.',
		fullText:
			'Semantic zoom is a technique where the visual representation of information changes based on the zoom level, rather than simply scaling the existing view. This allows for progressive disclosure of detail, showing high-level overviews when zoomed out and detailed content when zoomed in.',
	},
	{
		x: 500,
		y: 150,
		title: 'Level of Detail',
		summary: 'How different zoom levels reveal different amounts of information.',
		fullText:
			'Level of Detail (LOD) is a fundamental concept in semantic zoom. At low zoom levels (zoomed out), nodes appear as simple shapes or icons. At medium zoom levels, they show titles and brief summaries. At high zoom levels (zoomed in), full content becomes visible, allowing for detailed reading and interaction.',
	},
	{
		x: 500,
		y: 350,
		title: 'Transitions',
		summary: 'Smooth animated transitions help users maintain spatial context.',
		fullText:
			'Animated transitions between LOD states help users understand how the simplified and detailed views relate to each other. CSS transitions provide smooth morphing between circle, pill, card, and expanded reading panel states. This maintains spatial continuity and reduces cognitive load.',
	},
	{
		x: 800,
		y: 250,
		title: 'Applications',
		summary: 'Use cases include maps, knowledge graphs, and document navigation.',
		fullText:
			'Semantic zoom is widely used in mapping applications (e.g., showing countries, then cities, then streets), knowledge management tools (showing topic clusters, then subtopics, then individual notes), and document navigation (showing section headings, then paragraphs, then full text).',
	},
]

export function SemanticZoomDemo({ height = 480 }: { height?: number | string } = {}) {
	return (
		<div style={{ height, position: 'relative' }}>
			<Tldraw
				persistenceKey="semantic-zoom-demo"
				shapeUtils={shapeUtils}
				components={components}
				onMount={(editor) => {
					// Only create cards if none exist (avoid duplicating on hot reload)
					if (editor.getCurrentPageShapes().some((s) => s.type === 'contentCard')) {
						return
					}

					cards.forEach((card) => {
						editor.createShape({
							type: 'contentCard',
							x: card.x,
							y: card.y,
							props: {
								title: card.title,
								summary: card.summary,
								fullText: card.fullText,
							},
						})
					})

					// Zoom to fit all cards with some padding
					editor.zoomToFit()
				}}
			/>
		</div>
	)
}
