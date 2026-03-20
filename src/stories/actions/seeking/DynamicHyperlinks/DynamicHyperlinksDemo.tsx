import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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

const mainRawDoc = documents[0];
const mainDoc = toCorpusDoc(mainRawDoc);
const corpus = documents.slice(1).map(toCorpusDoc);

export function DynamicHyperlinksDemo() {
  const [heatmapEnabled, setHeatmapEnabled] = useState(true);
  const [editorText, setEditorText] = useState(mainDoc.plainText);
  const threshold = 0.3;
  const readerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const spans = useHeatmap(editorText, corpus, threshold, heatmapEnabled);
  const { mentions, expanded, expand, collapse } = useSelectionMentions(readerRef, corpus);

  const toggleHeatmap = useCallback(() => setHeatmapEnabled(v => !v), []);

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

  // Ctrl+L keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        toggleHeatmap();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleHeatmap]);

  return (
    <div className="dynamic-hyperlinks">
      <div className="dynamic-hyperlinks__controls">
        <label>
          <input
            type="checkbox"
            checked={heatmapEnabled}
            onChange={toggleHeatmap}
          />
          Heatmap
        </label>
        <kbd>Ctrl+L</kbd>
      </div>

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
                            <span className="badge badge--pill">{Math.round(m.similarity * 100)}%</span>
                          </div>
                          <span className="dynamic-hyperlinks__mention-context">{m.context}</span>
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
