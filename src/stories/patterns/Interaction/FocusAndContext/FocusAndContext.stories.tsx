import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState, useEffect } from "react";
import { DataService, getRandomItem } from './services/data-service';
import { fetchAIComponents, createModelItem } from './services/api-service';
import { ModelItem } from '../../../../schemas/index';

// Define meta information for the story
const meta = {
  title: "Patterns/Interaction/Focus and Context*",
  parameters: {
    controls: { disable: true }
  }
} satisfies Meta;

export default meta;
type Story = StoryObj;

// Data service instance
const dataService = new DataService();

// React components that mirror the original Lit functionality
const Breadcrumbs: React.FC<{ item: ModelItem }> = ({ item }) => {
  const breadcrumbPath = item.path || [];

  return (
    <pp-breadcrumbs role="navigation">
      <a href="#" onClick={(e) => e.preventDefault()}>
        <span className="crumbicon">
          <iconify-icon icon="ph:house"></iconify-icon>
        </span>
        <span className="inclusively-hidden">Home</span>
      </a>

      {breadcrumbPath.map((pathItem, index) => (
        <span key={index} className="crumb">
          <a href="#" onClick={(e) => e.preventDefault()}>
            {pathItem}
          </a>
        </span>
      ))}

      <span className="crumb">
        <a href="#" aria-current="page" onClick={(e) => e.preventDefault()}>
          {item.name}
        </a>
      </span>
    </pp-breadcrumbs>
  );
};

const AttributesSection: React.FC<{ attributes?: Array<{name: string, value: string, unit?: string | null}> }> = ({ attributes }) => {
  if (!attributes || attributes.length === 0) return null;

  return (
    <details className="card__section" open>
      <summary>Attributes <span className="badge">{attributes.length}</span></summary>
      <ul className="card__attributes badges">
        {attributes.map((attr, index) => (
          <span key={index} className="badge">
            {attr.name}: {attr.value}{attr.unit || ''}
          </span>
        ))}
      </ul>
    </details>
  );
};

