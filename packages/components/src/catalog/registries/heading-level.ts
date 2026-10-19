import { createContext, createElement, useContext, type ReactNode } from 'react';

// The heading level of a demo's titles. A demo is its own interface, so its
// outline starts at a fixed level (3) and does not continue the page it sits
// in; the frame around it is a named region. A titled type renders its title
// at the current level and its content one level down, so a card inside a
// card nests. Levels stop at 6. Titles keep their look at any level; only the
// outline changes.

export type HeadingTag = 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

const HeadingLevelContext = createContext(3);

const HeadingLevel = HeadingLevelContext.Provider;

export const useHeading = (): HeadingTag =>
  `h${Math.min(Math.max(useContext(HeadingLevelContext), 2), 6)}` as HeadingTag;

/** Content under a title: its own titles are one level down. */
export function Subsection({ children }: { children?: ReactNode }) {
  const level = useContext(HeadingLevelContext);
  return createElement(HeadingLevel, { value: level + 1 }, children);
}
