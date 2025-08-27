import React from 'react';
import { useEditorContext } from '../EditorProvider';
import type { SlotComponent } from '../types';

interface EditorToolbarProps {
  className?: string;
}

export function EditorToolbar({ className }: EditorToolbarProps) {
  const { slots } = useEditorContext();
  const components = slots.getComponents('toolbar');

  if (components.length === 0) {
    return null;
  }

  return (
    <div className={className} data-slot="toolbar">
      {components.map((component: SlotComponent, index: number) => (
        <div key={`${component.pluginId}-${index}`} data-plugin={component.pluginId}>
          {component.render()}
        </div>
      ))}
    </div>
  );
}