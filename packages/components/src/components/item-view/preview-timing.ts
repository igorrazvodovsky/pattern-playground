// The open delay keeps a pointer crossing the text from opening every reference
// it passes; the close grace lets it cross the gap into the preview.
export const previewTiming = { open: 350, close: 150 } as const;
