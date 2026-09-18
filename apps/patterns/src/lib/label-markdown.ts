// Inline-markdown parsing for authored label prose — edge notes, resulting
// clauses, sequence glosses. Splitting into typed segments lets a renderer emit
// real elements rather than literal markup. Authored content only — no escaping.
const MD_CODE = /`([^`]+)`/g;
const MD_LINK = /\[([^\]]+)\]\(([^)]+)\)/g;
// Emphasis wrapping non-space-flanked content: `_underscore_` (only at word
// boundaries, so `needs_based_view` stays literal, per CommonMark) or
// `*star*` (allowed intraword). Group 1 is underscore content, group 2 star.
const MD_EMPHASIS = /(?<![A-Za-z0-9])_(\S(?:[^_]*\S)?)_(?![A-Za-z0-9])|\*(\S(?:[^*]*\S)?)\*/g;

export type LabelPart = { text: string; href?: string; em?: boolean; code?: boolean };

function parseEmphasis(text: string): LabelPart[] {
  const parts: LabelPart[] = [];
  let last = 0;
  for (const m of text.matchAll(MD_EMPHASIS)) {
    const idx = m.index ?? 0;
    if (idx > last) parts.push({ text: text.slice(last, idx) });
    parts.push({ text: m[1] ?? m[2], em: true });
    last = idx + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}

function parseLinks(text: string): LabelPart[] {
  const parts: LabelPart[] = [];
  let last = 0;
  for (const m of text.matchAll(MD_LINK)) {
    const idx = m.index ?? 0;
    if (idx > last) parts.push(...parseEmphasis(text.slice(last, idx)));
    parts.push({ text: m[1], href: m[2] });
    last = idx + m[0].length;
  }
  if (last < text.length) parts.push(...parseEmphasis(text.slice(last)));
  return parts;
}

// Code spans bind tightest, as in CommonMark: their content is literal, so the
// link and emphasis passes run only over what falls outside them.
export function parseLabel(label: string): LabelPart[] {
  const parts: LabelPart[] = [];
  let last = 0;
  for (const m of label.matchAll(MD_CODE)) {
    const idx = m.index ?? 0;
    if (idx > last) parts.push(...parseLinks(label.slice(last, idx)));
    parts.push({ text: m[1], code: true });
    last = idx + m[0].length;
  }
  if (last < label.length) parts.push(...parseLinks(label.slice(last)));
  return parts;
}
