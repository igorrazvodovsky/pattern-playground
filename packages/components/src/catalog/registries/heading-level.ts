import { createContext, createElement, useContext, type ReactNode } from 'react';

// A demo is its own interface, so its outline starts at a fixed level and
// does not continue the page around it.

export type HeadingTag = 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

const HeadingLevelContext = createContext(3);

const HeadingLevel = HeadingLevelContext.Provider;

export const useHeading = (): HeadingTag =>
  `h${Math.min(Math.max(useContext(HeadingLevelContext), 2), 6)}` as HeadingTag;

export function Subsection({ children }: { children?: ReactNode }) {
  const level = useContext(HeadingLevelContext);
  return createElement(HeadingLevel, { value: level + 1 }, children);
}
