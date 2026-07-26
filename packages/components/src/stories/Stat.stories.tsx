import type { Meta, StoryObj } from "@storybook/react-vite";
import 'iconify-icon';
import '../jsx-types';

const meta = {
  title: "Templates/Stat",
} satisfies Meta;

export default meta;
type Story = StoryObj;

interface StatTileProps {
  label: string;
  value: string;
  unit?: string;
  verdict: string;
  detail: string;
  delta?: string;
  deltaIcon?: string;
  trend?: 'success' | 'danger';
  alert?: boolean;
}

function StatTile({ label, value, unit, verdict, detail, delta, deltaIcon, trend, alert }: StatTileProps) {
  return (
    <li>
      <article className="card" data-alert={alert || undefined}>
        <div className="card__header">
          <h4 className="label">{label}</h4>
          {delta && (
            <span className={`badge badge--pill${trend ? ` badge--${trend}` : ''}`}>
              {deltaIcon && <iconify-icon className="icon" icon={deltaIcon} aria-hidden="true"></iconify-icon>}
              {delta}
            </span>
          )}
        </div>
        <div className="stat pad">
          <strong className="stat__value">
            {value}
            {unit && <span className="stat__unit"> {unit}</span>}
          </strong>
          <p className="stat__verdict">{verdict}</p>
          <p className="muted">{detail}</p>
        </div>
      </article>
    </li>
  );
}

export const Stat: Story = {
  render: () => (
    <ul className="cards layout-grid">
      <StatTile
        label="Open problems"
        value="3"
        verdict="Two resolved since last week"
        detail="Oldest has been open 12 days"
        delta="−2"
        deltaIcon="ph:arrow-down-right"
        trend="success"
      />
      <StatTile
        label="Avg. lead time"
        value="9.4"
        unit="days"
        verdict="Holding steady"
        detail="Across 24 in-production items"
      />
      <StatTile
        label="Overdue reviews"
        value="7"
        verdict="Backlog growing"
        detail="4 waiting on supplier data"
        delta="+3"
        deltaIcon="ph:arrow-up-right"
        trend="danger"
        alert
      />
    </ul>
  ),
};
