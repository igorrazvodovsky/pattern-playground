// The filename stem is a content entry's id in every collection (patterns,
// sequences, concepts): `content/concepts/commenting.mdx` → `commenting`.
// Loaders, the client-side stackability check and the cross-reference
// validator all derive ids through this one function so they cannot disagree.
export function fileStem(path: string): string {
  return path
    .split('/')
    .pop()!
    .replace(/\.mdx?$/, '');
}
