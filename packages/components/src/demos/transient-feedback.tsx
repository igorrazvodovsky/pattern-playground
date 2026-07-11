import { useState } from 'react';
import '../jsx-types';
import { reuseListings } from '@shared/data';
import { showToast } from './demo-runtime';
import { DeleteIconButton } from './delete-icon-button';

export function ToastDemo() {
  return (
    <div className="inline-flow">
      <button className="button" onClick={() => void showToast('Something happened')}>
        Show toast
      </button>
    </div>
  );
}

export function ToastWithUndoDemo() {
  const [items, setItems] = useState(reuseListings);

  const handleDelete = (index: number) => {
    const removed = items[index];
    const next = items.filter((_, i) => i !== index);
    setItems(next);
    void showToast(`${removed.name} deleted`, () => setItems(items));
  };

  return (
    <>
      <pp-list className="borderless">
        {items.map((item, index) => (
          <pp-list-item key={item.id}>
            {item.name}
            <DeleteIconButton onClick={() => handleDelete(index)} />
          </pp-list-item>
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
