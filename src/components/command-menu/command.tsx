"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { Icon } from '@iconify/react'
import { Slot } from "@radix-ui/react-slot"

interface SlotProps {
  slot?: string;
  children?: React.ReactNode;
}

interface CommandItemSlots {
  prefix: React.ReactNode[];
  suffix: React.ReactNode[];
  content: React.ReactNode[];
}

// Custom hook for handling slotted children
const useCommandItemSlots = (children: React.ReactNode): CommandItemSlots => {
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

// Helper to detect icon in content
const detectIconInContent = (contentChildren: React.ReactNode[]): React.ReactNode | null => {
  if (contentChildren.length === 0) return null;

  const firstContentChild = contentChildren[0];
  if (React.isValidElement(firstContentChild) &&
      (firstContentChild.type === Icon ||
       (firstContentChild.props as any)?.icon ||
       (firstContentChild.props as any)?.className?.includes('icon'))) {
    return firstContentChild;
  }
  return null;
};

interface CommandProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive> {
  /** Callback fired when the Escape key is pressed. Return true to prevent default behavior. */
  onEscape?: () => boolean | void;
}

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  CommandProps
>(({ onEscape, onKeyDown, ...props }, ref) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && onEscape) {
      const handled = onEscape();
      if (handled) {
        e.preventDefault();
      }
    }

    // Call any existing onKeyDown handler
    onKeyDown?.(e);
  };

  return (
    <CommandPrimitive
      ref={ref}
      onKeyDown={handleKeyDown}
      {...props}
    />
  )
})
Command.displayName = CommandPrimitive.displayName

interface CommandInputProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> {
  placeholder?: string;
}

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  CommandInputProps
>(({ placeholder = "Search, commands, etc.", ...props }, ref) => (
  <div cmdk-input-wrapper="">
    <Icon icon="ph:magnifying-glass" className="icon" aria-hidden="true" />
    <CommandPrimitive.Input
      ref={ref}
      placeholder={placeholder}
      {...props}
    />
  </div>
))

CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    {...props}
  />
))

CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    {...props}
  />
))

CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    {...props}
  />
))

CommandGroup.displayName = CommandPrimitive.Group.displayName

interface CommandItemProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> {
  checked?: boolean;
  asChild?: boolean;
}

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  CommandItemProps
>(({ children, checked, asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : CommandPrimitive.Item;
  const { prefix, suffix, content } = useCommandItemSlots(children);

  if (asChild) {
    return (
      <Comp ref={ref} className={`${checked ? 'command-item--checked' : ''} ${className || ''}`}>
        {children}
      </Comp>
    );
  }

  return (
    <CommandPrimitive.Item
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
    </CommandPrimitive.Item>
  );
});

CommandItem.displayName = CommandPrimitive.Item.displayName

interface CommandItemPrefixProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Content to be rendered in the prefix slot */
  children?: React.ReactNode;
}

const CommandItemPrefix = React.forwardRef<
  HTMLSpanElement,
  CommandItemPrefixProps
>(({ children, ...props }, ref) => (
  <span ref={ref} slot="prefix" {...props}>
    {children}
  </span>
))
CommandItemPrefix.displayName = "CommandItemPrefix"

interface CommandItemSuffixProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Content to be rendered in the suffix slot */
  children?: React.ReactNode;
}

const CommandItemSuffix = React.forwardRef<
  HTMLSpanElement,
  CommandItemSuffixProps
>(({ children, ...props }, ref) => (
  <span ref={ref} slot="suffix" {...props}>
    {children}
  </span>
))
CommandItemSuffix.displayName = "CommandItemSuffix"

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandItemPrefix,
  CommandItemSuffix,
}
