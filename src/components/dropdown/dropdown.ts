// TODO:
// Submenu
// Positioning glitch

import { animateTo, stopAnimations } from '../../utility/animate.js';
import { classMap } from 'lit/directives/class-map.js';
import { getAnimation, setDefaultAnimation } from '../../utility/animation-registry';
import { getTabbableBoundary } from '../../utility/tabbable.js';
import { LitElement, html, unsafeCSS } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { property, query } from 'lit/decorators.js';
import { waitForEvent } from '../../utility/event';
import { watch } from '../../utility/watch.js';
import { PpPopup } from '../popup/popup.js';
import styles from './dropdown.css?inline';
import type { CSSResultGroup } from 'lit';
import type { PpButton } from '../button/button';
import type { PpList } from '../list/list';
import type { PpListItem } from '../list-item/list-item';

/**
 * @summary Show additional content that "drops down" in a panel.
 * @status draft
 * @since 0.1
 *
 * @dependency pp-popup
 *
 * @slot - The dropdown's main content.
 * @slot trigger - The dropdown's trigger, usually a `<button>`.
 *
 * @event pp-show - Emitted when the dropdown opens.
 * @event pp-after-show - Emitted after the dropdown opens and all animations are complete.
 * @event pp-hide - Emitted when the dropdown closes.
 * @event pp-after-hide - Emitted after the dropdown closes and all animations are complete.
 *
 * @csspart base - The component's base wrapper.
 * @csspart trigger - The container that wraps the trigger.
 * @csspart panel - The panel that gets shown when the dropdown is open.
 *
 * @animation dropdown.show - The animation to use when showing the dropdown.
 * @animation dropdown.hide - The animation to use when hiding the dropdown.
 */

type PpSelectEvent = CustomEvent<{ item: PpListItem }>;

export class PpDropdown extends LitElement {
  static styles: CSSResultGroup = [unsafeCSS(styles)];
  static dependencies = { 'pp-popup': PpPopup };

  @query('.dropdown') popup: PpPopup;
  @query('.dropdown__trigger') trigger: HTMLSlotElement;
  @query('.dropdown__panel') panel: HTMLSlotElement;

  private closeWatcher: CloseWatcher | null;

