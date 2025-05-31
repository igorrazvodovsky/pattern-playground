import { useState } from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import 'iconify-icon'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': any;
    }
  }
}

function CommandMenu() {
  return (
    <>
      <Command label="Command Menu">
        <CommandInput />
        <hr />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Recent">
            <CommandItem>
              <iconify-icon icon="ph:file" slot="prefix"></iconify-icon>
              OBJ-561
            </CommandItem>
            <CommandItem>
              <iconify-icon icon="ph:file" slot="prefix"></iconify-icon>
              OBJ-568
            </CommandItem>
            <CommandItem>
              <iconify-icon icon="ph:file" slot="prefix"></iconify-icon>
              OBJ-541
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Commands">
            <CommandItem>
              <iconify-icon icon="ph:magnifying-glass" slot="prefix"></iconify-icon>
              Search…
              <span slot="suffix" className="cmdk-shortcuts">
                <kbd>⌘</kbd> <kbd>S</kbd>
              </span>
            </CommandItem>
            <CommandItem>
              <iconify-icon icon="ph:plus" slot="prefix"></iconify-icon>
              Create…
              <span slot="suffix" className="cmdk-shortcuts">
                <kbd>⌘</kbd> <kbd>N</kbd>
              </span>
            </CommandItem>
            <CommandItem>
              <iconify-icon icon="ph:pencil" slot="prefix"></iconify-icon>
              Change…
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </>
  )
}

export default CommandMenu
