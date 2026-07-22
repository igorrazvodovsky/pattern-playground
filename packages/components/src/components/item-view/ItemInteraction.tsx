import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ItemView } from './ItemView';
import {
  ContentAdapterProvider,
  useContentAdapter,
  useContentAdapterContext,
} from './ContentAdapterRegistry';
import { modalService } from '../../services/modal-service';
import { useWorkingRungStore } from './working-rung-store';
import type { ItemInteractionProps, ViewScope, BaseItem } from './types';
import 'iconify-icon';
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
 * The one piece of net-new logic is the hover bridge. A hover-opened popover
 * that holds a control has to survive the pointer crossing the gap from the
 * trigger into it, so trigger and popover share the open state and leaving
 * either only schedules a close on a short grace that re-entering the other
 * cancels. The deeper rungs are opened states, not hover states: once the
 * drawer or dialog is up, hovering the trigger does nothing, and only a rung
 * choice or a dismissal moves off them.
 */

const HOVER_OPEN_DELAY = 350;
const HOVER_CLOSE_GRACE = 150;

/** The rungs the reader can escalate to; `micro` (the bare inline trigger) is
    not a destination — the reader returns to it by dismissing the overlay. */
type EscalationScope = 'mini' | 'mid' | 'maxi';

/** The escalation rungs, in ladder order. */
const RUNGS: { scope: EscalationScope; label: string; icon: string }[] = [
  { scope: 'mini', label: 'Summary', icon: 'ph:cards' },
  { scope: 'mid', label: 'Detail', icon: 'ph:square-split-horizontal' },
  { scope: 'maxi', label: 'Full', icon: 'ph:frame-corners' },
];

interface RungToolbarProps {
  current: ViewScope;
  /** Which rungs this content type can render, in ladder order. */
  available: ViewScope[];
  onSelect: (scope: EscalationScope) => void;
}

