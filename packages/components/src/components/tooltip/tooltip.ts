import { animateTo, parseDuration, stopAnimations } from '../../utility/animate.js';
import { getAnimation, setDefaultAnimation } from '../../utility/animation-registry.js';
import { LitElement, html } from 'lit';
import { property, query } from 'lit/decorators.js';
import { waitForEvent } from '../../utility/event.js';
import { watch } from '../../utility/watch.js';
import { PpPopup } from '../popup/popup.js';

/**
 * @summary Tooltips display additional information based on a specific action.
 * @status draft
 * @since 0.1
 *
 * @dependency pp-popup
 *
 * Composite enhancement (rung 2): the author's first child is the tooltip's
 * target; the element appends the `pp-popup` + body it owns and renders the
 * `content` attribute into it. Styles: `src/styles/tooltip.css`.
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
export class PpTooltip extends LitElement {
  static dependencies = { 'pp-popup': PpPopup };

  protected createRenderRoot() {
    return this;
  }

  private hoverTimeout: number;
  private closeWatcher: CloseWatcher | null;

  @query('.tooltip__body') body: HTMLElement;
  @query('pp-popup') popup: PpPopup;

  @property() content = '';

  @property() placement:
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

  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Number }) distance = 8;
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: Number }) skidding = 0;
  @property() trigger = 'hover focus';
  @property({ type: Boolean }) hoist = false;

  constructor() {
    super();
    this.addEventListener('blur', this.handleBlur, true);
    this.addEventListener('focus', this.handleFocus, true);
    this.addEventListener('click', this.handleClick);
    this.addEventListener('mouseover', this.handleMouseOver);
    this.addEventListener('mouseout', this.handleMouseOut);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Cleanup this event in case the tooltip is removed while open
    this.closeWatcher?.destroy();
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
  }

  /** The author's target element: the first element child the component doesn't own. */
  get target(): HTMLElement | null {
    return ([...this.children] as HTMLElement[]).find(el => el.tagName.toLowerCase() !== 'pp-popup') ?? null;
  }

  firstUpdated() {
    this.body.hidden = !this.open;
    this.popup.anchor = this.target ?? undefined as unknown as Element;

    // If the tooltip is visible on init, update its position
    if (this.open) {
      this.popup.active = true;
      this.popup.reposition();
    }
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

  @watch('open', { waitUntilFirstUpdate: true })
  async handleOpenChange() {
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

  @watch(['content', 'distance', 'hoist', 'placement', 'skidding'])
  async handleOptionsChange() {
    if (this.hasUpdated) {
      await this.updateComplete;
      this.popup.reposition();
    }
  }

  @watch('disabled')
  handleDisabledChange() {
    if (this.disabled && this.open) {
      this.hide();
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

  // aria-live is used instead of aria-labelledby to trick screen readers into announcing the content.
  render() {
    return html`
      <pp-popup
        placement=${this.placement}
        distance=${this.distance}
        skidding=${this.skidding}
        strategy=${this.hoist ? 'fixed' : 'absolute'}
        flip
        shift
      >
        <div class="tooltip__body" role="tooltip" aria-live=${this.open ? 'polite' : 'off'}>${this.content}</div>
      </pp-popup>
    `;
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
