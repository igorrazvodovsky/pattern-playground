// A pane's identity is its page path: `/patterns/<slug>`, `/sequences/<id>`,
// `/concepts/<id>` or `/languages/<id>`, no trailing slash, no hash. Everything that compares, keys,
// or fetches panes goes through these helpers so the kinds cannot drift apart.

export type PaneKind = 'pattern' | 'sequence' | 'concept' | 'language';

const KINDS = ['pattern', 'sequence', 'concept', 'language'] as const;

const PREFIX: Record<PaneKind, string> = {
  pattern: '/patterns/',
  sequence: '/sequences/',
  concept: '/concepts/',
  language: '/languages/',
};

// The region label for a pane of each kind.
export const PANE_LABEL: Record<PaneKind, string> = {
  pattern: 'Pattern',
  sequence: 'Sequence',
  concept: 'Concept',
  language: 'Language',
};

// Sequence, concept and language panes take a prefix in the `stackedNotes` param
// so their ids cannot collide with a pattern slug (a concept and a pattern often share a
// stem). Pattern panes keep the bare slug, so URLs shared before the other kinds
// could stack still restore.
const PARAM_PREFIX: Partial<Record<PaneKind, string>> = {
  sequence: 'seq:',
  concept: 'concept:',
  language: 'lang:',
};

export function panePath(kind: PaneKind, id: string): string {
  return PREFIX[kind] + id;
}

// Trailing slashes vary by link source and by Astro's directory-format
// output; pane paths and graph paths carry none.
export function normalisePath(path: string): string {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

// The stack index of the pane holding `el`; 0 (the page itself) outside any pane.
export function paneIndexOf(el: Element | null | undefined): number {
  return parseInt(el?.closest<HTMLElement>('[data-pane-index]')?.dataset.paneIndex ?? '0', 10);
}

// Parse a pathname into a pane's kind and id. Returns null for anything that
// is not a single-segment pattern, sequence, concept or language page (including the
// `/pane/` partials themselves).
export function parsePanePath(pathname: string): { kind: PaneKind; id: string } | null {
  for (const kind of KINDS) {
    const prefix = PREFIX[kind];
    if (!pathname.startsWith(prefix)) continue;
    const id = normalisePath(pathname.slice(prefix.length));
    if (!id || id.includes('/')) return null;
    return { kind, id };
  }
  return null;
}

export function paneKindOf(path: string): PaneKind {
  return KINDS.find((kind) => kind !== 'pattern' && path.startsWith(PREFIX[kind])) ?? 'pattern';
}

// A `stackedNotes` value: the pane's param form plus its section anchor, if
// any. '#' is percent-encoded by URLSearchParams, so the anchor survives as
// part of the value.
export function encodePaneParam(path: string, hash?: string): string {
  const parsed = parsePanePath(path);
  const base = parsed ? (PARAM_PREFIX[parsed.kind] ?? '') + parsed.id : path;
  return hash ? base + hash : base;
}

export function decodePaneParam(value: string): { path: string; hash?: string } {
  const i = value.indexOf('#');
  const head = i === -1 ? value : value.slice(0, i);
  const hash = i === -1 ? undefined : value.slice(i);
  const prefixed = KINDS.find((kind) => {
    const prefix = PARAM_PREFIX[kind];
    return prefix !== undefined && head.startsWith(prefix);
  });
  const path = prefixed
    ? panePath(prefixed, head.slice(PARAM_PREFIX[prefixed]!.length))
    : panePath('pattern', head);
  return { path, hash };
}

export function buildURL(panes: { path: string; hash?: string }[]): string {
  if (panes.length === 0) return '/';
  const [first, ...rest] = panes;
  // Pane 0 is the page itself, so its anchor is the URL's own fragment.
  const fragment = first.hash ?? '';
  if (rest.length === 0) return first.path + fragment;
  const params = new URLSearchParams();
  // A pane's section anchor is part of its address, so a shared or reloaded
  // stack restores anchor positions, not just panes.
  for (const pane of rest) params.append('stackedNotes', encodePaneParam(pane.path, pane.hash));
  // URLSearchParams percent-encodes a prefix's ':'. It is legal in a query
  // string, so put it back to keep shared URLs readable; getAll decodes both.
  let query = params.toString();
  for (const prefix of Object.values(PARAM_PREFIX)) {
    query = query.replaceAll(`=${encodeURIComponent(prefix)}`, `=${prefix}`);
  }
  return `${first.path}?${query}${fragment}`;
}
