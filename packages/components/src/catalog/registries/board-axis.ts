import { createContext } from 'react';

// The axis of the Board a Disclosure sits in, if any. Each registry's Board
// provides it and its Disclosure reads it, to draw itself as one of the
// board's groups rather than on its own.
export const BoardAxis = createContext<'lanes' | 'sections' | null>(null);
