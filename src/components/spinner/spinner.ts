import { LitElement, html, CSSResultGroup, unsafeCSS } from 'lit';
import styles from './spinner.css?inline';

/**
 * @summary Used to show the progress of an indeterminate operation.
 * @status draft
 * @since 0.0.1
 *
 * @cssproperty --track-width - The width of the track.
 * @cssproperty --track-color - The color of the track.
 * @cssproperty --indicator-color - The color of the spinner's indicator.
 * @cssproperty --speed - The time it takes for the spinner to complete one animation cycle.
 */

@customElement('pp-spinner')
export class Spinner extends LitElement {
  static styles: CSSResultGroup = [unsafeCSS(styles)];

  render() {
    return html`
      <svg part="base" class="spinner" role="progressbar" aria-label="loading">
        <circle class="spinner__track"></circle>
        <circle class="spinner__indicator"></circle>
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pp-spinner": Spinner;
  }
}