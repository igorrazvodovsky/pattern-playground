import React from 'react';

interface EditorLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function EditorLayout({ children, className }: EditorLayoutProps) {
  return (
    <div className={className} data-editor-layout>
      {children}
    </div>
  );
}