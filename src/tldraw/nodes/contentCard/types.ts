import { T, TLBaseShape } from 'tldraw'

// Level of Detail types
export type LODLevel = 'A' | 'B' | 'C' | 'D'

export const LOD_THRESHOLDS = {
	A: 0.2,
	B: 0.5,
	C: 1.5,
} as const

export function getLODFromZoom(zoom: number): LODLevel {
	if (zoom < LOD_THRESHOLDS.A) return 'A'
	if (zoom < LOD_THRESHOLDS.B) return 'B'
	if (zoom < LOD_THRESHOLDS.C) return 'C'
	return 'D'
}

// Dimensions for each LOD level
export const CONTENT_CARD_DIMENSIONS = {
	A: { width: 24, height: 24 },
	B: { width: 120, height: 32 },
	C: { width: 235, height: 120 },
	D: { width: 400, height: 300 },
} as const

// ContentCard shape props
export interface ContentCardProps {
	title: string
	summary: string
	fullText: string
	color?: string
}

// ContentCard shape type
export type ContentCardShape = TLBaseShape<'contentCard', ContentCardProps>

// Validator for ContentCard props
export const contentCardPropsValidator = {
	title: T.string,
	summary: T.string,
	fullText: T.string,
	color: T.string.optional(),
}

// Port dimensions
export const CONTENT_CARD_PORT_RADIUS_PX = 6
