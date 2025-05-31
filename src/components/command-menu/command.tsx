"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { Icon } from '@iconify/react'
import { Slot } from "@radix-ui/react-slot"

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

// Helper to identify slot children
const isSlotChild = (child: React.ReactNode, slotName: string): boolean => {
  return React.isValidElement(child) &&
    (child.props as any)?.slot === slotName
}

interface CommandItemProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> {
  checked?: boolean;
  asChild?: boolean;
}

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  CommandItemProps
>(({ children, checked, asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : CommandPrimitive.Item

  // Extract slotted children
  const childArray = React.Children.toArray(children)
  const prefixChildren = childArray.filter(child => isSlotChild(child, 'prefix'))
  const suffixChildren = childArray.filter(child => isSlotChild(child, 'suffix'))
  const contentChildren = childArray.filter(child =>
    !isSlotChild(child, 'prefix') && !isSlotChild(child, 'suffix')
  )

  // Auto-detect icons for backward compatibility
  const autoDetectedPrefix = React.useMemo(() => {
    if (prefixChildren.length > 0) return null

    const firstContentChild = contentChildren[0]
    if (React.isValidElement(firstContentChild) &&
        (firstContentChild.type === Icon ||
         (firstContentChild.props as any)?.icon ||
         (firstContentChild.props as any)?.className?.includes('icon'))) {
      return firstContentChild
    }
    return null
  }, [contentChildren, prefixChildren])

  const finalContentChildren = autoDetectedPrefix
    ? contentChildren.slice(1)
    : contentChildren

  if (asChild) {
    return (
      <Comp ref={ref} className={`${checked ? 'command-item--checked' : ''} ${className || ''}`}>
        {children}
      </Comp>
    )
  }

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

      {/* Prefix (slotted or auto-detected) */}
      {(prefixChildren.length > 0 || autoDetectedPrefix) && (
        <span className="command-item__prefix">
          {prefixChildren.map((child, index) =>
            React.cloneElement(child as React.ReactElement, { key: index })
          )}
          {autoDetectedPrefix}
        </span>
      )}

      {/* Main content */}
      <span className="command-item__label">
        {finalContentChildren}
      </span>

      {/* Suffix (slotted) */}
      {suffixChildren.length > 0 && (
        <span className="command-item__suffix">
          {suffixChildren.map((child, index) =>
            React.cloneElement(child as React.ReactElement, { key: index })
          )}
        </span>
      )}
    </CommandPrimitive.Item>
  )
})

CommandItem.displayName = CommandPrimitive.Item.displayName

// Convenience components for slotted content
const CommandItemPrefix = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ children, ...props }, ref) => (
  <span ref={ref} slot="prefix" {...props}>
    {children}
  </span>
))
CommandItemPrefix.displayName = "CommandItemPrefix"

const CommandItemSuffix = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
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
