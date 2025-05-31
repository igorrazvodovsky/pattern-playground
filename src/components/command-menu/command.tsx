"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { Icon } from '@iconify/react'

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ ...props }, ref) => (
  <div cmdk-input-wrapper="">
    <Icon icon="ph:magnifying-glass" className="icon" aria-hidden="true" />
    <CommandPrimitive.Input
      ref={ref}
      placeholder="Search, commands, etc."
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

interface CommandItemProps extends Omit<React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>, 'prefix'> {
  checked?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  CommandItemProps
>(({ children, checked, prefix, suffix, className, ...props }, ref) => {
  // Auto-detect icons in children and move them to prefix if no explicit prefix
  const processedChildren = React.useMemo(() => {
    if (prefix) return children; // If explicit prefix, don't auto-detect

    const childArray = React.Children.toArray(children);
    const iconIndex = childArray.findIndex((child) =>
      React.isValidElement(child) &&
      (child.type === Icon ||
       (child.props && (
         (child.props as any).icon ||
         (child.props as any).className?.includes('icon')
       )))
    );

    if (iconIndex === 0) {
      // First child is an icon, move it to prefix
      const icon = childArray[0];
      const remainingChildren = childArray.slice(1);
      return {
        detectedPrefix: icon,
        children: remainingChildren
      };
    }

    return { children: childArray };
  }, [children, prefix]);

  const finalPrefix = prefix || (processedChildren as any).detectedPrefix;
  const finalChildren = (processedChildren as any).children || children;

  return (
    <CommandPrimitive.Item
      ref={ref}
      className={`${checked ? 'command-item--checked' : ''} ${className || ''}`}
      {...props}
    >
      {/* Checkbox placeholder */}
      <span className="command-item__check">
        <Icon icon="ph:check" aria-hidden="true" />
      </span>

      {/* Prefix (icons, etc.) */}
      {finalPrefix && (
        <span className="command-item__prefix">
          {finalPrefix}
        </span>
      )}

      {/* Main content */}
      <span className="command-item__label">
        {finalChildren}
      </span>

      {/* Suffix (shortcuts, etc.) */}
      {suffix && (
        <span className="command-item__suffix">
          {suffix}
        </span>
      )}
    </CommandPrimitive.Item>
  )
})

CommandItem.displayName = CommandPrimitive.Item.displayName

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
}