  @property({ type: Boolean, reflect: true }) open = false;
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
    | 'left-end' = 'bottom-start';

  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ attribute: 'stay-open-on-select', type: Boolean, reflect: true }) stayOpenOnSelect = false;
  @property({ attribute: false }) containingElement?: HTMLElement;
  @property({ type: Number }) distance = 4;
  @property({ type: Number }) skidding = 0;
  @property({ type: Boolean }) hoist = false;
  @property({ reflect: true }) sync: 'width' | 'height' | 'both' | undefined = undefined;

  connectedCallback() {
    super.connectedCallback();

    if (!this.containingElement) {
      this.containingElement = this;
    }
  }

  firstUpdated() {
    this.panel.hidden = !this.open;

    if (this.open) {
      this.addOpenListeners();
      this.popup.active = true;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeOpenListeners();
    this.hide();
  }

  focusOnTrigger() {
    const trigger = this.trigger.assignedElements({ flatten: true })[0] as HTMLElement | undefined;
    if (typeof trigger?.focus === 'function') {
      trigger.focus();
    }
  }

  getList() {
    return this.panel.assignedElements({ flatten: true }).find(el => el.tagName.toLowerCase() === 'pp-list') as
      | PpList
      | undefined;
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (this.open && event.key === 'Escape') {
      event.stopPropagation();
      this.hide();
      this.focusOnTrigger();
    }
  };

  private handleDocumentKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.open && !this.closeWatcher) {
      event.stopPropagation();
      this.focusOnTrigger();
      this.hide();
      return;
    }

    if (event.key === 'Tab') {
      if (this.open && document.activeElement?.tagName.toLowerCase() === 'pp-list-item') {
        event.preventDefault();
        this.hide();
        this.focusOnTrigger();
        return;
      }

      // If the dropdown is used within a shadow DOM, we need to obtain the activeElement within that shadowRoot,
      // otherwise `document.activeElement` will only return the name of the parent shadow DOM element.
      setTimeout(() => {
        const activeElement =
          this.containingElement?.getRootNode() instanceof ShadowRoot
            ? document.activeElement?.shadowRoot?.activeElement
            : document.activeElement;

        if (
          !this.containingElement ||
          activeElement?.closest(this.containingElement.tagName.toLowerCase()) !== this.containingElement
        ) {
          this.hide();
        }
      });
    }
  };

  private handleDocumentMouseDown = (event: MouseEvent) => {
    const path = event.composedPath();
    if (this.containingElement && !path.includes(this.containingElement)) {
      this.hide();
    }
  };

  private handlePanelSelect = (event: PpSelectEvent) => {
    const target = event.target as HTMLElement;

    if (!this.stayOpenOnSelect && target.tagName.toLowerCase() === 'pp-list') {
      this.hide();
      this.focusOnTrigger();
    }
  };

  handleTriggerClick() {
    if (this.open) {
      this.hide();
    } else {
      this.show();
      this.focusOnTrigger();
    }
  }

  async handleTriggerKeyDown(event: KeyboardEvent) {
    if ([' ', 'Enter'].includes(event.key)) {
      event.preventDefault();
      this.handleTriggerClick();
      return;
    }

    const list = this.getList();

    if (list) {
      const listItems = list.getAllItems();
      const firstListItem = listItems[0];
      const lastListItem = listItems[listItems.length - 1];

      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();

        if (!this.open) {
          this.show();

          await this.updateComplete;
        }

        if (listItems.length > 0) {
          this.updateComplete.then(() => {
            if (event.key === 'ArrowDown' || event.key === 'Home') {
              list.setCurrentItem(firstListItem);
              firstListItem.focus();
            }

            if (event.key === 'ArrowUp' || event.key === 'End') {
              list.setCurrentItem(lastListItem);
              lastListItem.focus();
            }
          });
        }
      }
    }
  }

  handleTriggerKeyUp(event: KeyboardEvent) {
    // Prevent space from triggering a click event in Firefox
    if (event.key === ' ') {
      event.preventDefault();
    }
  }

  handleTriggerSlotChange() {
    this.updateAccessibleTrigger();
  }

  // Slotted triggers can be arbitrary content, but we need to link them to the dropdown panel with `aria-haspopup` and
  // `aria-expanded`. These must be applied to the "accessible trigger" (the tabbable portion of the trigger element
  // that gets slotted in) so screen readers will understand them. For example, the accessible trigger of an <pp-button>
  // is a <button> located inside its shadow root. To determine this, we assume the first tabbable element in the trigger
  // slot is the "accessible trigger."

  updateAccessibleTrigger() {
    const assignedElements = this.trigger.assignedElements({ flatten: true }) as HTMLElement[];
    const accessibleTrigger = assignedElements.find(el => getTabbableBoundary(el).start);
    let target: HTMLElement;

    if (accessibleTrigger) {
      switch (accessibleTrigger.tagName.toLowerCase()) {
        case 'pp-button':
          target = (accessibleTrigger as PpButton).button;
          break;

        default:
          target = accessibleTrigger;
      }

      target.setAttribute('aria-haspopup', 'true');
      target.setAttribute('aria-expanded', this.open ? 'true' : 'false');
    }
  }

  async show() {
    if (this.open) {
      return undefined;
    }

    this.open = true;
    return waitForEvent(this, 'pp-after-show');
  }

  async hide() {
    if (!this.open) {
      return undefined;
    }

    this.open = false;
    return waitForEvent(this, 'pp-after-hide');
  }

  reposition() {
    this.popup.reposition();
  }

  addOpenListeners() {
    this.panel.addEventListener('pp-select', this.handlePanelSelect);
    if ('CloseWatcher' in window) {
      this.closeWatcher?.destroy();
      this.closeWatcher = new CloseWatcher();
      this.closeWatcher.onclose = () => {
        this.hide();
        this.focusOnTrigger();
      };
    } else {
      this.panel.addEventListener('keydown', this.handleKeyDown);
    }
    document.addEventListener('keydown', this.handleDocumentKeyDown);
    document.addEventListener('mousedown', this.handleDocumentMouseDown);
  }

  removeOpenListeners() {
    if (this.panel) {
      this.panel.removeEventListener('pp-select', this.handlePanelSelect);
      this.panel.removeEventListener('keydown', this.handleKeyDown);
    }
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
    document.removeEventListener('mousedown', this.handleDocumentMouseDown);
    this.closeWatcher?.destroy();
  }

  @watch('open', { waitUntilFirstUpdate: true })
  async handleOpenChange() {
    if (this.disabled) {
      this.open = false;
      return;
    }

    this.updateAccessibleTrigger();

    if (this.open) {

      this.dispatchEvent(new Event('pp-show', { bubbles: true, cancelable: false, composed: true }))
      this.addOpenListeners();

      await stopAnimations(this);
      this.panel.hidden = false;
      this.popup.active = true;
      const { keyframes, options } = getAnimation(this, 'dropdown.show');
      await animateTo(this.popup, keyframes, options);

      this.dispatchEvent(new Event('pp-after-show', { bubbles: true, cancelable: false, composed: true }))

    } else {
      this.dispatchEvent(new Event('pp-hide', { bubbles: true, cancelable: false, composed: true }))
      this.removeOpenListeners();

      await stopAnimations(this);
      const { keyframes, options } = getAnimation(this, 'dropdown.hide');
      await animateTo(this.popup, keyframes, options);
      this.panel.hidden = true;
      this.popup.active = false;

      this.dispatchEvent(new Event('pp-after-hide', { bubbles: true, cancelable: false, composed: true }))
    }
  }

  render() {
    return html`
      <pp-popup
        part="base"
        id="dropdown"
        placement=${this.placement}
        distance=${this.distance}
        skidding=${this.skidding}
        strategy=${this.hoist ? 'fixed' : 'absolute'}
        flip
        shift
        auto-size="vertical"
        auto-size-padding="10"
        sync=${ifDefined(this.sync ? this.sync : undefined)}
        class=${classMap({
      dropdown: true,
      'dropdown--open': this.open
    })}
      >
        <slot
          name="trigger"
          slot="anchor"
          part="trigger"
          class="dropdown__trigger"
          @click=${this.handleTriggerClick}
          @keydown=${this.handleTriggerKeyDown}
          @keyup=${this.handleTriggerKeyUp}
          @slotchange=${this.handleTriggerSlotChange}
        ></slot>

        <div aria-hidden=${this.open ? 'false' : 'true'} aria-labelledby="dropdown">
          <slot part="panel" class="dropdown__panel"></slot>
        </div>
      </pp-popup>
    `;
  }
}

setDefaultAnimation('dropdown.show', {
  keyframes: [
    { opacity: 0, scale: 0.9 },
    { opacity: 1, scale: 1 }
  ],
  options: { duration: 100, easing: 'ease' }
});

setDefaultAnimation('dropdown.hide', {
  keyframes: [
    { opacity: 1, scale: 1 },
    { opacity: 0, scale: 0.9 }
  ],
  options: { duration: 100, easing: 'ease' }
});

customElements.define('pp-dropdown', PpDropdown);
declare global {
  interface HTMLElementTagNameMap {
    "pp-dropdown": PpDropdown;
  }
}
