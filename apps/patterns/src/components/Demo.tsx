import type { ReactNode } from 'react';

interface DemoProps {
  children: ReactNode;
  label?: string;
}

export function Demo({ children, label }: DemoProps) {
  return (
    <div className="demo-block">
      <div className="demo-block__content">{children}</div>
      {label && <span className="demo-block__label">{label}</span>}
    </div>
  );
}
