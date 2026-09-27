// A pane's identity is its page path: `/patterns/<slug>` or `/sequences/<id>`,
// no trailing slash, no hash. Everything that compares, keys, or fetches panes
// goes through these helpers so the two kinds cannot drift apart.

export type PaneKind = 'pattern' | 'sequence';

const PREFIX: Record<PaneKind, string> = {
  pattern: '/patterns/',
  sequence: '/sequences/',
};

// Sequence panes take a prefix in the `stackedNotes` param so a sequence id
// cannot collide with a pattern slug. Pattern panes keep the bare slug, so
// URLs shared before sequences could stack still restore.
const SEQUENCE_PARAM = 'seq:';

export function panePath(kind: PaneKind, id: string): string {
  return PREFIX[kind] + id;
}

// Parse a pathname into a pane's kind and id. Returns null for anything that
// is not a single-segment pattern or sequence page (including the `/pane/`
// partials themselves).
export function parsePanePath(pathname: string): { kind: PaneKind; id: string } | null {
  for (const kind of ['pattern', 'sequence'] as const) {
    const prefix = PREFIX[kind];
    if (!pathname.startsWith(prefix)) continue;
    const id = pathname.slice(prefix.length).replace(/\/$/, '');
    if (!id || id.includes('/')) return null;
    return { kind, id };
  }
  return null;
}

export function paneKindOf(path: string): PaneKind {
  return path.startsWith(PREFIX.sequence) ? 'sequence' : 'pattern';
}

// A `stackedNotes` value: the pane's param form plus its section anchor, if
// any. '#' is percent-encoded by URLSearchParams, so the anchor survives as
// part of the value.
export function encodePaneParam(path: string, hash?: string): string {
  const parsed = parsePanePath(path);
  const base = parsed?.kind === 'sequence' ? SEQUENCE_PARAM + parsed.id : (parsed?.id ?? path);
  return hash ? base + hash : base;
}

export function decodePaneParam(value: string): { path: string; hash?: string } {
  const i = value.indexOf('#');
  const head = i === -1 ? value : value.slice(0, i);
  const hash = i === -1 ? undefined : value.slice(i);
  const path = head.startsWith(SEQUENCE_PARAM)
    ? panePath('sequence', head.slice(SEQUENCE_PARAM.length))
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
  // URLSearchParams percent-encodes the prefix's ':'. It is legal in a query
  // string, so put it back to keep shared URLs readable; getAll decodes both.
  const query = params.toString().replaceAll(`=${encodeURIComponent(SEQUENCE_PARAM)}`, `=${SEQUENCE_PARAM}`);
  return `${first.path}?${query}${fragment}`;
}
