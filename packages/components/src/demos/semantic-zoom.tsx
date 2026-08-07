import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Tldraw, TLComponents } from 'tldraw'
import 'iconify-icon'
import { lifecycleEvents, users, type User } from '@shared/data'
import { formatDate, formatDateTime } from '@shared/format'

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

// Population-rung zoom over a directory of people: one scale control moves
// every person one rung at a time by widening the field subset each shows —
// the records→attribute-subset material. The avatar is the single field the
// glyph rung keeps, because a face still identifies a person where a product's
// category icon would collapse the whole population to near-duplicates. The
// host <Demo resizable> supplies the drag handle, but only the Auto rung reads
// it: Auto binds the ladder to container width (the semantic-resize variant),
// while each manual rung pins itself and ignores the drag.

const PERSON_RUNGS = [
	{ rung: 'glyph', fields: ['avatar'] },
	{ rung: 'summary', fields: ['avatar', 'name', 'role'] },
	{ rung: 'detail', fields: ['avatar', 'name', 'role', 'email', 'timezone', 'lastActive'] },
] as const

type PersonField = (typeof PERSON_RUNGS)[number]['fields'][number]

function lastActive(iso: string): string {
	return formatDateTime(iso, {
		day: 'numeric',
		month: 'short',
		hour: 'numeric',
		minute: 'numeric',
	})
}

function PersonCard({ user, fields }: { user: User; fields: readonly PersonField[] }) {
	const meta = user.metadata
	const has = (field: PersonField) => fields.includes(field)
	const rows: Array<[string, string]> = []
	if (has('email')) rows.push(['Email', meta.email])
	if (has('timezone')) rows.push(['Timezone', meta.timezone])
	if (has('lastActive')) rows.push(['Last active', lastActive(meta.lastActiveAt)])

	return (
		<article className="card person-card layer">
			<div className={`person-card__header${rows.length > 0 ? ' layer' : ''}`}>
				{has('avatar') && (
					<img className="avatar" src={meta.photoUrl} alt={user.name} />
				)}
				{(has('name') || has('role')) && (
					<div className="person-card__id">
						{has('name') && <h4 className="label">{user.name}</h4>}
						{has('role') && <p className="description">{meta.role}</p>}
					</div>
				)}
			</div>
			{rows.length > 0 && (
				<dl className="description-list pad">
					{rows.map(([label, value]) => (
						<Fragment key={label}>
							<dt>{label}</dt>
							<dd>{value}</dd>
						</Fragment>
					))}
				</dl>
			)}
		</article>
	)
}

export function PopulationRungDemo() {
	// 'zoom' pins the rung to a manual radio; 'auto' hands it to container width.
	const [mode, setMode] = useState<'zoom' | 'auto'>('zoom')
	const [level, setLevel] = useState(1)
	const rootRef = useRef<HTMLDivElement>(null)
	const groupRef = useRef<HTMLDivElement>(null)
	const [visibleAvatars, setVisibleAvatars] = useState(users.length)

	// Only Auto reacts to the drag. The demo root sits inside the resizable `demo`
	// container (see <Demo resizable>), so its own width tracks the handle.
	useEffect(() => {
		if (mode !== 'auto') return
		const element = rootRef.current
		if (!element) return
		const observer = new ResizeObserver((entries) => {
			const width = entries[0].contentRect.width
			setLevel(width < 380 ? 0 : width < 620 ? 1 : 2)
		})
		observer.observe(element)
		return () => observer.disconnect()
	}, [mode])

	// The avatar-group must never wrap — its overlap makes the browser pack more
	// per row than visually fit, so a wrapped row clips at the container edge.
	// Instead we fit as many faces as the width holds on one line and let a
	// "+N" chip stand for the rest; on a wide host all of them show.
	useEffect(() => {
		if (level !== 0) return
		const element = groupRef.current
		if (!element) return
		// One avatar is AVATAR wide; each subsequent one advances by ADVANCE
		// (its width minus the group's negative margin). Matches size="medium".
		const AVATAR = 52
		const ADVANCE = 32
		const measure = () => {
			const width = element.clientWidth
			const fit = Math.max(1, Math.floor((width - AVATAR) / ADVANCE) + 1)
			// If everyone fits, show everyone; otherwise keep one slot for the chip.
			setVisibleAvatars(fit >= users.length ? users.length : Math.max(1, fit - 1))
		}
		measure()
		const observer = new ResizeObserver(measure)
		observer.observe(element)
		return () => observer.disconnect()
	}, [level])

	const { fields } = PERSON_RUNGS[level]

	// The glyph rung is a genuinely different structure, not an undressed card:
	// the avatar-group's overlap needs the avatars to be direct siblings, so the
	// population collapses to a stack of bare faces. Summary and detail keep the
	// cards.
	const overflow = users.length - visibleAvatars
	const population =
		level === 0 ? (
			<div className="avatar-group" ref={groupRef}>
				{users.slice(0, visibleAvatars).map((user) => (
					<img key={user.id} className="avatar" src={user.metadata.photoUrl} alt={user.name} />
				))}
				{overflow > 0 && (
					<span className="avatar avatar-group__more" title={`${overflow} more`}>
						+{overflow}
					</span>
				)}
			</div>
		) : (
			<ul className="cards layout-grid">
				{users.map((user) => (
					<li key={user.id}>
						<PersonCard user={user} fields={fields} />
					</li>
				))}
			</ul>
		)

	return (
		<div className="flow" ref={rootRef}>
			<div className="toolbar">
				<div className="flex" role="radiogroup" aria-label="Scale">
					{PERSON_RUNGS.map((rungLevel, index) => (
						<label key={rungLevel.rung} className="form-control">
							<input
								type="radio"
								name="population-rung"
								checked={mode === 'zoom' && level === index}
								onChange={() => {
									setMode('zoom')
									setLevel(index)
								}}
							/>
							{rungLevel.rung[0].toUpperCase() + rungLevel.rung.slice(1)}
						</label>
					))}
					{/* Auto hands the rung to container width — drag the demo's edge to drive it. */}
					<label className="form-control">
						<input
							type="radio"
							name="population-rung"
							checked={mode === 'auto'}
							onChange={() => setMode('auto')}
						/>
						Auto
					</label>
				</div>
			</div>

			{population}
		</div>
	)
}

