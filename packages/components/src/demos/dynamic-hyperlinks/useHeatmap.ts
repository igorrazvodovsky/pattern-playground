import { useMemo } from 'react';
import type { CorpusDocument, ScoredSpan } from './types';
import { extractNgrams, scorePhrases } from './ngram';

export function useHeatmap(
  mainText: string,
  corpus: CorpusDocument[],
  threshold: number,
  enabled: boolean,
): ScoredSpan[] {
  const corpusNgramMaps = useMemo(() => {
    const maps = new Map<string, Map<string, number>>();
    for (const doc of corpus) {
      maps.set(doc.id, extractNgrams(doc.plainText));
    }
    return maps;
  }, [corpus]);

  const spans = useMemo(() => {
    if (!enabled) return [];
    return scorePhrases(mainText, corpus, corpusNgramMaps, threshold);
  }, [mainText, corpus, corpusNgramMaps, threshold, enabled]);

  return spans;
}
