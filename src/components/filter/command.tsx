"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { Icon } from "@iconify/react"
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
    <Icon icon="ph:magnifying-glass" />
    <CommandPrimitive.Input
      ref={ref}
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
  // Extract slotted children
  const childArray = React.Children.toArray(children)
  const prefixChildren = childArray.filter(child => isSlotChild(child, 'prefix'))
  const suffixChildren = childArray.filter(child => isSlotChild(child, 'suffix'))
  const contentChildren = childArray.filter(child =>
    !isSlotChild(child, 'prefix') && !isSlotChild(child, 'suffix')
  )

  if (asChild && React.isValidElement(children)) {
    return (
      <Slot ref={ref} className={`${checked ? 'command-item--checked' : ''} ${className || ''}`}>
        {children}
      </Slot>
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

      {/* Prefix (slotted) */}
      {prefixChildren.length > 0 && (
        <span className="command-item__prefix">
          {prefixChildren.map((child, index) =>
            React.cloneElement(child as React.ReactElement, { key: index })
          )}
        </span>
      )}

      {/* Main content */}
      <span className="command-item__label">
        {contentChildren}
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

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
}
