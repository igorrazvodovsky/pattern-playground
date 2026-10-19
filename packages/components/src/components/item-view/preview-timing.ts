// How a reference's preview follows the pointer and focus. It opens after a
// short pause, so that a pointer crossing the text does not open every
// reference it passes, and it closes after a short grace, so that the pointer
// can cross the gap from the reference into the preview and use the controls
// there. ItemInteraction uses it, and so does every registry of the catalog.
export const previewTiming = { open: 350, close: 150 } as const;
