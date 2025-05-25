import { useState } from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";

function CommandTest() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Command label="Command Menu">
        <CommandInput />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Recent">
            <CommandItem>
              <iconify-icon class="icon" icon="ph:file" aria-hidden="true"></iconify-icon>
              OBJ-561
            </CommandItem>
            <CommandItem>
              <iconify-icon class="icon" icon="ph:file" aria-hidden="true"></iconify-icon>
              OBJ-568
            </CommandItem>
            <CommandItem>
              <iconify-icon class="icon" icon="ph:file" aria-hidden="true"></iconify-icon>
              OBJ-541
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Commands">
            <CommandItem>
              <iconify-icon class="icon" icon="ph:magnifying-glass" aria-hidden="true"></iconify-icon>
              Search…
              <span className="cmdk-shortcuts"><kbd>⌘</kbd> <kbd>S</kbd></span>
            </CommandItem>
            <CommandItem>
              <iconify-icon class="icon" icon="ph:plus" aria-hidden="true"></iconify-icon>
              Create…
              <span className="cmdk-shortcuts"><kbd>⌘</kbd> <kbd>N</kbd></span>
            </CommandItem>
            <CommandItem>
              <iconify-icon class="icon" icon="ph:pencil" aria-hidden="true"></iconify-icon>
              Change…
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Help">
            <CommandItem>
              <iconify-icon class="icon" icon="ph:files" aria-hidden="true"></iconify-icon>
              Search documentation
            </CommandItem>
            <CommandItem>
              <iconify-icon class="icon" icon="ph:chat" aria-hidden="true"></iconify-icon>
              Leave feedback
            </CommandItem>
            <CommandItem>
              <iconify-icon class="icon" icon="ph:envelope" aria-hidden="true"></iconify-icon>
              Contact support
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </>
  )
}

export default CommandTest
