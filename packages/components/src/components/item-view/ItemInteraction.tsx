import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { resolveEntityTitle } from '@shared/data/bindings';
import { ItemView } from './ItemView';
import { ItemViewProvider, useEntityBinding, useItemViewContext } from './provider';
import { modalService } from '../../services/modal-service';
import { usePreview } from './use-preview';
import { useWorkingRungStore } from './working-rung-store';
import type { ItemInteractionProps, ViewScope } from './types';
import '../../icons/register-icons';
import '../../jsx-types';

/**
 * ItemInteraction — progressive disclosure of one entity up and down the
 * representation ladder, from an inline trigger.
 *
 * Passive arrival and active commit part ways at the trigger. Hovering or
 * focusing it opens the summary in a popover after a short intent delay — a
 * glance, "what is this?". Clicking it (or Enter/Space) says "I want to work
 * with this" and opens a working view directly: the reader's preferred working
 * rung, Detail (a drawer) or Full (a dialog), remembered across references and
 * Detail until they choose otherwise (see {@link useWorkingRungStore}). The
 * summary is never a working rung — it belongs to the hover modality — so
 * hovering references all day can't disturb that preference.
 *
 * From any view the reader climbs or descends with a single control the same on
 * every rung: a segmented row of level-of-detail buttons (in the header of the
 * popover, drawer or dialog). Rung and container co-vary — Summary is a popover,
 * Detail a drawer, Full a dialog — so choosing a level of detail is also
 * choosing how much surrounding context stays. The same control on every view
 * is what makes the movement reversible: any rung can drop back to any lower
 * one, and a deliberate move to Detail or Full is what updates the preference.
 *
 * The summary's hover bridge is {@link usePreview}, shared with the catalog's
 * Reference: leaving the trigger or the popover only schedules a close that
 * arriving on the other cancels, and Tab moves between the trigger and the
 * popover's controls. The deeper rungs are opened states, not hover states:
 * once the drawer or dialog is up, hovering the trigger does nothing, and only
 * a rung choice or a dismissal moves off them.
 */

/** The rungs the reader can escalate to; `micro` (the bare inline trigger) is
    not a destination — the reader returns to it by dismissing the overlay. */
type EscalationScope = 'mini' | 'mid' | 'maxi';

/** The escalation rungs, in ladder order. */
const RUNGS: { scope: EscalationScope; label: string; icon: string }[] = [
  { scope: 'mini', label: 'Summary', icon: 'ik:view-module' },
  { scope: 'mid', label: 'Detail', icon: 'ik:columns' },
  { scope: 'maxi', label: 'Full', icon: 'ik:fullscreen' },
];

interface RungToolbarProps {
  current: ViewScope;
  /** Which rungs this content type can render, in ladder order. */
  available: ViewScope[];
  onSelect: (scope: EscalationScope) => void;
}

/**
 * The level-of-detail control every view carries: the rung is re-chosen from
 * inside the thing being presented. It renders a button per rung the reader
 * can move *to* — the current rung is omitted, since the container already
 * says where you are and re-selecting it is a no-op. Deliberately not a
 * dropdown: this popover closes when the pointer leaves it, and a menu's list
 * escapes into the top layer, outside the popover, so moving onto the list
 * would close the popover. The caller places it (a corner in the popover, the
 * header beside the close button in a drawer or dialog).
 */
function RungToolbar({ current, available, onSelect }: RungToolbarProps) {
  const rungs = RUNGS.filter((rung) => rung.scope !== current && available.includes(rung.scope));
  if (rungs.length === 0) return null;
  return (
    <div className="button-group" role="group" aria-label="Level of detail">
      {rungs.map(({ scope, label, icon }) => (
        <button
          key={scope}
          type="button"
          className="button button--plain"
          aria-label={label}
          title={label}
          onClick={() => onSelect(scope)}
        >
          <iconify-icon className="icon" icon={icon}></iconify-icon>
          <span className="visually-hidden">{label}</span>
        </button>
      ))}
    </div>
  );
}

/** The rung presented right now; `null` is the bare inline trigger. */
type ActiveScope = EscalationScope | null;