/**
 * The level-of-detail control every view carries — the ladder equivalent of
 * `OverviewDetailDemo`'s layout `DetailToolbar`: the rung is re-chosen from
 * inside the thing being presented. It renders a button per rung the reader can
 * move *to* — the current rung is omitted, since the container already says
 * where you are and re-selecting it is a no-op. Deliberately not a dropdown: a
 * menu's list escapes its container into the top layer, which fights both the
 * popover's hover-close and a modal's focus/dismiss handling — a direct button
 * has none of that. The caller places it (a corner in the popover, the header
 * beside the close button in a drawer or dialog).
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

export const ItemInteraction = <T extends string = string>({
  item,
  contentType,
  children,
  className,
  enableEscalation = true,
  initialScope,
  scopeConfig = {},
  onScopeChange,
  onInteraction,
}: ItemInteractionProps<T>) => {
  const [activeScope, setActiveScope] = useState<ActiveScope>(
    initialScope === 'mini' || initialScope === 'mid' || initialScope === 'maxi'
      ? initialScope
      : null
  );
  const [anchor, setAnchor] = useState<HTMLSpanElement | null>(null);
  // The popover is portaled to `document.body`: its content is a block-level
  // `<div>`, and the trigger commonly sits in running prose, so leaving it in
  // place would nest a `<div>` inside a `<p>` (invalid, and a hydration error).
  // It is anchored by ref and lives in the top layer, so its DOM home is moot.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  const activeScopeRef = useRef<ActiveScope>(activeScope);
  activeScopeRef.current = activeScope;

  // Every item carried by an adapter is a `BaseItem` at heart (id + label);
  // the generic `ItemObject<T>` hides that behind the discriminated union.
  const itemLabel = (item as unknown as BaseItem).label;

  const preferredWorkingRung = useWorkingRungStore((state) => state.preferred);
  const setPreferredWorkingRung = useWorkingRungStore((state) => state.setPreferred);

  const adapter = useContentAdapter(contentType);
  const { getSupportedScopes } = useContentAdapterContext();
  const available = useMemo(
    () =>
      getSupportedScopes(contentType).filter(
        (scope): scope is ViewScope => scope === 'mini' || scope === 'mid' || scope === 'maxi'
      ),
    [getSupportedScopes, contentType]
  );

  const changeScope = useCallback(
    (scope: ActiveScope) => {
      setActiveScope(scope);
      if (scope) onScopeChange?.(scope);
    },
    [onScopeChange]
  );

  const clearTimers = useCallback(() => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  // Hover/focus opens the summary after an intent delay — but only from the
  // bare trigger; if a drawer or dialog is already up, hovering does nothing.
  const openSummarySoon = useCallback(() => {
    if (!enableEscalation) return;
    if (activeScopeRef.current === 'mid' || activeScopeRef.current === 'maxi') return;
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    const delay = scopeConfig.mini?.delay ?? HOVER_OPEN_DELAY;
    openTimer.current = window.setTimeout(() => changeScope('mini'), delay);
  }, [enableEscalation, scopeConfig, changeScope]);

  // Leaving the trigger or the popover schedules a close that re-entering the
  // other cancels. Only the summary closes this way; an open drawer stays put.
  const scheduleClose = useCallback(() => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    closeTimer.current = window.setTimeout(() => {
      setActiveScope((current) => (current === 'mini' ? null : current));
    }, HOVER_CLOSE_GRACE);
  }, []);

  const holdSummary = useCallback(() => {
    clearTimers();
  }, [clearTimers]);

  // A click (or Enter/Space) is the active commit: skip the summary glance and
  // open a working view straight away — the preferred rung when this content
  // type has it, else the deepest working rung it does, else the summary.
  const openWorkingRung = useCallback(() => {
    if (!enableEscalation) return;
    clearTimers();
    const target: EscalationScope = available.includes(preferredWorkingRung)
      ? preferredWorkingRung
      : available.includes('maxi')
        ? 'maxi'
        : available.includes('mid')
          ? 'mid'
          : 'mini';
    changeScope(target);
  }, [enableEscalation, clearTimers, changeScope, available, preferredWorkingRung]);

  const selectRung = useCallback(
    (scope: EscalationScope) => {
      clearTimers();
      // A deliberate move to a working rung is what forms the click habit; the
      // summary is the hover glance and never a preference.
      if (scope === 'mid' || scope === 'maxi') setPreferredWorkingRung(scope);
      changeScope(scope);
    },
    [clearTimers, changeScope, setPreferredWorkingRung]
  );

  const dismiss = useCallback(() => {
    clearTimers();
    changeScope(null);
  }, [clearTimers, changeScope]);

  // Everything the overlay content is built from, kept fresh so the modal
  // effect can depend on `activeScope` alone — `item` is a new object each
  // render in some callers, and threading it through the deps would reopen
  // the modal on every parent render.
  const latest = useRef({ adapter, available, item, contentType, onInteraction, selectRung });
  latest.current = { adapter, available, item, contentType, onInteraction, selectRung };

  // Drawer (mid) and dialog (maxi) are imperative surfaces reconciled from
  // state. Effect cleanup closes the current one via `closeModal`, which tears
  // down without dispatching `modal:close`, so a rung switch (mid → maxi) is
  // silent; a user dismissal runs through the web component, fires `modal:close`
  // → `onClose`, and drops the state back to the bare trigger.
  useEffect(() => {
    if (activeScope !== 'mid' && activeScope !== 'maxi') return;
    const { adapter, available, item, contentType, onInteraction, selectRung } = latest.current;
    const title = (item as unknown as BaseItem).label;
    const content = (
      <ContentAdapterProvider adapters={adapter ? [adapter] : []}>
        <ItemView
          item={item}
          contentType={contentType}
          scope={activeScope}
          mode="inspect"
          onInteraction={onInteraction}
        />
      </ContentAdapterProvider>
    );
    // The rung control rides in the modal header, grouped with the close
    // button, rather than floating faintly over the content.
    const headerActions = (
      <RungToolbar current={activeScope} available={available} onSelect={selectRung} />
    );
    const id =
      activeScope === 'mid'
        ? modalService.openDrawer(content, {
            position: 'right',
            title,
            headerActions,
            modal: false,
            onClose: () => setActiveScope(null),
          })
        : modalService.openDialog(content, {
            size: 'large',
            title,
            headerActions,
            onClose: () => setActiveScope(null),
          });
    return () => modalService.closeModal(id);
  }, [activeScope]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  if (!enableEscalation) {
    return <>{children}</>;
  }

  return (
    <>
      <span
        ref={setAnchor}
        className={className}
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={activeScope !== null}
        onMouseEnter={openSummarySoon}
        onMouseLeave={scheduleClose}
        onFocus={openSummarySoon}
        onBlur={scheduleClose}
        onClick={openWorkingRung}
        onKeyDown={(event) => {
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
            top-layer=""
          >
            <div
              className="popover"
              role="dialog"
              aria-label={itemLabel}
              onMouseEnter={holdSummary}
              onMouseLeave={scheduleClose}
              onKeyDown={(event) => event.key === 'Escape' && dismiss()}
            >
              {/* A real header, not a floating corner control: the summary's
                  own heading is the title on the leading edge, the rung buttons
                  the actions on the trailing one. The popover wants its controls
                  always legible, so it takes this instead of the quiet
                  `.detail__toolbar` the card and page hosts share. */}
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
          document.body
        )}
    </>
  );
};