// Semantic zoom over a sequence: one scale control moves the whole lifecycle
// timeline through the same rung at once — stage totals (zoomed out) → each
// flow as a dated chip → the flow in full — the LCA's authored `stage` field
// supplying the coarse rungs. The uniform, one-level-at-a-time sibling of
// focus-and-context's fisheye over the same lifecycleEvents data: here every
// event sits at one level together, where the fisheye grades detail by the
// pointer. Consumed by the semantic-zoom pattern page and its story.

interface LifecycleEvent {
	id: string
	date: string
	stage: string
	description: string
	co2e: number
	site: string
}

const TIMELINE_RUNGS = ['Stages', 'Flows', 'Detail'] as const

// One icon per lifecycle stage, so the coarsest rung reads as a sequence of
// recognisable phases rather than a list of labels.
const STAGE_ICONS: Record<string, string> = {
	Materials: 'ph:cube',
	Manufacture: 'ph:factory',
	Distribution: 'ph:truck',
	Use: 'ph:hand',
	Maintenance: 'ph:wrench',
	Recovery: 'ph:recycle',
	'End of life': 'ph:trash',
}

function formatCo2e(value: number): string {
	const rounded = Math.round(value * 10) / 10
	const sign = rounded > 0 ? '+' : rounded < 0 ? '−' : ''
	return `${sign}${Math.abs(rounded).toFixed(1)} kg`
}

function shortDate(date: string): string {
	return formatDate(date, { year: 'numeric', month: 'short' })
}

export function SemanticZoomTimelineDemo() {
	const [level, setLevel] = useState(0)

	const stages = useMemo(() => {
		const order: string[] = []
		const byStage = new Map<string, LifecycleEvent[]>()
		for (const event of lifecycleEvents as LifecycleEvent[]) {
			if (!byStage.has(event.stage)) {
				byStage.set(event.stage, [])
				order.push(event.stage)
			}
			byStage.get(event.stage)!.push(event)
		}
		return order.map((name) => {
			const events = byStage.get(name)!
			return { name, events, total: events.reduce((sum, event) => sum + event.co2e, 0) }
		})
	}, [])

	return (
		<div className="flow">
			<div className="toolbar">
				<div className="flex" role="radiogroup" aria-label="Zoom">
					{TIMELINE_RUNGS.map((rung, index) => (
						<label key={rung} className="form-control">
							<input
								type="radio"
								name="zoom-timeline-rung"
								value={index}
								checked={level === index}
								onChange={() => setLevel(index)}
							/>
							{rung}
						</label>
					))}
				</div>
				<code className="muted">every flow at once</code>
			</div>

			<ol className="stepper zoom-timeline">
				{stages.map((stage) => (
					<li key={stage.name} className="stepper__item">
						{STAGE_ICONS[stage.name] && (
							<i className="stepper__icon">
								<iconify-icon icon={STAGE_ICONS[stage.name]} aria-hidden="true"></iconify-icon>
							</i>
						)}
						<div className="stepper__content">
							<div className="zoom-timeline__row">
								<h4>{stage.name}</h4>
								<span className="zoom-timeline__co2e" data-sign={stage.total < 0 ? 'neg' : 'pos'}>
									{formatCo2e(stage.total)}
								</span>
							</div>

							{level >= 1 && (
								<ol className="stepper muted">
									{stage.events.map((event) => (
										<li key={event.id} className="stepper__item">
											<div className="stepper__content zoom-timeline__event">
												<p className="zoom-timeline__event-label">
													<span className="zoom-timeline__date">{shortDate(event.date)}</span>
													{level >= 2 && (
														<>
															{' · '}
															{event.description} ·{' '}
															<span className="muted">{event.site}</span>
														</>
													)}
												</p>
												<span
													className="zoom-timeline__co2e"
													data-sign={event.co2e < 0 ? 'neg' : 'pos'}
												>
													{formatCo2e(event.co2e)}
												</span>
											</div>
										</li>
									))}
								</ol>
							)}
						</div>
					</li>
				))}
			</ol>
		</div>
	)
}
