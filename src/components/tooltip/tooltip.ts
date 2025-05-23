import { animateTo, parseDuration, stopAnimations } from '../../utility/animate.js';
import { classMap } from 'lit/directives/class-map.js';
import { getAnimation, setDefaultAnimation } from '../../utility/animation-registry.js';
import { LitElement, html, unsafeCSS } from 'lit';
import { property, query } from 'lit/decorators.js';
import { waitForEvent } from '../../utility/event.js';
import { watch } from '../../utility/watch.js';
import { PpPopup } from '../popup/popup.js';
import styles from './tooltip.css?inline';
import type { CSSResultGroup } from 'lit';

/**
 * @summary Tooltips display additional information based on a specific action.
 * @status draft
 * @since 0.1
 *
 * @dependency pp-popup
 *
 * @slot - The tooltip's target element. Avoid slotting in more than one element, as subsequent ones will be ignored.
 * @slot content - The content to render in the tooltip. Alternatively, you can use the `content` attribute.
 *
 * @event pp-show - Emitted when the tooltip begins to show.
 * @event pp-after-show - Emitted after the tooltip has shown and all animations are complete.
 * @event pp-hide - Emitted when the tooltip begins to hide.
 * @event pp-after-hide - Emitted after the tooltip has hidden and all animations are complete.
 *
 * @csspart base - The component's base wrapper, an `<pp-popup>` element.
 * @csspart base__popup - The popup's exported `popup` part. Use this to target the tooltip's popup container.
 * @csspart body - The tooltip's body where its content is rendered.
 *
 * @cssproperty --max-width - The maximum width of the tooltip before its content will wrap.
 * @cssproperty --hide-delay - The amount of time to wait before hiding the tooltip when hovering.
 * @cssproperty --show-delay - The amount of time to wait before showing the tooltip when hovering.
 *
 * @animation tooltip.show - The animation to use when showing the tooltip.
 * @animation tooltip.hide - The animation to use when hiding the tooltip.
 */
export class PpTooltip extends LitElement {
  static styles: CSSResultGroup = [unsafeCSS(styles)];
  static dependencies = { 'pp-popup': PpPopup };

  private hoverTimeout: number;
  private closeWatcher: CloseWatcher | null;

  @query('slot:not([name])') defaultSlot: HTMLSlotElement;
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

  firstUpdated() {
    this.body.hidden = !this.open;

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
      await animateTo(this.popup.popup, keyframes, options);
      this.popup.reposition();
      this.dispatchEvent(new Event('pp-after-show', { bubbles: true, cancelable: false, composed: true }))
    } else {
      // Hide
      this.dispatchEvent(new Event('pp-hide', { bubbles: true, cancelable: false, composed: true }))
      this.closeWatcher?.destroy();
      document.removeEventListener('keydown', this.handleDocumentKeyDown);

      await stopAnimations(this.body);
      const { keyframes, options } = getAnimation(this, 'tooltip.hide');
      await animateTo(this.popup.popup, keyframes, options);
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

  // aria-live us used instead of aria-labelledby to trick screen readers into announcing the content.
  // aria-describedby is added to a slot, which is required by <pp-popup> to correctly locate the first assigned element
  render() {
    return html`
      <pp-popup
        part="base"
        exportparts="popup:base__popup"
        class=${classMap({
      tooltip: true,
      'tooltip--open': this.open
    })}
        placement=${this.placement}
        distance=${this.distance}
        skidding=${this.skidding}
        strategy=${this.hoist ? 'fixed' : 'absolute'}
        flip
        shift
        hover-bridge
      >
        ${'' /* eslint-disable-next-line lit-a11y/no-aria-slot */}
        <slot slot="anchor" aria-describedby="tooltip"></slot>

        ${'' /* eslint-disable-next-line lit-a11y/accessible-name */}
        <div part="body" id="tooltip" class="tooltip__body" role="tooltip" aria-live=${this.open ? 'polite' : 'off'}>
          <slot name="content">${this.content}</slot>
        </div>
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

customElements.define('pp-tooltip', PpTooltip);
declare global {
  interface HTMLElementTagNameMap {
    "pp-tooltip": PpTooltip;
  }
}