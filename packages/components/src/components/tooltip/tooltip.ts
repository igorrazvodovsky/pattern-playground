import { animateTo, parseDuration, stopAnimations } from '../../utility/animate.js';
import { getAnimation, setDefaultAnimation } from '../../utility/animation-registry.js';
import { Elena } from '@elenajs/core';
import { waitForEvent } from '../../utility/event.js';
import { PpPopup } from '../popup/popup.js';

/**
 * @summary Tooltips display additional information based on a specific action.
 * @status draft
 * @since 0.1
 *
 * @dependency pp-popup
 *
 * The author's first child is the tooltip's
 * target; the element builds the `pp-popup` + body it owns imperatively once
 * and writes the `content` attribute into the body as text. No template —
 * reactive updates push configuration onto the owned popup in `updated()`.
 * Styles: `src/styles/tooltip.css`.
 *
 * @event pp-show - Emitted when the tooltip begins to show.
 * @event pp-after-show - Emitted after the tooltip has shown and all animations are complete.
 * @event pp-hide - Emitted when the tooltip begins to hide.
 * @event pp-after-hide - Emitted after the tooltip has hidden and all animations are complete.
 *
 * @cssproperty --max-width - The maximum width of the tooltip before its content will wrap.
 * @cssproperty --hide-delay - The amount of time to wait before hiding the tooltip when hovering.
 * @cssproperty --show-delay - The amount of time to wait before showing the tooltip when hovering.
 *
 * @animation tooltip.show - The animation to use when showing the tooltip.
 * @animation tooltip.hide - The animation to use when hiding the tooltip.
 */
export class PpTooltip extends Elena(HTMLElement) {
  static tagName = 'pp-tooltip';

  static dependencies = { 'pp-popup': PpPopup };

  static props = [
    'content',
    'placement',
    'disabled',
    'distance',
    'open',
    'skidding',
    'trigger',
    'hoist',
  ];

  content = '';

  placement:
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'right'
    | 'right-start'
    | 'right-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'left'
    | 'left-start'
    | 'left-end' = 'top';

  disabled = false;
  distance = 8;
  open = false;
  skidding = 0;
  trigger = 'hover focus';
  hoist = false;

  private hoverTimeout!: number;
  private closeWatcher: CloseWatcher | null = null;

  /** The owned subtree, built once on first connect. */
  private popup!: PpPopup;
  private body!: HTMLElement;

  // Elena's updated() carries no changed-props map; previous values live here,
  // seeded in firstUpdated() so handlers only run on later changes.
  private prevOpen?: boolean;
  private prevDisabled?: boolean;
  private prevPlacementKey?: string;

  /** The author's target element: the first element child the component doesn't own. */
  get target(): HTMLElement | null {
    return ([...this.children] as HTMLElement[]).find(el => el.tagName.toLowerCase() !== 'pp-popup') ?? null;
  }

  connectedCallback() {
    this.buildOwnedSubtree();
    super.connectedCallback();
    this.addEventListener('blur', this.handleBlur, true);
    this.addEventListener('focus', this.handleFocus, true);
    this.addEventListener('click', this.handleClick);
    this.addEventListener('mouseover', this.handleMouseOver);
    this.addEventListener('mouseout', this.handleMouseOut);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('blur', this.handleBlur, true);
    this.removeEventListener('focus', this.handleFocus, true);
    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('mouseover', this.handleMouseOver);
    this.removeEventListener('mouseout', this.handleMouseOut);
    // Cleanup this event in case the tooltip is removed while open
    this.closeWatcher?.destroy();
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
  }

  private buildOwnedSubtree() {
    if (this.popup) return;
    // aria-live is used instead of aria-labelledby to trick screen readers into announcing the content.
    this.body = document.createElement('div');
    this.body.className = 'tooltip__body';
    this.body.setAttribute('role', 'tooltip');
    this.body.setAttribute('aria-live', 'off');
    this.body.hidden = true;
    this.popup = document.createElement('pp-popup') as PpPopup;
    this.popup.append(this.body);
    this.append(this.popup);
  }

  firstUpdated() {
    this.body.hidden = !this.open;
    this.popup.anchor = this.target ?? '';
    this.prevOpen = this.open;
    this.prevDisabled = this.disabled;

    // If the tooltip is visible on init, update its position
    if (this.open) {
      this.popup.active = true;
      this.popup.reposition();
    }
  }

