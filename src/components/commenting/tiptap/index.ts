// TipTap editor integration exports

// Plugin architecture
export { EditorCommentingPlugin, createEditorCommentingPlugin } from './EditorCommentingPlugin';
export { useEditorCommenting } from './useEditorCommenting';

// TipTap-specific integrations
export { useTipTapQuoteCommenting } from './use-tiptap-quote-commenting';
export { useTipTapQuoteIntegration, useQuoteReferenceHandler } from './use-tiptap-quote-integration';