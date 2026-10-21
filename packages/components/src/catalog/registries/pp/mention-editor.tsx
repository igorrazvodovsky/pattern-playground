import { createPortal } from 'react-dom';
import { EditorContent } from '@tiptap/react';
import type { ComponentContext } from '@json-render/react';
import type { Catalog } from '../../catalog';
import { isKind, useMentionEditor, useMentionEditorProps } from '../../behaviour/mention-editor';
import { icons } from './index';
import '../../../jsx-types';

// The list takes the combobox's attributes for its look only: focus stays in
// the editor, which reads the list through aria-activedescendant.
export function MentionEditor({
  props,
  bindings,
  emit,
}: ComponentContext<Catalog, 'MentionEditor'>) {
  const { editor, open, groups, host, list, option } = useMentionEditor({
    ...useMentionEditorProps({ props, bindings, emit }),
    editorClass: '',
    mentionClass: 'reference-mention reference',
    slotClass: 'template-field',
    filledSlotClass: 'template-field--filled',
    listHostClass: 'reference-picker-popup',
    portal: () => document.body,
  });
  return (
    <div className="rich-editor">
      <EditorContent editor={editor} />
      {open &&
        createPortal(
          <div cmdk-root="">
            <div cmdk-list="" {...list}>
              {groups.map((group, index) => (
                <div key={group.heading ?? index} cmdk-group="" role="presentation">
                  {group.heading && (
                    <div cmdk-group-heading="" aria-hidden="true">
                      {group.heading}
                    </div>
                  )}
                  <div cmdk-group-items="" role="group" aria-label={group.heading ?? undefined}>
                    {group.options.map((candidate) => (
                      <div key={candidate.id} cmdk-item="" {...option(candidate)}>
                        <span className="combobox-item__check" />
                        {candidate.icon && (
                          <span className="combobox-item__prefix">
                            <iconify-icon icon={icons[candidate.icon]} aria-hidden="true" />
                          </span>
                        )}
                        <span className="combobox-item__label">{candidate.label}</span>
                        {isKind(candidate) && (
                          <span className="combobox-item__suffix">
                            <iconify-icon icon="ik:chevron-right" aria-hidden="true" />
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>,
          host,
        )}
    </div>
  );
}
