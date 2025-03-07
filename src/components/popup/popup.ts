import { autoUpdate, computePosition, flip, offset, platform, shift, size } from '@floating-ui/dom';
import { classMap } from 'lit/directives/class-map.js';
import { LitElement, html, unsafeCSS } from 'lit';
import { offsetParent } from 'composed-offset-position';
import { property, query } from 'lit/decorators.js';
import styles from './popup.css?inline';

import type { CSSResultGroup } from 'lit';

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
 * @slot - The popup's content.
 * @slot anchor - The element the popup will be anchored to.
 *
 * @csspart popup - The popup's container. Useful for setting a background color, box shadow, etc.
 * @csspart hover-bridge - The hover bridge element. Only available when the `hover-bridge` option is enabled.
 *
 */

export class PpPopup extends LitElement {
  static styles: CSSResultGroup = [unsafeCSS(styles)];

  private anchorEl: Element | VirtualElement | null;
  private cleanup: ReturnType<typeof autoUpdate> | undefined;

  @query('.popup') popup: HTMLElement;

  /**
   * The element the popup will be anchored to. If the anchor lives outside of the popup, you can provide the anchor
   * element `id`, a DOM element reference, or a `VirtualElement`. If the anchor lives inside the popup, use the
   * `anchor` slot instead.
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

  async connectedCallback() {
    super.connectedCallback();

    await this.updateComplete;
    this.start();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stop();
  }

  async updated(changedProps: Map<string, unknown>) {
    super.updated(changedProps);

    if (changedProps.has('active')) {
      if (this.active) {
        this.start();
      } else {
        this.stop();
      }
    }

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
      this.anchorEl = this.querySelector<HTMLElement>('[slot="anchor"]');
    }

    if (this.anchorEl instanceof HTMLSlotElement) {
      this.anchorEl = this.anchorEl.assignedElements({ flatten: true })[0] as HTMLElement;
    }

    if (this.anchorEl) {
      this.start();
    }
  }

  private start() {
    if (!this.anchorEl) {
      return;
    }

    this.cleanup = autoUpdate(this.anchorEl, this.popup, () => {
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
            this.popup.style.width = syncWidth ? `${rects.reference.width}px` : '';
            this.popup.style.height = syncHeight ? `${rects.reference.height}px` : '';
          }
        })
      );
    } else {
      this.popup.style.width = '';
      this.popup.style.height = '';
    }

    if (this.flip) {
      middleware.push(
        flip({
          // @ts-expect-error - We're converting a string attribute to an array here
          fallbackPlacements: this.flipFallbackPlacements,
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

    const getOffsetParent =
      this.strategy === 'absolute'
        ? (element: Element) => platform.getOffsetParent(element, offsetParent)
        : platform.getOffsetParent;

    computePosition(this.anchorEl, this.popup, {
      placement: this.placement,
      middleware,
      strategy: this.strategy,
      platform: {
        ...platform,
        getOffsetParent
      }
    }).then(({ x, y, placement }) => {

      this.setAttribute('data-current-placement', placement);

      Object.assign(this.popup.style, {
        left: `${x}px`,
        top: `${y}px`
      });
    });

    const repositionEvent = new Event('pp-reposition', { bubbles: true, cancelable: false, composed: true });
    this.dispatchEvent(repositionEvent);

  }

  render() {
    return html`
      <slot name="anchor" @slotchange=${this.handleAnchorChange}></slot>
      <div
        part="popup"
        class=${classMap({
      popup: true,
      'popup--active': this.active,
      'popup--fixed': this.strategy === 'fixed'
    })}
      >
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('pp-popup', PpPopup);
declare global {
  interface HTMLElementTagNameMap {
    'pp-popup': PpPopup;
  }
}