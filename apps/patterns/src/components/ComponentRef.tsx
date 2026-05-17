import type { ReactNode } from 'react';

interface ComponentRefProps {
  id: string;
  children: ReactNode;
}

const storybookUrl = import.meta.env.PUBLIC_STORYBOOK_URL ?? 'http://localhost:6006';

export function ComponentRef({ id, children }: ComponentRefProps) {
  return (
    <a
      href={`${storybookUrl}/?path=/docs/${id}`}
      target="_blank"
      rel="noopener"
    >
      {children}
    </a>
  );
}
