export { TextEditor } from './TextEditor';
export { useEditor } from './hooks/use-editor';
export { BubbleMenu, BUBBLE_MENU_PRESETS } from './components/BubbleMenu';
export { FloatingMenu, FLOATING_MENU_PRESETS } from './components/FloatingMenu';

// Action creators for convenience
export {
  createExplainAction,
  createSummarizeAction,
  createHighlightAction,
  createCommentAction,
  createCreateTaskAction,
  createBoldAction,
  createItalicAction,
  createStrikeAction,
} from './components/BubbleMenu';

export {
  createHeadingAction,
  createBulletListAction,
  createOrderedListAction,
  createCodeBlockAction,
  createBlockquoteAction,
  createHorizontalRuleAction,
} from './components/FloatingMenu';

// Types
export type {
  TextEditorProps,
  BubbleMenuConfig,
  FloatingMenuConfig,
  BubbleMenuAction,
  FloatingMenuAction,
  CommentingConfig,
  ReferenceConfig,
  UseEditorOptions,
  EditorState,
} from './types';