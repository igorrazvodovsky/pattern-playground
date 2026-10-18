import type { ReactNode } from 'react';
import { STORYBOOK_URL } from '../lib/site';

interface ComponentRefProps {
  id: string;
  children: ReactNode;
}

export function ComponentRef({ id, children }: ComponentRefProps) {
  return (
    <a href={`${STORYBOOK_URL}/?path=/docs/${id}`}>
      {children}
    </a>
  );
}
