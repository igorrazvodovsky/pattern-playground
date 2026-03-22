import { useState, useEffect, useRef, useCallback, useMemo, type ReactNode } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import documents from '../../../data/documents.json';
import { referenceCategories } from '../../../data';
import { Reference, createReferenceSuggestion } from '../../../../components/reference/Reference';
import type { SelectedReference } from '../../../../components/reference/types';
import type { CorpusDocument } from './types';
import { useHeatmap } from './useHeatmap';
import { useSelectionMentions } from './useSelectionPopup';
import { HeatmapExtension, setHeatmapSpans } from './HeatmapPlugin';

type RawDoc = (typeof documents)[number];

function toCorpusDoc(d: RawDoc): CorpusDocument {
  return { id: d.id, name: d.name, plainText: d.content.plainText };
}

const STOPWORDS = new Set([
  'the', 'and', 'are', 'for', 'not', 'but', 'had', 'has', 'was', 'all',
  'can', 'her', 'his', 'one', 'our', 'out', 'you', 'been', 'have', 'from',
  'into', 'more', 'other', 'some', 'such', 'than', 'that', 'them', 'then',
  'these', 'they', 'this', 'what', 'when', 'will', 'with', 'each', 'which',
  'their', 'there', 'about', 'also', 'been', 'being', 'does', 'its', 'just',
  'most', 'much', 'over', 'very', 'many', 'well', 'only', 'those',
]);

function highlightMatches(text: string, query: string): ReactNode {
  const words = query
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w.toLowerCase()))
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  if (words.length === 0) return text;

  const inflections = '(?:s|es|ed|ing|er)?';
  const alts = words.map((w) => w.replace(/(s|es|ed|ing|er)$/i, '') + inflections);
  const pattern = new RegExp(`\\b(${alts.join('|')})\\b`, 'gi');
  const parts = text.split(pattern);

  return parts.map((part, i) =>
    i % 2 === 1 ? <mark key={i}>{part}</mark> : part,
  );
}

const mainRawDoc = documents[0];
const mainDoc = toCorpusDoc(mainRawDoc);
const corpus = documents.slice(1).map(toCorpusDoc);

export function DynamicHyperlinksDemo() {
  const [editorText, setEditorText] = useState(mainDoc.plainText);
  const threshold = 0.3;
  const readerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const spans = useHeatmap(editorText, corpus, threshold, true);
  const { mentions, selectedText, expanded, expand, collapse } = useSelectionMentions(readerRef, corpus);

  const handleReferenceSelect = useCallback((ref: SelectedReference) => {
    console.log('Reference selected:', ref);
  }, []);

  const referenceSuggestion = useMemo(
    () => createReferenceSuggestion(referenceCategories, handleReferenceSelect),
    [handleReferenceSelect],
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Reference.configure({
        HTMLAttributes: { class: 'reference-mention reference' },
        suggestion: referenceSuggestion,
      }),
      HeatmapExtension,
    ],
    content: mainRawDoc.content.richContent,
    editable: true,
    editorProps: {
      attributes: {
        class: 'dynamic-hyperlinks__tiptap',
      },
    },
    onUpdate: ({ editor: e }) => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setEditorText(e.state.doc.textContent);
      }, 400);
    },
  });

  // push new spans into plugin state via transaction metadata
  useEffect(() => {
    if (!editor) return;
    editor.view.dispatch(setHeatmapSpans(editor.state.tr, spans));
  }, [editor, spans]);

  return (
    <div className="dynamic-hyperlinks">
      <div className="dynamic-hyperlinks__body">
        <div className="dynamic-hyperlinks__reader" ref={readerRef}>
          <EditorContent editor={editor} />

          {editor && (
            <BubbleMenu editor={editor}>
              <div className="bubble-menu">
                {!expanded ? (
                  <button
                    className="dynamic-hyperlinks__mentions-badge"
                    onClick={mentions.length > 0 ? expand : undefined}
                    disabled={mentions.length === 0}
                  >
                    {mentions.length > 0
                      ? `${mentions.length} mention${mentions.length > 1 ? 's' : ''}`
                      : 'No mentions'
                    }
                  </button>
                ) : (
                  <div className="dynamic-hyperlinks__mentions-expanded">
                    <div className="dynamic-hyperlinks__mentions-expanded-header">
                      <small>{mentions.length} mention{mentions.length > 1 ? 's' : ''}</small>
                      <button
                        className="dynamic-hyperlinks__mentions-collapse"
                        onClick={collapse}
                        aria-label="Collapse"
                      >
                        ×
                      </button>
                    </div>
                    <ul className="dynamic-hyperlinks__popup-list">
                      {mentions.map((m, i) => (
                        <li key={`${m.docId}-${i}`} className="dynamic-hyperlinks__mention">
                          <div className="dynamic-hyperlinks__mention-header">
                            <span className="dynamic-hyperlinks__mention-doc">{m.docName}</span>
                          </div>
                          <span className="dynamic-hyperlinks__mention-context">
                            {highlightMatches(m.context, selectedText)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </BubbleMenu>
          )}
        </div>
      </div>
    </div>
  );
}
