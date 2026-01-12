  1. Start with Architecture Analysis: Map out all the systems that would be touched before
  coding
  2. Design Integration APIs First: Define how external systems will integrate before
  implementing
  3. Plan for Dynamic Schemas: Build rich text editors with content-aware extension loading from
   the start
  4. Separate Concerns Earlier: Keep core editor logic separate from feature integrations

  Current State Analysis Draft

  TextEditor Component:
  - Has a commenting prop with CommentingConfig, but it's limited (only enabled, documentId,
  currentUser)
  - Uses its own useEditor hook that conditionally loads CommentMark extension
  - Has a BubbleMenu system with action-based configuration (BubbleMenuAction[])
  - Does NOT expose the underlying Tiptap editor instance to consumers

  Commenting System:
  - useTipTapQuoteCommenting hook requires direct access to Tiptap Editor instance
  - Needs manual BubbleMenu setup with custom comment button rendering
  - Requires DOM event handling for quote reference clicks
  - Uses QuoteCommentPopover for comment UI
  - Needs ReferenceMark extension loaded

  Current Problem:
  The CommentingEditor example bypasses TextEditor entirely because the commenting system can't
  integrate with it - it needs direct editor access that TextEditor doesn't provide.

  Key Refactoring Challenges

  1. Editor Instance Exposure

  TextEditor needs to expose the editor instance. Currently only onUpdate callback provides it,
  but hooks need persistent access.

  2. BubbleMenu Integration

  - Current system uses BubbleMenuAction[] interface
  - Commenting needs custom bubble menu with different rendering
  - Needs to coordinate visibility (hide when comment popover open)

  3. Event Handling Integration

  - Comment system needs to handle clicks on quote references in editor DOM
  - Needs access to editor's view.dom for event listeners
  - Must coordinate with editor focus/selection state

  4. State Coordination

  - Comment UI state (popover open/closed) must coordinate with editor
  - BubbleMenu visibility depends on comment state
  - Popover positioning relative to editor selection

  Recommended Refactoring Approach

  Two-phase solution:

  Phase 1: Editor Instance Exposure

  interface TextEditorProps {
    // Add editor instance callback
    onEditorReady?: (editor: Editor) => void;
  }

  Phase 2: Deep Commenting Integration

  interface CommentingConfig {
    enabled: boolean;
    documentId: string;
    currentUser: string;
    // Add callback to expose commenting hook
    onCommentingReady?: (commenting: ReturnType<typeof useTipTapQuoteCommenting>) => void;
  }

  Key changes needed:
  1. TextEditor.tsx: Add onEditorReady callback, enhance commenting integration
  2. useEditor.ts: Handle quote reference clicks when commenting enabled
  3. BubbleMenu: Support commenting actions that can override/extend default actions
  4. Event coordination: Manage comment popover + bubble menu visibility

  This approach maintains backward compatibility while enabling proper commenting integration
  without forcing consumers to bypass TextEditor.

  The current architecture is actually well-designed for this refactoring - it just needs the
  missing bridge between the encapsulated editor and external commenting hooks.