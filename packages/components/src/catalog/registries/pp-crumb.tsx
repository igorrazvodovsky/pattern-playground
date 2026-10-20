import { useFocusHandoff, useMenuFocusHandoff } from './focus-handoff';
import '../../jsx-types';

// One link in a Breadcrumbs trail in the pp registry, as the library's trail
// draws it. Picking an item makes it the current one, which ends the trail
// without a link, so a picked link hands focus on (focus-handoff.ts).

export const Crumb = ({ label, onPick }: { label: string; onPick: () => void }) => {
  const ref = useFocusHandoff<HTMLAnchorElement>(null);
  return (
    <span className="crumb">
      <a
        ref={ref}
        href="#"
        onClick={event => {
          event.preventDefault();
          onPick();
        }}
      >
        {label}
      </a>
    </span>
  );
};

// The trail's overflow crumb: a plain button that opens a list of every item
// above the current one, which the library's trail shows in place of the items
// it folds while it is collapsed.
// Picking one can shorten the trail until it has no middle, removing the menu
// while focus is in it, so it hands focus on (focus-handoff.ts).
export const CrumbOverflow = ({ items, onPick }: { items: { id: string; label: string }[]; onPick: (id: string) => void }) => {
  const { trigger, list } = useMenuFocusHandoff(null);
  return (
    <span className="crumb crumb--overflow">
      <pp-dropdown placement="bottom-start" hoist>
        <button ref={trigger} type="button" className="button button--plain" data-slot="trigger" aria-label="Hidden items">
          …
        </button>
        <pp-popup>
          <pp-list ref={list}>
            {items.map(item => (
              <pp-list-item key={item.id} onClick={() => onPick(item.id)}>
                {item.label}
              </pp-list-item>
            ))}
          </pp-list>
        </pp-popup>
      </pp-dropdown>
    </span>
  );
};
