import type { CorpusDocument, ScoredSpan, RelatedMention } from './types';

function normalise(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
}

export function extractNgrams(text: string, n = 3): Map<string, number> {
  const cleaned = normalise(text);
  const freq = new Map<string, number>();
  for (let i = 0; i <= cleaned.length - n; i++) {
    const gram = cleaned.slice(i, i + n);
    freq.set(gram, (freq.get(gram) ?? 0) + 1);
  }
  return freq;
}

export function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (const [gram, count] of a) {
    magA += count * count;
    const bCount = b.get(gram);
    if (bCount !== undefined) dot += count * bCount;
  }
  for (const count of b.values()) magB += count * count;

  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

function extractWordWindows(text: string, minWords = 4, maxWords = 8, stride = 2) {
  const words = text.split(/\s+/);
  const windows: { text: string; start: number; end: number }[] = [];

  // precompute each word's character offset in the original text
  const wordStarts: number[] = [];
  let cursor = 0;
  for (const word of words) {
    const idx = text.indexOf(word, cursor);
    wordStarts.push(idx);
    cursor = idx + word.length;
  }

  for (let size = minWords; size <= maxWords; size += 2) {
    for (let i = 0; i <= words.length - size; i += stride) {
      const start = wordStarts[i];
      const lastWord = i + size - 1;
      const end = wordStarts[lastWord] + words[lastWord].length;
      windows.push({ text: text.slice(start, end), start, end });
    }
  }
  return windows;
}

export function scorePhrases(
  mainText: string,
  corpus: CorpusDocument[],
  corpusNgramMaps: Map<string, Map<string, number>>,
  threshold: number,
): ScoredSpan[] {
  const windows = extractWordWindows(mainText);
  const raw: ScoredSpan[] = [];

  for (const win of windows) {
    const winNgrams = extractNgrams(win.text);
    let maxScore = 0;
    const matchingDocIds: string[] = [];

    for (const doc of corpus) {
      const docNgrams = corpusNgramMaps.get(doc.id);
      if (!docNgrams) continue;
      const sim = cosineSimilarity(winNgrams, docNgrams);
      if (sim >= threshold) {
        maxScore = Math.max(maxScore, sim);
        matchingDocIds.push(doc.id);
      }
    }

    if (maxScore >= threshold && matchingDocIds.length > 0) {
      raw.push({
        text: win.text,
        start: win.start,
        end: win.end,
        score: maxScore,
        docIds: matchingDocIds,
      });
    }
  }

  // merge overlapping spans — keep higher score
  raw.sort((a, b) => a.start - b.start || b.score - a.score);
  const merged: ScoredSpan[] = [];

  for (const span of raw) {
    const last = merged.at(-1);
    if (last && span.start < last.end) {
      if (span.score > last.score) {
        last.text = mainText.slice(Math.min(last.start, span.start), Math.max(last.end, span.end));
        last.start = Math.min(last.start, span.start);
        last.end = Math.max(last.end, span.end);
        last.score = span.score;
        last.docIds = [...new Set([...last.docIds, ...span.docIds])];
      } else {
        last.end = Math.max(last.end, span.end);
        last.text = mainText.slice(last.start, last.end);
        last.docIds = [...new Set([...last.docIds, ...span.docIds])];
      }
    } else {
      merged.push({ ...span });
    }
  }

  return merged;
}

export function findRelatedMentions(
  selectedText: string,
  corpus: CorpusDocument[],
  maxResults = 10,
): RelatedMention[] {
  const selNgrams = extractNgrams(selectedText);
  const results: RelatedMention[] = [];

  for (const doc of corpus) {
    const sentences = doc.plainText.split(/(?<=[.!?])\s+/);
    for (const sentence of sentences) {
      if (sentence.trim().length < 10) continue;
      const sentNgrams = extractNgrams(sentence);
      const sim = cosineSimilarity(selNgrams, sentNgrams);
      if (sim > 0.1) {
        const idx = doc.plainText.indexOf(sentence);
        const contextStart = Math.max(0, idx - 40);
        const contextEnd = Math.min(doc.plainText.length, idx + sentence.length + 40);
        results.push({
          docId: doc.id,
          docName: doc.name,
          phrase: sentence.trim(),
          context: (contextStart > 0 ? '…' : '') +
            doc.plainText.slice(contextStart, contextEnd).trim() +
            (contextEnd < doc.plainText.length ? '…' : ''),
          similarity: sim,
        });
      }
    }
  }

  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, maxResults);
}
