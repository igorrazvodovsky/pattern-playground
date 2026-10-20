import { createContext, useContext } from 'react';

// Where a library's Composer frames the whole message (shadcn), a field in its
// `field` slot leaves out its own frame.

const ComposerFieldContext = createContext(false);

export const ComposerField = ComposerFieldContext.Provider;

export const useInComposer = () => useContext(ComposerFieldContext);
