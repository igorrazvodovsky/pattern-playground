import { LitElement, html, CSSResultGroup, unsafeCSS } from 'lit';
import { property, customElement, state, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './button.css?inline';

/**
 * @summary Buttons represent actions that are available to the user.
 * @status draft
 * @since 0.0.1
 *
 * @dependency ir-icon
 * @dependency ir-spinner
 */

export interface ButtonProps {
  size?: 'small' | 'medium' | 'large';
  label: string;
  onClick?: () => void;
  loading: boolean;
}

@customElement('ir-button')

export class Button extends LitElement {
  static styles: CSSResultGroup = [unsafeCSS(styles)];

  render() {
    return html`
      <button class="button">
        <slot></slot>
      </button>
    `;
  }

}

