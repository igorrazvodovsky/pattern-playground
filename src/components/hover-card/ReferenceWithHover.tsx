import React from 'react';
import { PpHoverCard } from './HoverCard';
import { ReferencePreview } from './ReferencePreview';
import type { SelectedReference } from '../reference-picker/reference-picker-types';

export interface ReferenceWithHoverProps {
  reference: SelectedReference;
  children: React.ReactNode;
  openDelay?: number;
  closeDelay?: number;
}

export const ReferenceWithHover: React.FC<ReferenceWithHoverProps> = ({
  reference,
  children,
  openDelay = 700,
  closeDelay = 300,
}) => {
  return (
    <PpHoverCard
      content={<ReferencePreview reference={reference} />}
      openDelay={openDelay}
      closeDelay={closeDelay}
      side="top"
      sideOffset={8}
      align="center"
      avoidCollisions={true}
    >
      {children}
    </PpHoverCard>
  );
};