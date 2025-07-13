import React from 'react';
import * as HoverCard from '@radix-ui/react-hover-card';

export interface HoverCardProps {
  children: React.ReactNode;
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
    <HoverCard.Root openDelay={openDelay} closeDelay={closeDelay}>
      <HoverCard.Trigger asChild>
        {children}
      </HoverCard.Trigger>

      <HoverCard.Portal>
        <HoverCard.Content
          className="hover-card__content"
          side={side}
          sideOffset={sideOffset}
          align={align}
          avoidCollisions={avoidCollisions}
        >
          {content}
          {showArrow && <HoverCard.Arrow className="hover-card__arrow" />}
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
};