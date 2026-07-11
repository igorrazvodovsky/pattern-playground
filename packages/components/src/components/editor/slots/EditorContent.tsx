import React from 'react';
import { EditorContent as TiptapEditorContent } from '@tiptap/react';
import { useEditorContext } from '../EditorProvider';

interface EditorContentProps {
  className?: string;
}

export function EditorContent({ className }: EditorContentProps) {
  const { editor } = useEditorContext();

  return <TiptapEditorContent editor={editor} className={className} />;
}