import { createContext, useContext } from 'react';

// Whether a field sits in a Composer's `field` slot. Where a library's
// Composer draws the frame around the whole message (shadcn), the field
// leaves out its own.

const ComposerFieldContext = createContext(false);

export const ComposerField = ComposerFieldContext.Provider;

export const useInComposer = () => useContext(ComposerFieldContext);
