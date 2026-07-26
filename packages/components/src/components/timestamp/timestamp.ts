import { LitElement, html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { describeTimestamp, type DateInput, type Locale } from '@shared/format';

/**
 * @summary A timestamp that keeps the value it stands for.
 * @status draft
 * @since 0.0.1
 *
 * Relative text — `9 months ago` — is a claim about what the actor still
 * remembers, and it costs them the actual value. So it always ships inside
 * `<time datetime>` carrying the machine-readable instant, and the absolute
 * value stays reachable *without hovering*: a `title` alone has no
 * keyboard-native trigger, and screen readers announce the visible text and
 * skip it. The absolute value therefore sits in the element's own content,
 * visually hidden, where it is announced rather than inferred; `title` is a
 * convenience for sighted actors with a mouse, not the mechanism.
 *
 * Renders into the light DOM, so the `<time>` is a real element of the
 * document and the page's own `.visually-hidden` applies to it.
 *
 * See Storybook `Components/Timestamp` and `Foundations/Figures`.
 */

const TICK = 60_000;

/**
 * Relative text goes stale where it stands: `20 minutes ago` is wrong a minute
 * later and nothing re-renders it. One shared interval ticks the elements
 * currently *showing* relative text — an absolute date needs no ticking, and
 * with none on screen the interval doesn't run at all.
 */
const ticking = new Set<PpTimestamp>();
let interval: ReturnType<typeof setInterval> | undefined;

const startTicking = (element: PpTimestamp): void => {
  ticking.add(element);
  interval ??= setInterval(() => {
    for (const live of ticking) live.requestUpdate();
  }, TICK);
};

const stopTicking = (element: PpTimestamp): void => {
  ticking.delete(element);
  if (ticking.size === 0 && interval !== undefined) {
    clearInterval(interval);
    interval = undefined;
  }
};

export class PpTimestamp extends LitElement {
  /** Light DOM: the `<time>` belongs to the document, not to a shadow root. */
  protected createRenderRoot() {
    return this;
  }

  /** The instant. An ISO 8601 string as an attribute; any `DateInput` as a property. */
  @property() value: DateInput = '';

  /** Only for a caller holding an actor's stated preference; otherwise resolved. */
  @property() locale?: Locale;

  #relative = false;

  connectedCallback(): void {
    super.connectedCallback();
    // Moving an element in the DOM disconnects it without recreating it, and
    // Lit doesn't re-render on reconnect — so rejoin explicitly or the text
    // stays frozen at whatever it said before the move.
    if (this.#relative) startTicking(this);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    stopTicking(this);
  }

  protected updated(): void {
    if (this.#relative) startTicking(this);
    else stopTicking(this);
  }

  render() {
    if (this.value === '' || this.value == null) {
      this.#relative = false;
      return nothing;
    }

    const { text, datetime, absolute, isRelative } = describeTimestamp(this.value, this.locale);
    this.#relative = isRelative;

    return html`<time datetime=${datetime} title=${isRelative ? absolute : nothing}
      >${text}${isRelative
        ? html`<span class="visually-hidden"> (${absolute})</span>`
        : nothing}</time
    >`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pp-timestamp': PpTimestamp;
  }
}