const StructureSection: React.FC<{
  children?: string[],
  onItemClick: (id: string) => void,
  getChildItem: (id: string) => ModelItem | undefined
}> = ({ children, onItemClick, getChildItem }) => {
  if (!children || children.length === 0) return null;

  return (
    <details className="card__section" open>
      <summary>Structure <span className="badge">{children.length}</span></summary>
      <pp-table>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {children.map(childId => {
              const childItem = getChildItem(childId);
              if (!childItem) return null;
              return (
                <tr key={childId}>
                  <td>
                    <a href="#" onClick={(e) => {
                      e.preventDefault();
                      onItemClick(childItem.id);
                    }}>
                      {childItem.name}
                    </a>
                  </td>
                  <td>{childItem.type}</td>
                  <td className="pp-table-ellipsis">{childItem.description}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </pp-table>
    </details>
  );
};

const RelatedObjectsSection: React.FC<{
  relatedObjects: Array<{id: string, label: string, description: string, relationship: string, isAIInferred?: boolean}>,
  onItemClick: (id: string) => void,
  aiLoading?: boolean
}> = ({ relatedObjects, onItemClick, aiLoading = false }) => {
  if (relatedObjects.length === 0 && !aiLoading) return null;

  return (
    <div>
      {aiLoading && (
        <div className="loading-state">
          <pp-spinner size="small"></pp-spinner>
          <small className="muted">Discovering additional connections...</small>
        </div>
      )}
      <ul className="cards layout-grid">
        {relatedObjects.map((item) => (
          <li key={item.id}>
            <article className={`card${item.isAIInferred ? ' dashed' : ''}`}>
              <div className="attribute">
                {item.relationship}
              </div>
              <h4 className="label">
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  onItemClick(item.id);
                }}>
                  {item.label}
                </a>
              </h4>
              <small className="description">{item.description}</small>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
};

const MainItemCard: React.FC<{
  item: ModelItem,
  onItemClick: (id: string) => void,
  getChildItem: (id: string) => ModelItem | undefined
}> = ({ item, onItemClick, getChildItem }) => {
  return (
    <article className="card">
      <div className="card__header">
        <h3 className="label flex">
          <iconify-icon icon="ph:cube-bold"></iconify-icon>
          {item.name}
        </h3>
        <button className="button button--plain">
          <iconify-icon className="icon" icon="ph:dots-three"></iconify-icon>
          <span className="inclusively-hidden">Actions</span>
        </button>
      </div>
      <p className="description">{item.description}</p>

      <AttributesSection attributes={item.attributes} />
      <StructureSection
        children={item.children}
        onItemClick={onItemClick}
        getChildItem={getChildItem}
      />
      {item.rulesAndConstraints && item.rulesAndConstraints.length > 0 && (
        <details className="card__section" open>
          <summary>Rules & Constraints <span className="badge">{item.rulesAndConstraints.length}</span></summary>
          <ul className="card__attributes">
            {item.rulesAndConstraints.map((rule, index) => (
              <li key={index}>{rule}</li>
            ))}
          </ul>
        </details>
      )}
    </article>
  );
};

/**
 * The main story component for Contextual Navigation using real data
 */
export const ContextualNavigation: Story = {
  render: () => {
    const [selectedItem, setSelectedItem] = useState<ModelItem | null>(null);
    const [relatedObjects, setRelatedObjects] = useState<Array<{id: string, label: string, description: string, relationship: string, isAIInferred?: boolean}>>([]);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      // Initialize with a random item from JuiceProduction data
      const initializeData = async () => {
        try {
          setLoading(true);
          await dataService.initialize();
          const allItems = dataService.getAllItems();
          const initialItem = getRandomItem(allItems);
          if (initialItem) {
            setSelectedItem(initialItem);

            // Load related objects with real AI streaming
            setAiLoading(true);
            const baseRelated = await dataService.getRelatedObjects(
              initialItem.id,
              (aiComponents) => {
                // Real-time AI updates as they stream in
                setRelatedObjects(prev => {
                  // Filter out existing AI components and add new ones
                  const nonAI = prev.filter(item => !item.isAIInferred);
                  return [...nonAI, ...aiComponents];
                });
              }
            );
            setRelatedObjects(baseRelated);
            setAiLoading(false);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
          setLoading(false);
        }
      };

      initializeData();
    }, []);

    const handleItemClick = async (itemId: string) => {
      try {
        const item = dataService.getItem(itemId);
        if (item) {
          setSelectedItem(item);

          // Load related objects for the new item with real AI streaming
          setAiLoading(true);
          setRelatedObjects([]); // Clear previous results
          const baseRelated = await dataService.getRelatedObjects(
            itemId,
            (aiComponents) => {
              // Real-time AI updates as they stream in
              setRelatedObjects(prev => {
                // Filter out existing AI components and add new ones
                const nonAI = prev.filter(item => !item.isAIInferred);
                return [...nonAI, ...aiComponents];
              });
            }
          );
          setRelatedObjects(baseRelated);
          setAiLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load item');
      }
    };

    const getChildItem = (childId: string) => dataService.getItem(childId);

    if (loading) {
      return (
        <div className="product-model-navigation layer gray">
          <div className="loading-state">
            <pp-spinner></pp-spinner>
            <p>Loading industrial process data...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="product-model-navigation layer gray">
          <div className="error">
            <iconify-icon icon="ph:warning-circle"></iconify-icon>
            <span>Error: {error}</span>
          </div>
        </div>
      );
    }

    if (!selectedItem) {
      return (
        <div className="product-model-navigation layer gray">
          <p>No item selected</p>
        </div>
      );
    }

    return (
      <div className="product-model-navigation layer gray">
        <section className="flow">
          <Breadcrumbs item={selectedItem} />

          <div className="cards">
            <div>
              <MainItemCard
                item={selectedItem}
                onItemClick={handleItemClick}
                getChildItem={getChildItem}
              />
            </div>
          </div>

          <RelatedObjectsSection
            relatedObjects={relatedObjects}
            onItemClick={handleItemClick}
            aiLoading={aiLoading}
          />
        </section>
      </div>
    );
  },
};