import { Extension } from '@tiptap/react';
import { Plugin, PluginKey, type Transaction } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { ScoredSpan } from './types';
import type { Node as PmNode } from '@tiptap/pm/model';

export const heatmapPluginKey = new PluginKey<ScoredSpan[]>('heatmap');

// pmLength: positions in ProseMirror (nodeSize for atoms, text length for text)
// plainLength: characters in plainText (label length for atoms, text length for text)
interface TextEntry { pos: number; pmLength: number; plainLength: number; textOffset: number; isAtom: boolean }

function buildTextOffsetMap(doc: PmNode): TextEntry[] {
  const entries: TextEntry[] = [];
  let textOffset = 0;
  let prevBlockEnd = -1;

  doc.descendants((node, pos) => {
    if (node.isText && node.text) {
      entries.push({ pos, pmLength: node.text.length, plainLength: node.text.length, textOffset, isAtom: false });
      textOffset += node.text.length;
      return false;
    }

    if (node.isAtom && node.isInline) {
      const label = (node.attrs.label ?? node.attrs.id ?? '') as string;
      entries.push({ pos, pmLength: node.nodeSize, plainLength: label.length, textOffset, isAtom: true });
      textOffset += label.length;
      return false;
    }

    if (node.isBlock && pos > 0 && pos !== prevBlockEnd) {
      if (entries.length > 0) textOffset += 2;
      prevBlockEnd = pos;
    }
    return true;
  });

  return entries;
}

function plainTextToPmPos(offset: number, map: TextEntry[]): number | null {
  for (const entry of map) {
    if (entry.isAtom) {
      if (offset >= entry.textOffset && offset <= entry.textOffset + entry.plainLength) {
        return offset <= entry.textOffset ? entry.pos : entry.pos + entry.pmLength;
      }
      continue;
    }
    if (offset >= entry.textOffset && offset < entry.textOffset + entry.plainLength) {
      return entry.pos + (offset - entry.textOffset);
    }
  }
  const last = map.at(-1);
  if (last && offset === last.textOffset + last.plainLength) {
    return last.pos + last.pmLength;
  }
  return null;
}

function buildDecorations(spans: ScoredSpan[], doc: PmNode): DecorationSet {
  if (spans.length === 0) return DecorationSet.empty;

  const map = buildTextOffsetMap(doc);
  const decorations: Decoration[] = [];

  for (const span of spans) {
    const from = plainTextToPmPos(span.start, map);
    const to = plainTextToPmPos(span.end, map);
    if (from == null || to == null || from >= to) continue;

    const matchCount = span.docIds.length;
    const intensity = Math.min(matchCount / 3, 1);

    decorations.push(
      Decoration.inline(from, to, {
        class: 'heatmap-span',
        style: `--intensity: ${intensity}`,
        title: `${matchCount} match${matchCount > 1 ? 'es' : ''} — ${Math.round(span.score * 100)}% similarity`,
      }),
    );
  }

  return DecorationSet.create(doc, decorations);
}

// Set new spans by dispatching: editor.view.dispatch(setHeatmapSpans(editor.state.tr, spans))
export function setHeatmapSpans(tr: Transaction, spans: ScoredSpan[]) {
  return tr.setMeta(heatmapPluginKey, spans);
}

export const HeatmapExtension = Extension.create({
  name: 'heatmap',

  addProseMirrorPlugins() {
    return [
      new Plugin<ScoredSpan[]>({
        key: heatmapPluginKey,

        state: {
          init() {
            return [];
          },
          apply(tr, value) {
            const newSpans = tr.getMeta(heatmapPluginKey) as ScoredSpan[] | undefined;
            return newSpans ?? value;
          },
        },

        props: {
          decorations(state) {
            const spans = heatmapPluginKey.getState(state);
            if (!spans || spans.length === 0) return DecorationSet.empty;
            return buildDecorations(spans, state.doc);
          },
        },
      }),
    ];
  },
});
