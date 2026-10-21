import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { ChevronRight } from 'iconoteka-react';
import { EditorContent } from '@tiptap/react';
import type { ComponentContext } from '@json-render/react';
import type { Catalog } from '../../catalog';
import { useInComposer } from './composer-field';
import { isKind, useMentionEditor, useMentionEditorProps } from '../../behaviour/mention-editor';
import { scopedPortal } from './portal';
import { slotTrigger } from './parts';
import { tone } from './rule-builder';
import { icons } from './index';

// shadcn/ui has no rich text editor, so the field takes Textarea's classes.
// The list takes the Command list's classes but is not cmdk: focus stays in
// the editor, which reads the list through aria-activedescendant.

const framed =
  'min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30';
const bare = 'min-h-16 w-full bg-transparent px-2 py-1.5 text-base outline-none';
// A formula's mentions and joining words are chips on lines tall enough to
// hold them. It keeps the rule builder's font, size and line height, so the
// two notations of one rule read alike.
const formulaClass = 'leading-8 [&_p+p]:mt-0';
// Every chip in a formula has the same height and shape, whatever it holds.
const chip =
  'inline-block cursor-pointer rounded-full px-2 align-middle leading-6 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';
const proseClass = 'md:text-sm [&_p+p]:mt-3';
// A keyword is a word that opens a menu, like a sentence slot. A joining
// word whose id names a combinator takes that combinator's colour from the
// rule builder, as a pill set in small capitals so it sits below the text.
const keywordClass = (keyword: string) =>
  keyword === 'all' || keyword === 'any'
    ? clsx(chip, 'font-medium tracking-wide [font-variant-caps:all-small-caps]', tone[keyword].pill)
    : clsx(slotTrigger, 'cursor-pointer aria-expanded:bg-accent');
const textClass =
  '[&_p]:mb-0 [&_p:first-child]:mt-0 [&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:h-0 [&_p.is-editor-empty:first-child]:before:text-muted-foreground [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]';

export function MentionEditor({
  props,
  bindings,
  emit,
}: ComponentContext<Catalog, 'MentionEditor'>) {
  const inComposer = useInComposer();
  const formula = props.notation === 'formula';
  const { editor, open, groups, host, list, option } = useMentionEditor({
    ...useMentionEditorProps({ props, bindings, emit }),
    editorClass: clsx(inComposer ? bare : framed, textClass, formula ? formulaClass : proseClass),
    mentionClass: formula
      ? clsx(chip, 'mx-0.5 max-w-56 truncate bg-primary/10 text-primary hover:bg-primary/15')
      : 'box-decoration-clone cursor-pointer rounded-sm bg-primary/10 px-1 font-medium text-primary outline-none hover:bg-primary/15 focus-visible:ring-[3px] focus-visible:ring-ring/50',
    keywordClass,
    bracketClass: 'rounded-sm bg-accent font-bold text-accent-foreground',
    slotClass:
      'inline-block max-w-full rounded-sm border border-dashed border-input align-baseline focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
    filledSlotClass: 'bg-muted',
    slotInputClass: 'max-w-full bg-transparent px-1 outline-none placeholder:text-muted-foreground',
    listHostClass: 'z-50',
    portal: scopedPortal,
  });
  return (
    <>
      <EditorContent editor={editor} />
      {open &&
        createPortal(
          <div
            {...list}
            className="max-h-[300px] w-72 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
          >
            {groups.map((group, index) => (
              <div key={group.heading ?? index} role="presentation">
                {group.heading && (
                  <div
                    aria-hidden="true"
                    className="px-2 py-1.5 text-xs font-medium text-muted-foreground"
                  >
                    {group.heading}
                  </div>
                )}
                <div role="group" aria-label={group.heading ?? undefined}>
                  {group.options.map((candidate) => {
                    const Icon = candidate.icon ? icons[candidate.icon] : null;
                    return (
                      <div
                        key={candidate.id}
                        {...option(candidate)}
                        className="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                      >
                        {Icon && (
                          <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
                        )}
                        {candidate.label}
                        {isKind(candidate) && (
                          <ChevronRight aria-hidden="true" className="ml-auto size-4 opacity-50" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>,
          host,
        )}
    </>
  );
}