export const ItemInteraction = ({
  item,
  contentType,
  children,
  className,
  enableEscalation = true,
  initialScope,
  onScopeChange,
  onInteraction,
}: ItemInteractionProps) => {
  const [activeScope, setActiveScope] = useState<ActiveScope>(
    initialScope === 'mini' || initialScope === 'mid' || initialScope === 'maxi'
      ? initialScope
      : null,
  );
  const [anchor, setAnchor] = useState<HTMLSpanElement | null>(null);
  // The popover is portaled to `document.body`: its content is a block-level
  // `<div>`, and the trigger commonly sits in running prose, so leaving it in
  // place would nest a `<div>` inside a `<p>` (invalid, and a hydration error).
  // It is anchored by ref and lives in the top layer, so its DOM home is moot.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const binding = useEntityBinding(contentType);
  // The modal surfaces render in a separate React root, so the context that
  // resolved this trigger's binding is re-provided around their content.
  const itemViewContext = useItemViewContext();

  // The entity names its own views through the binding's `title` role.
  const itemLabel = resolveEntityTitle(item, binding);

  const preferredWorkingRung = useWorkingRungStore((state) => state.preferred);
  const setPreferredWorkingRung = useWorkingRungStore((state) => state.setPreferred);

  // A rung is available when the binding's scope ladder gives it attributes;
  // without a binding the fallback renderer carries all three.
  const available = useMemo<ViewScope[]>(
    () =>
      (['mini', 'mid', 'maxi'] as const).filter(
        (scope) => !binding || binding.scopes[scope].length > 0,
      ),
    [binding],
  );

  const changeScope = useCallback(
    (scope: ActiveScope) => {
      setActiveScope(scope);
      if (scope) onScopeChange?.(scope);
    },
    [onScopeChange],
  );

  // Only the summary is shown and hidden by the hover bridge; a hidden
  // summary leaves an open drawer or dialog as it is.
  const setSummaryShown = useCallback(
    (shown: boolean) =>
      shown
        ? changeScope('mini')
        : setActiveScope((current) => (current === 'mini' ? null : current)),
    [changeScope],
  );
  const { triggerRef, contentRef, trigger, content, close } = usePreview<HTMLSpanElement>(
    activeScope === 'mini',
    setSummaryShown,
    activeScope === 'mid' || activeScope === 'maxi',
  );
  const setTrigger = useCallback(
    (element: HTMLSpanElement | null) => {
      triggerRef.current = element;
      setAnchor(element);
    },
    [triggerRef],
  );

  // A click (or Enter/Space) is the active commit: skip the summary glance and
  // open a working view straight away — the preferred rung when this content
  // type has it, else the deepest working rung it does, else the summary.
  const openWorkingRung = useCallback(() => {
    if (!enableEscalation) return;
    close();
    const target: EscalationScope = available.includes(preferredWorkingRung)
      ? preferredWorkingRung
      : available.includes('maxi')
        ? 'maxi'
        : available.includes('mid')
          ? 'mid'
          : 'mini';
    changeScope(target);
  }, [enableEscalation, close, changeScope, available, preferredWorkingRung]);

  const selectRung = useCallback(
    (scope: EscalationScope) => {
      // A deliberate move to a working rung is what forms the click habit; the
      // summary is the hover glance and never a preference.
      if (scope === 'mid' || scope === 'maxi') setPreferredWorkingRung(scope);
      changeScope(scope);
    },
    [changeScope, setPreferredWorkingRung],
  );

  const dismiss = useCallback(() => {
    close();
    changeScope(null);
  }, [close, changeScope]);

  // Everything the overlay content is built from, kept fresh so the modal
  // effect can depend on `activeScope` alone — `item` is a new object each
  // render in some callers, and threading it through the deps would reopen
  // the modal on every parent render.
  const latest = useRef({
    itemViewContext,
    available,
    item,
    itemLabel,
    contentType,
    onInteraction,
    selectRung,
    anchor,
  });
  latest.current = {
    itemViewContext,
    available,
    item,
    itemLabel,
    contentType,
    onInteraction,
    selectRung,
    anchor,
  };

  // Drawer (mid) and dialog (maxi) are imperative surfaces reconciled from
  // state. Effect cleanup closes the current one via `closeModal`, which tears
  // down without dispatching `pp-modal-close`, so a rung switch (mid → maxi) is
  // silent; a user dismissal runs through the web component, fires `pp-modal-close`
  // → `onClose`, and drops the state back to the bare trigger.
  useEffect(() => {
    if (activeScope !== 'mid' && activeScope !== 'maxi') return;
    const {
      itemViewContext,
      available,
      item,
      itemLabel,
      contentType,
      onInteraction,
      selectRung,
      anchor,
    } = latest.current;
    const title = itemLabel;
    const content = (
      <ItemViewProvider
        bindings={itemViewContext.bindings}
        customComponents={itemViewContext.customComponents}
      >
        <ItemView
          item={item}
          contentType={contentType}
          scope={activeScope}
          mode="inspect"
          onInteraction={onInteraction}
        />
      </ItemViewProvider>
    );
    // The rung control rides in the modal header, grouped with the close
    // button, rather than floating faintly over the content.
    const headerActions = (
      <RungToolbar current={activeScope} available={available} onSelect={selectRung} />
    );
    // What held focus at opening may be in the surface this one replaced.
    const id =
      activeScope === 'mid'
        ? modalService.openDrawer(content, {
            position: 'right',
            title,
            headerActions,
            modal: false,
            returnFocus: anchor,
            onClose: () => setActiveScope(null),
          })
        : modalService.openDialog(content, {
            size: 'large',
            title,
            headerActions,
            returnFocus: anchor,
            onClose: () => setActiveScope(null),
          });
    return () => modalService.closeModal(id);
  }, [activeScope]);

  if (!enableEscalation) {
    return <>{children}</>;
  }

  return (
    <>
      <span
        ref={setTrigger}
        className={className}
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={activeScope !== null}
        {...trigger}
        onClick={openWorkingRung}
        onKeyDown={(event) => {
          trigger.onKeyDown(event);
          if (event.defaultPrevented) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openWorkingRung();
          } else if (event.key === 'Escape') {
            dismiss();
          }
        }}
      >
        {children}
      </span>

      {/* The summary, portaled to `document.body`. `top-layer` keeps it out of
          the prose's line box and clear of any scrolling ancestor's clipping;
          the hover bridge, not light dismiss, governs when it closes, since it
          must stay open long enough to reach the settings control inside it. */}
      {mounted &&
        createPortal(
          <pp-popup
            anchor={anchor ?? undefined}
            active={activeScope === 'mini'}
            placement="bottom-start"
            distance={8}
            flip
            shift
            top-layer
          >
            <div
              ref={contentRef}
              className="popover"
              role="dialog"
              aria-label={itemLabel}
              {...content}
            >
              {/* A real header: the summary's own heading is the title on the
                  leading edge, the rung buttons the actions on the trailing
                  one, so the controls stay legible. */}
              <div className="popover__header">
                <ItemView
                  item={item}
                  contentType={contentType}
                  scope="mini"
                  mode="preview"
                  onInteraction={onInteraction}
                />
                <RungToolbar current="mini" available={available} onSelect={selectRung} />
              </div>
            </div>
          </pp-popup>,
          document.body,
        )}
    </>
  );
};
