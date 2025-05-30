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
            <CommandItem>
              <Icon icon="ph:file" className="icon" aria-hidden="true" />
              OBJ-561
            </CommandItem>
            <CommandItem>
              <Icon icon="ph:file" className="icon" aria-hidden="true" />
              OBJ-568
            </CommandItem>
            <CommandItem>
              <Icon icon="ph:file" className="icon" aria-hidden="true" />
              OBJ-541
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Commands">
            <CommandItem>
              <Icon icon="ph:magnifying-glass" className="icon" aria-hidden="true" />
              Search…
              <span className="cmdk-shortcuts"><kbd>⌘</kbd> <kbd>S</kbd></span>
            </CommandItem>
            <CommandItem>
              <Icon icon="ph:plus" className="icon" aria-hidden="true" />
              Create…
              <span className="cmdk-shortcuts"><kbd>⌘</kbd> <kbd>N</kbd></span>
            </CommandItem>
            <CommandItem>
              <Icon icon="ph:pencil" className="icon" aria-hidden="true" />
              Change…
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Help">
            <CommandItem>
              <Icon icon="ph:files" className="icon" aria-hidden="true" />
              Search documentation
            </CommandItem>
            <CommandItem>
              <Icon icon="ph:chat" className="icon" aria-hidden="true" />
              Leave feedback
            </CommandItem>
            <CommandItem>
              <Icon icon="ph:envelope" className="icon" aria-hidden="true" />
              Contact support
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </>
  )
}

export default CommandMenu
