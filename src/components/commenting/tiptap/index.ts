// TipTap editor integration exports

// Plugin architecture
export { EditorCommentingPlugin, createEditorCommentingPlugin } from './EditorCommentingPlugin.js';
export { useEditorCommenting } from './useEditorCommenting.js';

// TipTap-specific integrations
export { useTipTapQuoteCommenting } from './use-tiptap-quote-commenting.js';
export { useTipTapQuoteIntegration, useQuoteReferenceHandler } from './use-tiptap-quote-integration.js';