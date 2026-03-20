export interface CorpusDocument {
  id: string;
  name: string;
  plainText: string;
}

export interface ScoredSpan {
  text: string;
  start: number;
  end: number;
  score: number;
  docIds: string[];
}

export interface RelatedMention {
  docId: string;
  docName: string;
  phrase: string;
  context: string;
  similarity: number;
}
