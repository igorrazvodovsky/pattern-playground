import { useState } from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Icon } from '@iconify/react'

function CommandMenu() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Command label="Command Menu">
        <CommandInput />
        <hr />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Recent">
            <CommandItem prefix={<Icon icon="ph:file" className="icon" aria-hidden="true" />}>
              OBJ-561
            </CommandItem>
            <CommandItem prefix={<Icon icon="ph:file" className="icon" aria-hidden="true" />}>
              OBJ-568
            </CommandItem>
            <CommandItem prefix={<Icon icon="ph:file" className="icon" aria-hidden="true" />}>
              OBJ-541
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Commands">
            <CommandItem
              prefix={<Icon icon="ph:magnifying-glass" className="icon" aria-hidden="true" />}
              suffix={<span className="cmdk-shortcuts"><kbd>⌘</kbd> <kbd>S</kbd></span>}
            >
              Search…
            </CommandItem>
            <CommandItem
              prefix={<Icon icon="ph:plus" className="icon" aria-hidden="true" />}
              suffix={<span className="cmdk-shortcuts"><kbd>⌘</kbd> <kbd>N</kbd></span>}
            >
              Create…
            </CommandItem>
            <CommandItem prefix={<Icon icon="ph:pencil" className="icon" aria-hidden="true" />}>
              Change…
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Help">
            <CommandItem prefix={<Icon icon="ph:files" className="icon" aria-hidden="true" />}>
              Search documentation
            </CommandItem>
            <CommandItem prefix={<Icon icon="ph:chat" className="icon" aria-hidden="true" />}>
              Leave feedback
            </CommandItem>
            <CommandItem prefix={<Icon icon="ph:envelope" className="icon" aria-hidden="true" />}>
              Contact support
            </CommandItem>
          </CommandGroup>

          {/* Example with legacy structure (auto-detection) */}
          <CommandGroup heading="Legacy Support">
            <CommandItem>
              <Icon icon="ph:gear" className="icon" aria-hidden="true" />
              Settings (auto-detected icon)
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </>
  )
}

export default CommandMenu
