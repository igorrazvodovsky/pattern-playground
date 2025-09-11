import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { faker } from "@faker-js/faker";
import { PpToast } from "../../components/toast/toast";

const meta = {
  title: "Components/Inline Confirmation",
  tags: ['!autodocs', '!dev'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const InlineConfirmButton = ({
  onDelete,
  timeout = 4000
}: {
  onDelete: () => void;
  label?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  timeout?: number;
}) => {
  const [confirming, setConfirming] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleInitialClick = () => {
    setConfirming(true);
    const id = setTimeout(() => {
      setConfirming(false);
    }, timeout);
    setTimeoutId(id);
  };

  const handleConfirm = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setConfirming(false);
    onDelete();
  };

  const handleCancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setConfirming(false);
  };

  if (confirming) {
    return (
      <div slot="suffix" className="inline-flow">
        <button
          className="button button--plain"
          onClick={handleCancel}
        >
          <iconify-icon
            className="icon"
            icon="ph:x"
          />
          <span className="inclusively-hidden">
            Cancel
          </span>
        </button>
        <button
          className="button button--plain"
          onClick={handleConfirm}
        >
          <iconify-icon
            className="icon"
            icon="ph:trash-simple-fill"
          />
          <span className="inclusively-hidden">
            Confirm
          </span>
        </button>
      </div>
    );
  }

  return (
    <button
      slot="suffix"
      className="button button--plain"
      onClick={handleInitialClick}
    >
      <iconify-icon
        className="icon"
        icon="ph:trash-simple"
      />
      <span className="inclusively-hidden">
        Delete
      </span>
    </button>
  );
};

export const Default: Story = {
  render: () => {
    const [items, setItems] = useState(() =>
      Array.from({ length: 5 }, () => faker.commerce.productName())
    );

    return (
      <>
        <pp-list className="borderless">
          {items.map((item, index) => (
            <pp-list-item key={index}>
              {item}
              <InlineConfirmButton

                onDelete={() => {
                  setItems(items.filter((_, i) => i !== index));
                }}
              />
            </pp-list-item>
          ))}
        </pp-list>
        {items.length === 0 && (
          <p className="muted">No items in your list</p>
        )}
      </>
    );
  }
};

export const StagedDeletion: Story = {
  render: () => {
    const [items, setItems] = useState(() =>
      Array.from({ length: 5 }, (_, i) => ({
        id: i,
        name: faker.commerce.productName(),
        deleted: false
      }))
    );

    const markForDeletion = (id: number) => {
      setItems(items.map(item =>
        item.id === id ? { ...item, deleted: !item.deleted } : item
      ));
    };

    const handleSave = () => {
      setItems(items.filter(item => !item.deleted));
      PpToast.show("Changes saved");
    };

    const handleCancel = () => {
      setItems(items.map(item => ({ ...item, deleted: false })));
    };

    const hasChanges = items.some(item => item.deleted);

    return (
      <div className="flow">
        <pp-list>
          {items.map(item => (
            <pp-list-item
              key={item.id}
              style={{
                textDecoration: item.deleted ? "line-through" : "none"
              }}
            >
              {item.name}
              <button
                slot="suffix"
                className="button button--small button--plain"
                onClick={() => markForDeletion(item.id)}
              >
              <iconify-icon
                className="icon"
                icon={item.deleted ? "ph:arrow-arc-left" : "ph:trash-simple"}
              />
              <span className="inclusively-hidden">
                {item.deleted ? "Restore" : "Delete"}
              </span>
              </button>
            </pp-list-item>
          ))}
        </pp-list>

        {hasChanges && (
          <div className="inline-flow">
            <button className="button" onClick={handleSave}>
              Save Changes
            </button>
            <button className="button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        )}

      </div>
    );
  }
};
