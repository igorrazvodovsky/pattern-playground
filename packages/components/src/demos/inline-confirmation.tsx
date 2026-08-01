import { useState } from 'react';
import '../jsx-types';
import { reuseListings, type ReuseListing } from '@shared/data';

// Headless state machine for the pattern — bring your own markup and styling.
export function useInlineConfirm(onConfirm: () => void, timeout = 4000) {
  const [confirming, setConfirming] = useState(false);
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  const arm = () => {
    setConfirming(true);
    const id = setTimeout(() => setConfirming(false), timeout);
    setTimeoutId(id);
  };

  const cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setConfirming(false);
  };

  const confirm = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setConfirming(false);
    onConfirm();
  };

  return { confirming, arm, cancel, confirm };
}

function DeletableItem({ item, onDelete }: { item: ReuseListing; onDelete: () => void }) {
  const { confirming, arm, cancel, confirm } = useInlineConfirm(onDelete);

  return (
    <pp-list-item>
      {item.name}
      {confirming ? (
        <div data-slot="suffix">
          <button className="button button--plain" onClick={cancel}>
            <iconify-icon className="icon" icon="ph:x" />
            <span className="visually-hidden">Cancel</span>
          </button>&#32;
          <button className="button button--plain" onClick={confirm}>
            <iconify-icon className="icon" icon="ph:trash-simple-fill" />
            <span className="visually-hidden">Confirm</span>
          </button>
        </div>
      ) : (
        <button data-slot="suffix" className="button button--plain" onClick={arm}>
          <iconify-icon className="icon" icon="ph:trash-simple" />
          <span className="visually-hidden">Delete</span>
        </button>
      )}
    </pp-list-item>
  );
}

export function InlineConfirmationDemo() {
  const [items, setItems] = useState(reuseListings);

  return (
    <>
      <pp-list className="borderless">
        {items.map((item, index) => (
          <DeletableItem
            key={item.id}
            item={item}
            onDelete={() => setItems(items.filter((_, i) => i !== index))}
          />
        ))}
      </pp-list>
      {items.length === 0 && (
        <p className="muted">
          No items left.{' '}
          <button className="button button--plain" onClick={() => setItems(reuseListings)}>
            Reset
          </button>
        </p>
      )}
    </>
  );
}
