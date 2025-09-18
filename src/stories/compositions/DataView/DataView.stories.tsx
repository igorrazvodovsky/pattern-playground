import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState, useMemo } from "react";
import productsData from '../../data/products.json' with { type: 'json' };
import { Product } from '../../data/types';
import { DataViewProps, ViewMode, AttributeSelection } from './types';
import { getAvailableAttributes } from './utils';
import { CardView } from './CardView';
import { ListView } from './ListView';
import { TableView } from './TableView';
import { ViewSwitcher } from './ViewSwitcher';
import { AttributeSelector } from './AttributeSelector';

const DataViewComponent: React.FC<DataViewProps> = ({
  products,
  defaultView = 'card',
  defaultAttributes = ['category', 'pricing.msrp', 'availability.status']
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [selectedAttributes, setSelectedAttributes] = useState<AttributeSelection>(
    new Set(defaultAttributes)
  );

  const availableAttributes = useMemo(() => getAvailableAttributes(products), [products]);

  const handleAttributeToggle = (attribute: string) => {
    setSelectedAttributes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(attribute)) {
        newSet.delete(attribute);
      } else {
        newSet.add(attribute);
      }
      return newSet;
    });
  };

  if (selectedAttributes.size === 0) {
    return (
      <div>
        <div className="empty-state border flow">
          <iconify-icon style={{fontSize: "3rem"}} icon="ph:list"></iconify-icon>
          <h3>Select attributes to view</h3>
          <p>Choose which product details you'd like to see from the attributes dropdown.</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div>
        <div className="empty-state border flow">
          <h3>No products to display</h3>
          <p>Check your data source or try adjusting your filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="toolbar flex" style={{ marginBottom: 'var(--space-l)' }}>
        <ViewSwitcher currentView={viewMode} onViewChange={setViewMode} />
        <AttributeSelector
          availableAttributes={availableAttributes}
          selectedAttributes={selectedAttributes}
          onAttributeToggle={handleAttributeToggle}
        />
      </div>

      {(() => {
        switch (viewMode) {
          case 'card':
            return <CardView products={products} selectedAttributes={selectedAttributes} />;
          case 'list':
            return <ListView products={products} selectedAttributes={selectedAttributes} />;
          case 'table':
            return <TableView products={products} selectedAttributes={selectedAttributes} />;
          default:
            return <CardView products={products} selectedAttributes={selectedAttributes} />;
        }
      })()}
    </div>
  );
};

const meta = {
  title: "Compositions/Data view",
  component: DataViewComponent,
  argTypes: {
    defaultView: {
      control: { type: 'select' },
      options: ['card', 'list', 'table'],
    },
    defaultAttributes: {
      control: { type: 'object' },
    },
  },
} satisfies Meta<typeof DataViewComponent>;

export default meta;
type Story = StoryObj<typeof DataViewComponent>;

export const DataView: Story = {
  args: {
    products: productsData as unknown as Product[],
    defaultView: 'card',
    defaultAttributes: ['category', 'pricing.msrp', 'availability.status'],
  },
};