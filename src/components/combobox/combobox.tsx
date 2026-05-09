"use client"

import * as React from "react"
import { Command as ComboboxPrimitive } from "cmdk"
import { Icon } from '@iconify/react'
import { Slot } from "@radix-ui/react-slot"

interface SlotProps {
  slot?: string;
  children?: React.ReactNode;
}

interface ComboboxItemSlots {
  prefix: React.ReactNode[];
  suffix: React.ReactNode[];
  content: React.ReactNode[];
}

const useComboboxItemSlots = (children: React.ReactNode): ComboboxItemSlots => {
  return React.useMemo(() => {
    const childArray = React.Children.toArray(children);

    const isSlotChild = (child: React.ReactNode, slotName: string): boolean => {
      return React.isValidElement(child) && (child.props as SlotProps)?.slot === slotName;
    };

    return {
      prefix: childArray.filter(child => isSlotChild(child, 'prefix')),
      suffix: childArray.filter(child => isSlotChild(child, 'suffix')),
      content: childArray.filter(child =>
        !isSlotChild(child, 'prefix') && !isSlotChild(child, 'suffix')
      )
    };
  }, [children]);
};

interface ComboboxProps extends React.ComponentPropsWithoutRef<typeof ComboboxPrimitive> {
  /** Callback fired when the Escape key is pressed. Return true to prevent default behavior. */
  onEscape?: () => boolean | void;
}

const Combobox = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive>,
  ComboboxProps
>(({ onEscape, onKeyDown, ...props }, ref) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && onEscape) {
      const handled = onEscape();
      if (handled) {
        e.preventDefault();
      }
    }

    onKeyDown?.(e);
  };

  return (
    <ComboboxPrimitive
      ref={ref}
      onKeyDown={handleKeyDown}
      {...props}
    />
  )
})
Combobox.displayName = ComboboxPrimitive.displayName

interface ComboboxInputProps extends React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Input> {
  placeholder?: string;
}

const ComboboxInput = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Input>,
  ComboboxInputProps
>(({ placeholder = "Search, commands, etc.", ...props }, ref) => (
  <div cmdk-input-wrapper="">
    <Icon icon="ph:magnifying-glass" className="icon" aria-hidden="true" />
    <ComboboxPrimitive.Input
      ref={ref}
      placeholder={placeholder}
      {...props}
    />
  </div>
))

ComboboxInput.displayName = ComboboxPrimitive.Input.displayName

const ComboboxList = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.List>
>(({ ...props }, ref) => (
  <ComboboxPrimitive.List
    ref={ref}
    {...props}
  />
))

ComboboxList.displayName = ComboboxPrimitive.List.displayName

const ComboboxEmpty = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Empty>
>((props, ref) => (
  <ComboboxPrimitive.Empty
    ref={ref}
    {...props}
  />
))

ComboboxEmpty.displayName = ComboboxPrimitive.Empty.displayName

const ComboboxGroup = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Group>
>(({ ...props }, ref) => (
  <ComboboxPrimitive.Group
    ref={ref}
    {...props}
  />
))

ComboboxGroup.displayName = ComboboxPrimitive.Group.displayName

interface ComboboxItemProps extends React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Item> {
  checked?: boolean;
  asChild?: boolean;
}

const ComboboxItem = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Item>,
  ComboboxItemProps
>(({ children, checked, asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : ComboboxPrimitive.Item;
  const { prefix, suffix, content } = useComboboxItemSlots(children);

  if (asChild) {
    return (
      <Comp ref={ref} className={`${checked ? 'command-item--checked' : ''} ${className || ''}`}>
        {children}
      </Comp>
    );
  }

  return (
    <ComboboxPrimitive.Item
      ref={ref}
      className={`${checked ? 'command-item--checked' : ''} ${className || ''}`}
      {...props}
    >
      <span className="command-item__check">
        <Icon icon="ph:check" aria-hidden="true" />
      </span>

      {prefix.length > 0 && (
        <span className="command-item__prefix">
          {prefix.map((child, index) =>
            React.cloneElement(child as React.ReactElement, { key: index })
          )}
        </span>
      )}

      <span className="command-item__label">
        {content}
      </span>

      {suffix.length > 0 && (
        <span className="command-item__suffix">
          {suffix.map((child, index) =>
            React.cloneElement(child as React.ReactElement, { key: index })
          )}
        </span>
      )}
    </ComboboxPrimitive.Item>
  );
});

ComboboxItem.displayName = ComboboxPrimitive.Item.displayName

interface ComboboxItemPrefixProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Content to be rendered in the prefix slot */
  children?: React.ReactNode;
}

const ComboboxItemPrefix = React.forwardRef<
  HTMLSpanElement,
  ComboboxItemPrefixProps
>(({ children, ...props }, ref) => (
  <span ref={ref} slot="prefix" {...props}>
    {children}
  </span>
))
ComboboxItemPrefix.displayName = "ComboboxItemPrefix"

interface ComboboxItemSuffixProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Content to be rendered in the suffix slot */
  children?: React.ReactNode;
}

const ComboboxItemSuffix = React.forwardRef<
  HTMLSpanElement,
  ComboboxItemSuffixProps
>(({ children, ...props }, ref) => (
  <span ref={ref} slot="suffix" {...props}>
    {children}
  </span>
))
ComboboxItemSuffix.displayName = "ComboboxItemSuffix"

export {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxItemPrefix,
  ComboboxItemSuffix,
}

export type {
  ComboboxProps,
  ComboboxInputProps,
  ComboboxItemProps,
  ComboboxItemPrefixProps,
  ComboboxItemSuffixProps,
}
