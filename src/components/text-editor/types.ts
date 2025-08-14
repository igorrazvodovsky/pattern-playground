import type { Editor, Extension } from '@tiptap/core';
import type { ReactNode } from 'react';

export interface TiptapContent {
  type: string;
  content?: Array<{
    type: string;
    content?: Array<{
      type: string;
      text?: string;
      attrs?: Record<string, unknown>;
    }>;
    attrs?: Record<string, unknown>;
  }>;
}

export interface BubbleMenuAction {
  id: string;
  label: string;
  icon: string;
  handler: (editor: Editor) => void;
  isActive?: (editor: Editor) => boolean;
  isVisible?: (editor: Editor) => boolean;
  tooltip?: string;
}

export interface BubbleMenuConfig {
  actions: BubbleMenuAction[];
  shouldShow?: (editor: Editor) => boolean;
  className?: string;
}

export interface FloatingMenuAction {
  id: string;
  label: string;
  icon: string;
  handler: (editor: Editor) => void;
  tooltip?: string;
  group?: string;
}

export interface FloatingMenuConfig {
  actions: FloatingMenuAction[];
  shouldShow?: (editor: Editor) => boolean;
  className?: string;
}

export interface CommentingConfig {
  enabled: boolean;
  documentId?: string;
  currentUser?: string;
}

export interface ReferenceConfig {
  enabled: boolean;
  categories?: any[];
  onReferenceSelect?: (reference: any) => void;
}

export interface TextEditorProps {
  content?: string | TiptapContent;
  extensions?: Extension[];
  editable?: boolean;
  placeholder?: string;
  onUpdate?: (editor: Editor) => void;
  onSelectionChange?: (editor: Editor) => void;
  className?: string;
  
  // Menu configurations
  bubbleMenu?: BubbleMenuConfig;
  floatingMenu?: FloatingMenuConfig;
  
  // Feature configurations
  commenting?: CommentingConfig;
  references?: ReferenceConfig;
  
  // Editor props
  editorProps?: Record<string, any>;
  
  // Children for custom UI
  children?: ReactNode;
}

export interface UseEditorOptions {
  content?: string | TiptapContent;
  extensions?: Extension[];
  editable?: boolean;
  placeholder?: string;
  onUpdate?: (editor: Editor) => void;
  onSelectionChange?: (editor: Editor) => void;
  editorProps?: Record<string, any>;
  
  // Feature flags
  enableCommenting?: boolean;
  enableReferences?: boolean;
  enableTemplateFields?: boolean;
}

export interface EditorState {
  content: string;
  wordCount: number;
  isValid: boolean;
  selection: {
    from: number;
    to: number;
    text: string;
  };
  mentions: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  templateFields: Array<{
    label: string;
    value: string;
    filled: boolean;
    required: boolean;
  }>;
}