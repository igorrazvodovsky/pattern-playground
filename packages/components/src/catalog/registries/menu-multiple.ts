import { createContext } from 'react';

// Whether the MenuItems being rendered belong to a Menu with `multiple`: each
// registry's Menu provides it, and its MenuItem draws a checkbox row rather
// than a single choice.
export const MenuMultiple = createContext(false);
