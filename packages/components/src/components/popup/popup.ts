import { autoUpdate, computePosition, flip, offset, platform, shift, size } from '@floating-ui/dom';
import { LitElement } from 'lit';
import { offsetParent } from 'composed-offset-position';
import { property } from 'lit/decorators.js';

export interface VirtualElement {
  getBoundingClientRect: () => DOMRect;
  contextElement?: Element;
}

function isVirtualElement(e: unknown): e is VirtualElement {
  return (
    e !== null &&
    typeof e === 'object' &&
    'getBoundingClientRect' in e &&
    ('contextElement' in e ? e instanceof Element : true)
  );
}

/**
 * @summary Utility that lets you to “pops up” a piece of transient UI over all other UI.
 * @status draft
 * @since 0.1
 *
 * Light-DOM shell (rung 3 flavour): the element itself is the positioned box —
 * Floating UI drives its `left`/`top`, the native popover API promotes it to
 * the top layer, and the author's children are the popup's content. The
 * anchor is external: pass an element, id, or `VirtualElement` via the
 * `anchor` property (or mark a sibling with `data-slot="anchor"`).
 * Styles live in `src/styles/popup.css`.
 */

export class PpPopup extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  private anchorEl: Element | VirtualElement | null;
  private cleanup: ReturnType<typeof autoUpdate> | undefined;

  /** The positioned box. The light-DOM element is its own box; kept as an accessor for consumers of the old shadow API. */
  get popup(): HTMLElement {
    return this;
  }

  /**
   * The element the popup will be anchored to: an element `id`, a DOM element
   * reference, or a `VirtualElement`. Alternatively, mark a child with
   * `data-slot="anchor"`.
   */
  @property() anchor: Element | string | VirtualElement;
  @property({ type: Boolean, reflect: true }) active = false;
  @property({ reflect: true }) placement:
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'right'
    | 'right-start'
    | 'right-end'
    | 'left'
    | 'left-start'
    | 'left-end' = 'top';


  @property({ reflect: true }) strategy: 'absolute' | 'fixed' = 'absolute';
  @property({ type: Number }) distance = 0;
  @property({ type: Number }) skidding = 0;
  @property({ type: Boolean }) flip = false;
  @property({ attribute: 'flip-padding', type: Number }) flipPadding = 0;
  @property({ type: Boolean }) shift = false;
  @property({ type: Object }) shiftBoundary: Element | Element[];
  @property({ attribute: 'shift-padding', type: Number }) shiftPadding = 0;
  @property({ attribute: 'auto-size' }) autoSize: 'horizontal' | 'vertical' | 'both';
  @property() sync: 'width' | 'height' | 'both';
  @property({ type: Object }) autoSizeBoundary: Element | Element[];
  @property({ attribute: 'auto-size-padding', type: Number }) autoSizePadding = 0;

  /**
   * Promote the popup into the browser's top layer via the native popover API.
   *
   * Without it the popup is positioned inside the DOM where it was declared, so
   * it inherits every ancestor's `overflow` clipping and competes on z-index
   * with its anchor's siblings — a later sibling that raises its own z-index
   * paints over it. The top layer sits above all of that, unconditionally.
   * Off by default: it changes where the popup paints, and existing consumers
   * (dropdown, tooltip) are positioned to be fine without it.
   */
  @property({ attribute: 'top-layer', type: Boolean, reflect: true }) topLayer = false;

  /**
   * With `top-layer`, let the platform close the popup on an outside click or
   * Escape (a `popover=auto` rather than `popover=manual`). The popup clears
   * its own `active` and fires `pp-hide` so the owner can follow.
   */
  @property({ attribute: 'light-dismiss', type: Boolean }) lightDismiss = false;

  async connectedCallback() {
    super.connectedCallback();
    this.addEventListener('beforetoggle', this.handleBeforeToggle);
    if (document.readyState !== 'loading') {
      await this.init();
      return;
    }
    document.addEventListener('DOMContentLoaded', async () => await this.init());
  }

  private async init() {
    await this.updateComplete;
    if (!this.anchorEl) this.handleAnchorChange();
    this.start();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('beforetoggle', this.handleBeforeToggle);
    this.stop();
  }

  async updated(changedProps: Map<string, unknown>) {
    super.updated(changedProps);

    // The popover attribute lives on the host itself in light DOM.
    if (this.topLayer) {
      const mode = this.lightDismiss ? 'auto' : 'manual';
      if (this.getAttribute('popover') !== mode) this.setAttribute('popover', mode);
    } else if (this.hasAttribute('popover')) {
      this.removeAttribute('popover');
    }

    if (changedProps.has('active')) {
      if (this.active) {
        this.start();
      } else {
        this.stop();
      }
    }

    // Re-asserted on every update, not just when `active` flips. The popover
    // can be closed by the platform without the owner following (it may ignore
    // `pp-hide`), and then `active` never changes again — so keying the sync to
    // that change alone lets the two states diverge permanently. This is a
    // `matches()` check when there is nothing to do.
    this.syncTopLayer();

    if (changedProps.has('anchor')) {
      this.handleAnchorChange();
    }

    if (this.active) {
      await this.updateComplete;
      this.reposition();
    }
  }

  private async handleAnchorChange() {
    await this.stop();

    if (this.anchor && typeof this.anchor === 'string') {
      const root = this.getRootNode() as Document | ShadowRoot;
      this.anchorEl = root.getElementById(this.anchor);
    } else if (this.anchor instanceof Element || isVirtualElement(this.anchor)) {
      this.anchorEl = this.anchor;
    } else {
      this.anchorEl = this.querySelector<HTMLElement>('[data-slot="anchor"]');
    }

    if (this.anchorEl) {
      this.start();
    }
  }

  /**
   * Drive the native popover from `active`. Guarded by `isConnected` and the
   * open state because `showPopover()`/`hidePopover()` throw when the element
   * is already in that state or detached.
   */
  private syncTopLayer() {
    if (!this.topLayer || !this.isConnected || !this.hasAttribute('popover')) return;
    const open = this.matches(':popover-open');
    try {
      if (this.active && !open) this.showPopover();
      else if (!this.active && open) this.hidePopover();
    } catch {
      // Element detached mid-update; the next `updated()` re-syncs.
    }
  }

  /**
   * The platform is closing an `auto` popover (outside click, Escape). Report it
   * and stop there — `active` belongs to whoever set it. Clearing it here would
   * desync a declarative owner: React diffs against the value it last rendered,
   * so a property the element changed behind its back is never written again,
   * and the next `active={true}` is a no-op that leaves the popup shut.
   *
   * `beforetoggle`, not `toggle`, because only the former is synchronous. A
   * click that dismisses one popup and opens another arrives as `pointerdown`
   * (which dismisses) then `click` (which re-opens); an async `toggle` lands
   * after both and closes what the click just opened.
   */
  private handleBeforeToggle = (event: Event) => {
    const { newState } = event as ToggleEvent;
    if (newState === 'closed' && this.active) {
      this.dispatchEvent(new Event('pp-hide', { bubbles: true, composed: true }));
    }
  };

  private start() {
    if (!this.anchorEl || this.cleanup) {
      return;
    }

    this.cleanup = autoUpdate(this.anchorEl, this, () => {
      this.reposition();
    });
  }

  private async stop(): Promise<void> {
    return new Promise(resolve => {
      if (this.cleanup) {
        this.cleanup();
        this.cleanup = undefined;
        this.removeAttribute('data-current-placement');
        this.style.removeProperty('--auto-size-available-width');
        this.style.removeProperty('--auto-size-available-height');
        requestAnimationFrame(() => resolve());
      } else {
        resolve();
      }
    });
  }

  reposition() {
    if (!this.active || !this.anchorEl) {
      return;
    }

    // NOTE: Floating UI middlewares are order dependent: https://floating-ui.com/docs/middleware
    const middleware = [
      offset({ mainAxis: this.distance, crossAxis: this.skidding })
    ];

    if (this.sync) {
      middleware.push(
        size({
          apply: ({ rects }) => {
            const syncWidth = this.sync === 'width' || this.sync === 'both';
            const syncHeight = this.sync === 'height' || this.sync === 'both';
            this.style.width = syncWidth ? `${rects.reference.width}px` : '';
            this.style.height = syncHeight ? `${rects.reference.height}px` : '';
          }
        })
      );
    } else {
      this.style.width = '';
      this.style.height = '';
    }

    if (this.flip) {
      middleware.push(
        flip({
          padding: this.flipPadding
        })
      );
    }

    if (this.shift) {
      middleware.push(
        shift({
          boundary: this.shiftBoundary,
          padding: this.shiftPadding
        })
      );
    }

    if (this.autoSize) {
      middleware.push(
        size({
          boundary: this.autoSizeBoundary,
          padding: this.autoSizePadding,
          apply: ({ availableWidth, availableHeight }) => {
            if (this.autoSize === 'vertical' || this.autoSize === 'both') {
              this.style.setProperty('--auto-size-available-height', `${availableHeight}px`);
            } else {
              this.style.removeProperty('--auto-size-available-height');
            }

            if (this.autoSize === 'horizontal' || this.autoSize === 'both') {
              this.style.setProperty('--auto-size-available-width', `${availableWidth}px`);
            } else {
              this.style.removeProperty('--auto-size-available-width');
            }
          }
        })
      );
    } else {
      this.style.removeProperty('--auto-size-available-width');
      this.style.removeProperty('--auto-size-available-height');
    }

    // A top-layer popup is laid out against the viewport, never an offset parent.
    const strategy = this.topLayer ? 'fixed' : this.strategy;

    const getOffsetParent =
      strategy === 'absolute'
        ? (element: Element) => platform.getOffsetParent(element, offsetParent)
        : platform.getOffsetParent;

    computePosition(this.anchorEl, this, {
      placement: this.placement,
      middleware,
      strategy,
      platform: {
        ...platform,
        getOffsetParent
      }
    }).then(({ x, y, placement }) => {

      this.setAttribute('data-current-placement', placement);

      Object.assign(this.style, {
        left: `${x}px`,
        top: `${y}px`
      });

      // Chrome can give a top-layer popover inside a scrolled container a
      // shifted containing block, so the offsets above land somewhere else.
      // Measure where it actually is and take the difference out.
      if (this.topLayer && this.matches(':popover-open')) {
        const rect = this.getBoundingClientRect();
        const dx = rect.left - x;
        const dy = rect.top - y;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          Object.assign(this.style, {
            left: `${x - dx}px`,
            top: `${y - dy}px`
          });
        }
      }
    });

    const repositionEvent = new Event('pp-reposition', { bubbles: true, cancelable: false, composed: true });
    this.dispatchEvent(repositionEvent);

  }
}

// Component registration is handled by the centralized registry
declare global {
  interface HTMLElementTagNameMap {
    'pp-popup': PpPopup;
  }
}
