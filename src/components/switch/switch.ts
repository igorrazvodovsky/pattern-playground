import { html, LitElement, unsafeCSS } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { property, query, state } from 'lit/decorators.js';
import type { CSSResultGroup } from 'lit';
import styles from './switch.css?inline';
import { textFromIdRefs } from '../../utility/accessible-name.js';

/**
 * Switch lands a binary preference the moment the actor flips it — no submit step in between.
 * @status draft
 * @since 0.0.1
 *
 * @cssproperty --switch-track-color - Track colour when off. Defaults to `--c-border`.
 * @cssproperty --switch-on-color - Track colour when on. Defaults to `--c-accent-600`.
 * @cssproperty --switch-thumb-size - Diameter of the thumb. Defaults to `1rem`.
 */
export class PpSwitch extends LitElement {
  static styles: CSSResultGroup = [unsafeCSS(styles)];

  @query('.switch__control') input!: HTMLInputElement;
  @state() private hasFocus = false;

  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property() name = '';
  @property() label = '';
  @property() labelledby = '';
  @property() describedby = '';
  @property({ reflect: true }) size: 'small' | 'medium' | 'large' = 'medium';
  @property({ type: Boolean, reflect: true }) required = false;

  connectedCallback() {
    super.connectedCallback();
    if (document.readyState !== 'loading') {
      this.init();
      return;
    }
    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  private init() {}

  private handleChange = (event: Event) => {
    event.stopPropagation();
    this.checked = this.input.checked;
    this.dispatchEvent(new CustomEvent('change', {
      detail: { checked: this.checked },
      bubbles: true,
      composed: true,
    }));
  };

  private handleFocus = () => { this.hasFocus = true; };
  private handleBlur = () => { this.hasFocus = false; };

  async focus(options?: FocusOptions) {
    await this.updateComplete;
    this.input?.focus(options);
  }

  async blur() {
    await this.updateComplete;
    this.input?.blur();
  }

  render() {
    const accessibleName = this.label || textFromIdRefs(this.labelledby, this.getRootNode() as Document | ShadowRoot);
    const labelledby = accessibleName ? undefined : this.labelledby || undefined;

    return html`
      <div
        class=${classMap({
          switch: true,
          'switch--small': this.size === 'small',
          'switch--medium': this.size === 'medium',
          'switch--large': this.size === 'large',
          'switch--checked': this.checked,
          'switch--disabled': this.disabled,
          'switch--focused': this.hasFocus,
        })}
      >
        <input
          class="switch__control"
          type="checkbox"
          role="switch"
          name=${ifDefined(this.name || undefined)}
          .checked=${live(this.checked)}
          ?disabled=${this.disabled}
          ?required=${this.required}
          aria-checked=${this.checked ? 'true' : 'false'}
          aria-label=${ifDefined(accessibleName || undefined)}
          aria-labelledby=${ifDefined(labelledby)}
          aria-describedby=${ifDefined(this.describedby || undefined)}
          @change=${this.handleChange}
          @focus=${this.handleFocus}
          @blur=${this.handleBlur}
        />
        <span class="switch__track" aria-hidden="true">
          <span class="switch__thumb"></span>
        </span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pp-switch': PpSwitch;
  }
}
