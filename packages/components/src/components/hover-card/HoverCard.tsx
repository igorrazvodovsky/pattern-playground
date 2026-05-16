import React from 'react';
import { PreviewCard } from '@base-ui/react/preview-card';

export interface HoverCardProps {
  children: React.ReactElement;
  content: React.ReactNode;
  /**
   * The duration from when the mouse enters the trigger until the hover card opens.
   * @default 700
   */
  openDelay?: number;
  /**
   * The duration from when the mouse leaves the trigger until the hover card closes.
   * @default 300
   */
  closeDelay?: number;
  /**
   * Whether to show an arrow pointing to the trigger
   * @default false
   */
  showArrow?: boolean;
  /**
   * The preferred side of the trigger to render against when open
   * @default "bottom"
   */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /**
   * The distance in pixels from the trigger
   * @default 4
   */
  sideOffset?: number;
  /**
   * The preferred alignment against the trigger
   * @default "center"
   */
  align?: 'start' | 'center' | 'end';
  /**
   * Whether the hover card should avoid collisions with the boundary edges
   * @default true
   */
  avoidCollisions?: boolean;
}

export const PpHoverCard: React.FC<HoverCardProps> = ({
  children,
  content,
  openDelay = 1200,
  closeDelay = 300,
  showArrow = false,
  side = 'bottom',
  sideOffset = 4,
  align = 'center',
  avoidCollisions = true,
}) => {
  return (
    <PreviewCard.Root>
      <PreviewCard.Trigger delay={openDelay} closeDelay={closeDelay} render={children} />

      <PreviewCard.Portal>
        <PreviewCard.Positioner
          side={side}
          sideOffset={sideOffset}
          align={align}
          collisionAvoidance={avoidCollisions ? undefined : { side: 'none', align: 'none' }}
        >
          <PreviewCard.Popup className="hover-card__content">
            {content}
            {showArrow && <PreviewCard.Arrow className="hover-card__arrow" />}
          </PreviewCard.Popup>
        </PreviewCard.Positioner>
      </PreviewCard.Portal>
    </PreviewCard.Root>
  );
};
