export class PpH extends HTMLElement {}

// Component registration is handled by the centralized registry
declare global {
  interface HTMLElementTagNameMap {
    'pp-h': PpH;
  }
}
