import { createPortal } from 'react-dom';
import { EditorContent } from '@tiptap/react';
import { useBoundProp, type ComponentContext } from '@json-render/react';
import type { Catalog } from '../catalog';
import { isKind, useMentionEditor } from './mention-editor';
import '../../jsx-types';

// The library's rich editor and reference mentions, with the candidates
// drawn as the library's combobox list. The list is not cmdk: focus stays
// in the editor, which reads the list through aria-activedescendant
// (mention-editor.ts), so the list takes the combobox's attributes for
// its look only.
export function MentionEditor({ props, bindings, emit }: ComponentContext<Catalog, 'MentionEditor'>) {
  const [content, setContent] = useBoundProp(props.content, bindings?.content);
  const [, setQuery] = useBoundProp(props.query, bindings?.query);
  const [scope, setScope] = useBoundProp(props.scope, bindings?.scope);
  const [, setOpened] = useBoundProp(props.opened, bindings?.opened);
  const { editor, open, groups, host, list, option } = useMentionEditor({
    label: props.label,
    placeholder: props.placeholder ?? '',
    content: content ?? [],
    setContent,
    setQuery,
    scope: scope ?? null,
    setScope,
    groups: props.candidates,
    onOpen: mention => {
      setOpened(mention.id);
      emit('open');
    },
    editorClass: '',
    mentionClass: 'reference-mention reference',
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
                    {group.options.map(candidate => (
                      <div key={candidate.id} cmdk-item="" {...option(candidate)}>
                        <span className="combobox-item__check" />
                        <span className="combobox-item__label">{candidate.label}</span>
                        {isKind(candidate) && (
                          <span className="combobox-item__suffix">
                            <iconify-icon icon="ph:caret-right" aria-hidden="true" />
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
