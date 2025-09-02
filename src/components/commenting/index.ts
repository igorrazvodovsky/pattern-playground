// Commenting UI components exports

// Universal components
export { CommentThread, CommentPopover, CommentDrawer } from './universal/index';

// TipTap integration - Plugin architecture
export { 
  EditorCommentingPlugin, 
  createEditorCommentingPlugin,
  useEditorCommenting 
} from './tiptap/index';

// Examples following the plan architecture
export { TaskComments } from './examples/TaskComments';
export { ProjectComments, ProjectViewScopes, DirectProjectCommenting } from './examples/ProjectComments';
export { EditorWithQuoteComments } from './examples/EditorWithQuoteComments';