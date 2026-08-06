import type { CSSProperties } from 'react';
import '../jsx-types';

export function IndicatorsDemo() {
  return (
    <div className="flow">
      <ul className="cards layout-grid">
        <li>
          <article className="card flow pad" style={{ '--flow-space': '0em' } as CSSProperties}>
            <p className="muted"><small>Initial investment</small></p>
            <p style={{ fontSize: 'larger' }}>$10,000.00</p>
            <p className="muted"><small>Final value</small></p>
            <p style={{ fontSize: 'larger' }}><mark>$12,163.54</mark></p>
          </article>
        </li>
        <li>
          <pp-list>
            <pp-list-item type="checkbox" checked>Paired switching</pp-list-item>
            <pp-list-item>Tactical asset allocation</pp-list-item>
            <pp-list-item>
              High reward
              <span data-slot="suffix">
                <strong className="badge badge--pill badge--pulse badge--danger">2</strong>
              </span>
            </pp-list-item>
            <pp-list-item>Last one</pp-list-item>
          </pp-list>
        </li>
      </ul>
    </div>
  );
}