  updated() {
    const popup = this.popup;
    if (!popup) return;

    popup.placement = this.placement;
    popup.distance = this.distance;
    popup.skidding = this.skidding;
    popup.strategy = this.hoist ? 'fixed' : 'absolute';
    popup.flip = true;
    popup.shift = true;

    this.body.setAttribute('aria-live', this.open ? 'polite' : 'off');
    if (this.body.textContent !== this.content) this.body.textContent = this.content;

    if (this.prevDisabled !== undefined && this.prevDisabled !== this.disabled) {
      this.prevDisabled = this.disabled;
      if (this.disabled && this.open) {
        this.hide();
      }
    }

    if (this.prevOpen !== undefined && this.prevOpen !== this.open) {
      this.prevOpen = this.open;
      this.handleOpenChange();
    }

    const placementKey = `${this.content}|${this.distance}|${this.hoist}|${this.placement}|${this.skidding}`;
    if (this.prevPlacementKey !== undefined && this.prevPlacementKey !== placementKey) {
      popup.reposition();
    }
    this.prevPlacementKey = placementKey;
  }

  private handleBlur = () => {
    if (this.hasTrigger('focus')) {
      this.hide();
    }
  };

  private handleClick = () => {
    if (this.hasTrigger('click')) {
      if (this.open) {
        this.hide();
      } else {
        this.show();
      }
    }
  };

  private handleFocus = () => {
    if (this.hasTrigger('focus')) {
      this.show();
    }
  };

  private handleDocumentKeyDown = (event: KeyboardEvent) => {
    // Pressing escape when a tooltip is open should dismiss it
    if (event.key === 'Escape') {
      event.stopPropagation();
      this.hide();
    }
  };

  private handleMouseOver = () => {
    if (this.hasTrigger('hover')) {
      const delay = parseDuration(getComputedStyle(this).getPropertyValue('--show-delay'));
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = window.setTimeout(() => this.show(), delay);
    }
  };

  private handleMouseOut = () => {
    if (this.hasTrigger('hover')) {
      const delay = parseDuration(getComputedStyle(this).getPropertyValue('--hide-delay'));
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = window.setTimeout(() => this.hide(), delay);
    }
  };

  private hasTrigger(triggerType: string) {
    const triggers = this.trigger.split(' ');
    return triggers.includes(triggerType);
  }

  private async handleOpenChange() {
    if (this.open) {
      if (this.disabled) {
        return;
      }

      // Show
      this.dispatchEvent(new Event('pp-show', { bubbles: true, cancelable: false, composed: true }))
      if ('CloseWatcher' in window) {
        this.closeWatcher?.destroy();
        this.closeWatcher = new CloseWatcher();
        this.closeWatcher.onclose = () => {
          this.hide();
        };
      } else {
        document.addEventListener('keydown', this.handleDocumentKeyDown);
      }

      await stopAnimations(this.body);
      this.body.hidden = false;
      this.popup.active = true;
      const { keyframes, options } = getAnimation(this, 'tooltip.show');
      await animateTo(this.popup, keyframes, options);
      this.popup.reposition();
      this.dispatchEvent(new Event('pp-after-show', { bubbles: true, cancelable: false, composed: true }))
    } else {
      // Hide
      this.dispatchEvent(new Event('pp-hide', { bubbles: true, cancelable: false, composed: true }))
      this.closeWatcher?.destroy();
      document.removeEventListener('keydown', this.handleDocumentKeyDown);

      await stopAnimations(this.body);
      const { keyframes, options } = getAnimation(this, 'tooltip.hide');
      await animateTo(this.popup, keyframes, options);
      this.popup.active = false;
      this.body.hidden = true;
      this.dispatchEvent(new Event('pp-after-hide', { bubbles: true, cancelable: false, composed: true }))

    }
  }

  /** Shows the tooltip. */
  async show() {
    if (this.open) {
      return undefined;
    }

    this.open = true;
    return waitForEvent(this, 'pp-after-show');
  }

  /** Hides the tooltip */
  async hide() {
    if (!this.open) {
      return undefined;
    }

    this.open = false;
    return waitForEvent(this, 'pp-after-hide');
  }
}

setDefaultAnimation('tooltip.show', {
  keyframes: [
    { opacity: 0, scale: 0.8 },
    { opacity: 1, scale: 1 }
  ],
  options: { duration: 150, easing: 'ease' }
});

setDefaultAnimation('tooltip.hide', {
  keyframes: [
    { opacity: 1, scale: 1 },
    { opacity: 0, scale: 0.8 }
  ],
  options: { duration: 150, easing: 'ease' }
});

declare global {
  interface HTMLElementTagNameMap {
    "pp-tooltip": PpTooltip;
  }
}
