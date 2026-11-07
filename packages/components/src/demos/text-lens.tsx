import { useState } from 'react';
import '../jsx-types';
import '../icons/register-icons';
import { getDocumentById } from '@shared/data';
import { TextTransformService } from '../services/text-transform-service';

// Text lens: the actor reads a document and zooms one section in for more
// detail or out for less. The document is not editable and is never changed:
// each level is kept for this reading, so zooming back returns the exact
// wording seen before, and level 0 is the document's own text. Consumed by the
// text lens pattern page.

const MIN_LEVEL = -2;
const MAX_LEVEL = 2;

type SectionLens = {
  level: number;
  /** Wording per level; level 0 is the section's text in the document. */
  versions: Record<number, string>;
  pending: boolean;
  error?: string;
};

type Section = { id: string; title: string; text: string };

export function TextLensDemo() {
  const doc = getDocumentById('doc-climate-change');
  const sections: Section[] = doc?.sections ?? [];

  return (
    <article className="measure flow">
      <h3>{doc?.name}</h3>
      {sections.map((section) => (
        <LensSection key={section.id} section={section} />
      ))}
    </article>
  );
}

function LensSection({ section }: { section: Section }) {
  const [lens, setLens] = useState<SectionLens>({
    level: 0,
    versions: { 0: section.text },
    pending: false,
  });

  const canZoomOut = !lens.pending && lens.level > MIN_LEVEL;
  const canZoomIn = !lens.pending && lens.level < MAX_LEVEL;

  async function zoom(step: 1 | -1) {
    if (step === 1 ? !canZoomIn : !canZoomOut) return;
    const next = lens.level + step;

    if (lens.versions[next] !== undefined) {
      setLens({ ...lens, level: next, error: undefined });
      return;
    }

    // Each level is derived from the one beside it, so a step changes the
    // detail by one degree. A service per request keeps concurrent zooms in
    // different sections from cancelling each other.
    setLens({ ...lens, pending: true, error: undefined });
    const service = new TextTransformService();
    const source = lens.versions[lens.level];
    try {
      const result =
        step === 1 ? await service.zoomIn(source, 40) : await service.zoomOut(source, 40);
      // An empty reply is not kept as the wording for a level: the next try
      // would find it cached and never ask again.
      if (!result.trim()) throw new Error('the model returned no text');
      setLens((current) => ({
        level: next,
        versions: { ...current.versions, [next]: result.trim() },
        pending: false,
      }));
    } catch (error) {
      setLens((current) => ({
        ...current,
        pending: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }

  return (
    <section className="flow hover-only-actions">
      <div className="flex sidecar-end">
        <h4>{section.title}</h4>
        <div className="flex" role="group" aria-label={`Detail: ${section.title}`}>
          <pp-tooltip content="Less detail">
            <button
              type="button"
              className="button button--plain"
              disabled={lens.level <= MIN_LEVEL}
              aria-disabled={lens.pending || undefined}
              onClick={() => zoom(-1)}
            >
              <iconify-icon className="icon" icon="ik:zoom-out" aria-hidden="true"></iconify-icon>
              <span className="visually-hidden">Less detail</span>
            </button>
          </pp-tooltip>
          <pp-tooltip content="More detail">
            <button
              type="button"
              className="button button--plain"
              disabled={lens.level >= MAX_LEVEL}
              aria-disabled={lens.pending || undefined}
              onClick={() => zoom(1)}
            >
              <iconify-icon className="icon" icon="ik:zoom-in" aria-hidden="true"></iconify-icon>
              <span className="visually-hidden">More detail</span>
            </button>
          </pp-tooltip>
        </div>
      </div>
      {lens.error && (
        <div className="callout danger flex" role="alert">
          <iconify-icon
            className="icon"
            icon="ik:cross-in-circle"
            aria-hidden="true"
          ></iconify-icon>
          <span className="callout__text">Could not change the detail: {lens.error}</span>
        </div>
      )}
      <p className={lens.pending ? 'shimmer--block' : undefined} aria-busy={lens.pending}>
        {lens.versions[lens.level]}
      </p>
    </section>
  );
}
