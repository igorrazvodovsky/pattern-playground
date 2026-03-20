import { useState, useEffect, useCallback, type RefObject } from 'react';
import type { CorpusDocument, RelatedMention } from './types';
import { findRelatedMentions } from './ngram';

interface SelectionMentionsState {
  mentions: RelatedMention[];
  selectedText: string;
  expanded: boolean;
  expand: () => void;
  collapse: () => void;
}

export function useSelectionMentions(
  containerRef: RefObject<HTMLElement | null>,
  corpus: CorpusDocument[],
  maxResults = 10,
): SelectionMentionsState {
  const [mentions, setMentions] = useState<RelatedMention[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [expanded, setExpanded] = useState(false);

  const expand = useCallback(() => setExpanded(true), []);
  const collapse = useCallback(() => setExpanded(false), []);

  // recompute mentions when selection changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let debounceId: ReturnType<typeof setTimeout>;

    function handleSelectionChange() {
      clearTimeout(debounceId);
      debounceId = setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || !selection.rangeCount) {
          setMentions([]);
          setSelectedText('');
          setExpanded(false);
          return;
        }

        const text = selection.toString().trim();
        if (text.length < 3) {
          setMentions([]);
          setSelectedText('');
          setExpanded(false);
          return;
        }

        const range = selection.getRangeAt(0);
        if (!container.contains(range.commonAncestorContainer)) return;

        const results = findRelatedMentions(text, corpus, maxResults);
        setMentions(results);
        setSelectedText(text);
        setExpanded(false);
      }, 200);
    }

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      clearTimeout(debounceId);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [containerRef, corpus, maxResults]);

  return { mentions, selectedText, expanded, expand, collapse };
}
