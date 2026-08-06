import { useMemo, useState } from 'react';
import { DataView } from './DataView';
import { ViewSpec, makeSpec } from '../../templates/collection-view/spec';

/**
 * Saved views are named specs, switched whole — query, representation and
 * arrangement travel together as one portable artefact. One view is
 * deliberately stale: its query names a status label the data model no longer
 * uses, so it matches nothing. Saved framings accumulate and go stale;
 * pruning is part of the pattern.
 */

const SAVED_VIEWS: ViewSpec[] = [
  makeSpec({
    id: 'saved-default',
    label: 'All products',
    representation: {
      type: 'card',
      shownAttributes: ['name', 'description', 'category', 'pricing.msrp', 'availability.status'],
    },
    arrangement: { sortBy: { field: 'name', order: 'asc' } },
  }),
  makeSpec({
    id: 'saved-sustainability',
    label: 'Sustainability review',
    representation: {
      type: 'table',
      shownAttributes: [
        'name',
        'category',
        'sustainability.carbonFootprint',
        'sustainability.recyclabilityScore',
        'lifecycle.repairability',
      ],
    },
    arrangement: { sortBy: { field: 'sustainability.carbonFootprint', order: 'desc' } },
  }),
  makeSpec({
    id: 'saved-shortlist',
    label: 'Affordable picks',
    query: [
      {
        id: 'saved-shortlist-price',
        path: 'pricing.msrp',
        operator: 'less than',
        values: ['500'],
      },
    ],
    representation: {
      type: 'card',
      shownAttributes: ['name', 'condition', 'pricing.msrp', 'location.site'],
    },
    arrangement: { layout: 'list', sortBy: { field: 'pricing.msrp', order: 'asc' } },
  }),
  makeSpec({
    id: 'saved-pilot-2025',
    label: 'Pilot fleet (2025)',
    query: [
      {
        id: 'saved-pilot-status',
        path: 'availability.status',
        operator: 'is',
        values: ['Pilot Phase'],
      },
    ],
    representation: {
      type: 'card',
      shownAttributes: ['name', 'description', 'availability.status', 'availability.leadTime'],
    },
    arrangement: { sortBy: { field: 'availability.leadTime', order: 'asc' } },
  }),
];

export function SavedViewsDemo() {
  const [activeId, setActiveId] = useState(SAVED_VIEWS[0].id);
  const [workingSpec, setWorkingSpec] = useState<ViewSpec>(SAVED_VIEWS[0]);

  const savedSpec = useMemo(
    () => SAVED_VIEWS.find((candidate) => candidate.id === activeId) ?? SAVED_VIEWS[0],
    [activeId]
  );

  const selectView = (spec: ViewSpec) => {
    setActiveId(spec.id);
    setWorkingSpec(spec);
  };

  const viewPicker = (
    <>
      <pp-dropdown>
        <button className="button" data-slot="trigger">
          {savedSpec.label}
          <iconify-icon className="icon" icon="ph:caret-down" aria-hidden="true"></iconify-icon>
        </button>
        <pp-popup>
          <pp-list>
            {SAVED_VIEWS.map((view) => (
              <pp-list-item
                key={view.id}
                type="checkbox"
                checked={view.id === activeId}
                onClick={() => selectView(view)}
              >
                {view.label}
              </pp-list-item>
            ))}
          </pp-list>
        </pp-popup>
      </pp-dropdown>
    </>
  );

  return <DataView spec={workingSpec} onSpecChange={setWorkingSpec} toolbarLeading={viewPicker} />;
}
