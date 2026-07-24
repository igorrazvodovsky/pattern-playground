import { useState, useRef, useEffect } from "react";
import projectsData from "@shared/data/projects.json" with { type: "json" };
import 'iconify-icon';
import '../jsx-types';

// Shared selection demos: the visibility/discoverability variants and the
// select-all escalation affordance, over a plain list (the affordance-level
// moves read clearer here than inside a state-laden DataView slice).
// Consumed by the selection pattern page.

interface Project {
  id: string;
  name: string;
  icon: string;
}

const projects = projectsData as Project[];
const TOTAL_MATCHING = 1234;

function useListMultiSelect() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const listRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const handler = (e: Event) => {
      const event = e as CustomEvent<{ item: HTMLElement }>;
      const id = event.detail.item.getAttribute('data-value');
      if (!id) return;
      setSelected(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };
    list.addEventListener('pp-select', handler);
    return () => list.removeEventListener('pp-select', handler);
  }, []);

  return { selected, setSelected, listRef };
}

export function InlineCheckboxesDemo() {
  const { selected, listRef } = useListMultiSelect();

  return (
    <div className="flow">
      <p className="muted">{selected.size} selected</p>
      <pp-list className="layer borderless" ref={listRef} multiselectable>
        {projects.map(item => (
          <pp-list-item
            key={item.id}
            type="checkbox"
            data-value={item.id}
            checked={selected.has(item.id)}
          >
            <iconify-icon icon={item.icon} slot="prefix" />
            {item.name}
          </pp-list-item>
        ))}
      </pp-list>
    </div>
  );
}

export function ModeBasedRevealDemo() {
  const [editing, setEditing] = useState(false);
  const { selected, setSelected, listRef } = useListMultiSelect();

  const exitMode = () => {
    setEditing(false);
    setSelected(new Set());
  };

  return (
    <div className="flow">
      <div className="inline-flow">
        {editing ? (
          <>
            <span className="muted">{selected.size} selected</span>
            <button className="button button--plain" onClick={exitMode}>Done</button>
          </>
        ) : (
          <>
            <span className="muted">{projects.length} projects</span>
            <button className="button button--plain" onClick={() => setEditing(true)}>Select</button>
          </>
        )}
      </div>
      <pp-list className="layer borderless" ref={listRef} multiselectable={editing || undefined}>
        {projects.map(item => (
          <pp-list-item
            key={item.id}
            type={editing ? 'checkbox' : undefined}
            data-value={item.id}
            checked={editing && selected.has(item.id)}
          >
            <iconify-icon icon={item.icon} slot="prefix" />
            {item.name}
          </pp-list-item>
        ))}
      </pp-list>
    </div>
  );
}

export function SelectAllAffordanceDemo() {
  const { selected, setSelected, listRef } = useListMultiSelect();
  const [escalated, setEscalated] = useState(false);

  const allVisibleIds = projects.map(i => i.id);
  const allVisibleSelected = allVisibleIds.every(id => selected.has(id));
  const visibleCount = projects.length;

  const selectAllVisible = () => {
    setSelected(new Set(allVisibleIds));
    setEscalated(false);
  };

  const clearSelection = () => {
    setSelected(new Set());
    setEscalated(false);
  };

  const summary = escalated
    ? `All ${TOTAL_MATCHING.toLocaleString()} matching items selected`
    : selected.size > 0
      ? `${selected.size} of ${visibleCount} on this page selected`
      : `Showing ${visibleCount} of ${TOTAL_MATCHING.toLocaleString()}`;

  return (
    <div className="flow">
      <div className="inline-flow">
        <span className="muted">{summary}</span>
        {selected.size > 0 || escalated ? (
          <button className="button button--plain" onClick={clearSelection}>Clear</button>
        ) : (
          <button className="button button--plain" onClick={selectAllVisible}>Select all visible</button>
        )}
      </div>
      {allVisibleSelected && !escalated && (
        <div className="callout info">
          <p>
            All {visibleCount} items on this page are selected.{' '}
            <button className="button button--plain" onClick={() => setEscalated(true)}>
              Select all {TOTAL_MATCHING.toLocaleString()} matching items
            </button>
          </p>
        </div>
      )}
      <pp-list className="layer borderless" ref={listRef} multiselectable>
        {projects.map(item => (
          <pp-list-item
            key={item.id}
            type="checkbox"
            data-value={item.id}
            checked={escalated || selected.has(item.id)}
          >
            <iconify-icon icon={item.icon} slot="prefix" />
            {item.name}
          </pp-list-item>
        ))}
      </pp-list>
    </div>
  );
}
