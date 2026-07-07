import { useState } from 'react';
import '../jsx-types';
import { reuseListings, type ReuseListing } from '@shared/data';
import { showToast, getModalService } from './demo-runtime';
import { DeleteIconButton } from './delete-icon-button';

export function DialogDeletionDemo() {
  const [items, setItems] = useState(reuseListings);

  const handleDelete = async (item: ReuseListing, index: number) => {
    const modalService = await getModalService();
    const dialogId = modalService.openDialog(
      <div className="flow">
        <p>
          Are you sure you want to delete <strong>{item.name}</strong>? This action cannot be undone.
        </p>
        <footer>
          <div className="inline-flow">
            <button
              className="button button--danger"
              autoFocus
              onClick={() => {
                setItems((current) => current.filter((_, i) => i !== index));
                modalService.closeModal(dialogId);
              }}
            >
              Delete
            </button>
            <button className="button button--secondary" onClick={() => modalService.closeModal(dialogId)}>
              Cancel
            </button>
          </div>
        </footer>
      </div>,
      { title: 'Delete item', size: 'small' }
    );
  };

  return (
    <div>
      <pp-list className="borderless">
        {items.map((item, index) => (
          <pp-list-item key={item.id}>
            {item.name}
            <DeleteIconButton onClick={() => handleDelete(item, index)} />
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
    </div>
  );
}

export function TypedConfirmationDemo() {
  const [exists, setExists] = useState(true);
  const workspace = 'Oriental Aluminum Salad';

  const handleDelete = async () => {
    const modalService = await getModalService();
    const dialogId = modalService.openDialog(
      <div className="flow">
        <div className="flow">
          <p>
            Deleting <strong>{workspace}</strong> will permanently remove:
          </p>
          <ul>
            <li>All projects and files</li>
            <li>Team member access</li>
            <li>Integration settings</li>
            <li>Usage history and analytics</li>
          </ul>
          <pp-input type="text" placeholder={`Type "${workspace}" to confirm`} />
        </div>
        <footer>
          <div className="inline-flow">
            <button
              className="button button--danger"
              onClick={() => {
                setExists(false);
                modalService.closeModal(dialogId);
              }}
            >
              Delete workspace
            </button>
            <button className="button button--secondary" onClick={() => modalService.closeModal(dialogId)}>
              Cancel
            </button>
          </div>
        </footer>
      </div>,
      { title: 'Delete workspace', size: 'medium' }
    );
  };

  return (
    <div className="stack">
      {exists ? (
        <button className="button button--danger" onClick={handleDelete}>
          Delete workspace
        </button>
      ) : (
        <p className="muted">
          Workspace deleted.{' '}
          <button className="button button--plain" onClick={() => setExists(true)}>
            Restore
          </button>
        </p>
      )}
    </div>
  );
}

interface StagedItem {
  id: string;
  name: string;
  deleted: boolean;
}

export function StagedDeletionDemo() {
  const [items, setItems] = useState<StagedItem[]>(() =>
    reuseListings.map(({ id, name }) => ({ id, name, deleted: false }))
  );

  const toggle = (id: string) =>
    setItems(items.map((item) => (item.id === id ? { ...item, deleted: !item.deleted } : item)));

  const handleSave = () => {
    setItems(items.filter((item) => !item.deleted));
    void showToast('Changes saved');
  };

  const handleCancel = () => setItems(items.map((item) => ({ ...item, deleted: false })));

  const hasChanges = items.some((item) => item.deleted);

  return (
    <div className="flow">
      <pp-list className="borderless">
        {items.map((item) => (
          <pp-list-item
            key={item.id}
            style={{ textDecoration: item.deleted ? 'line-through' : 'none' }}
          >
            {item.name}
            <button
              slot="suffix"
              className="button button--plain button--small"
              onClick={() => toggle(item.id)}
            >
              <iconify-icon
                className="icon"
                icon={item.deleted ? 'ph:arrow-arc-left' : 'ph:trash-simple'}
              />
              <span className="inclusively-hidden">{item.deleted ? 'Restore' : 'Delete'}</span>
            </button>
          </pp-list-item>
        ))}
      </pp-list>
      {hasChanges && (
        <div className="inline-flow">
          <button className="button" onClick={handleSave}>
            Save changes
          </button>
          <button className="button button--secondary" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
