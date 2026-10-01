'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import { Icon } from '@/components/ui/Icon';

/**
 * The enquiries-over-time chart: a single purple series with a crosshair tooltip, plus the
 * period's total, its change against the period before and the reply rate. Values and labels
 * stay in text colours.
 *
 * Days are cut in the editor's own time zone, which the server can't know, so the plot is
 * drawn only in the browser; until then an empty plot of the same size holds the space.
 */

type Range = 'week' | 'month' | 'year';
const RANGES: { key: Range; label: string; span: string }[] = [
  { key: 'week', label: 'Week', span: '7 days' },
  { key: 'month', label: 'Month', span: '30 days' },
  { key: 'year', label: 'Year', span: '12 months' },
];
const DAY = 86400000;
const noop = () => () => {};

type Hour = { t: number; n: number };
const sum = (hours: Hour[], from: number, to: number) => hours.reduce((a, h) => (h.t >= from && h.t < to ? a + h.n : a), 0);

function bucket(hours: Hour[], range: Range) {
  const now = new Date();
  if (range === 'year') {
    const from = new Date(now.getFullYear(), now.getMonth() - 11, 1).getTime();
    const before = new Date(now.getFullYear(), now.getMonth() - 23, 1).getTime();
    const data = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      return { label: d.toLocaleDateString('en-GB', { month: 'short' }), long: d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }), value: sum(hours, d.getTime(), next.getTime()) };
    });
    return { data, previous: sum(hours, before, from) };
  }
  const days = range === 'week' ? 7 : 30;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - (days - 1) * DAY;
  const data = Array.from({ length: days }, (_, i) => {
    const d = new Date(start + i * DAY);
    return { label: range === 'week' ? d.toLocaleDateString('en-GB', { weekday: 'short' }) : String(d.getDate()), long: d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' }), value: sum(hours, d.getTime(), d.getTime() + DAY) };
  });
  return { data, previous: sum(hours, start - days * DAY, start) };
}

/** Enquiries per day (or month). Takes hourly counts. */
export function EnquiryChart({ hours, replyRate }: { hours: Hour[]; replyRate: number | null }) {
  const ready = useSyncExternalStore(noop, () => true, () => false);
  const [range, setRange] = useState<Range>('month');
  const [hover, setHover] = useState<number | null>(null);
  const { data, previous } = useMemo(() => (ready ? bucket(hours, range) : { data: [], previous: 0 }), [hours, range, ready]);
  const total = data.reduce((a, d) => a + d.value, 0);
  const span = RANGES.find((r) => r.key === range)!.span;
  const change = previous ? Math.round(((total - previous) / previous) * 100) : null;

  const W = 640, H = 220, L = 32, R = 12, T = 16, B = 28;
  const max = Math.max(4, ...data.map((d) => d.value));
  const step = Math.ceil(max / 4);
  const top = step * 4;
  const x = (i: number) => L + (i * (W - L - R)) / Math.max(data.length - 1, 1);
  const y = (v: number) => T + (1 - v / top) * (H - T - B);
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ');
  const area = `${line} L${x(data.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const every = range === 'month' ? 5 : 1;

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!data.length) return;
    const box = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * W;
    const i = Math.round(((px - L) / (W - L - R)) * (data.length - 1));
    setHover(Math.min(Math.max(i, 0), data.length - 1));
  };

  return (
    <div className="cms-chart">
      <div className="cms-card-head">
        <div>
          <h2 id="dash-enquiries">Enquiries</h2>
          <p className="cms-muted">Messages from the contact form, by {range === 'year' ? 'month' : 'day'}</p>
        </div>
        <div className="cms-tabs" role="group" aria-label="Time range">
          {RANGES.map((r) => (
            <button key={r.key} type="button" aria-pressed={range === r.key} onClick={() => { setRange(r.key); setHover(null); }}>{r.label}</button>
          ))}
        </div>
      </div>

      <dl className="cms-stats">
        <div><dt>Last {span}</dt><dd>{ready ? total.toLocaleString('en-GB') : '–'}</dd></div>
        <div>
          <dt>vs previous {span}</dt>
          <dd className={change == null ? undefined : change > 0 ? 'is-up' : change < 0 ? 'is-down' : undefined}>
            {!ready ? '–' : change == null ? (total ? 'New' : '–') : <>{change !== 0 && <Icon name={change > 0 ? 'up' : 'down'} size={13} weight="semibold" />}{`${change > 0 ? '+' : ''}${change}%`}</>}
          </dd>
        </div>
        <div><dt>Replied</dt><dd>{replyRate == null ? '–' : `${replyRate}%`}</dd></div>
      </dl>

      <div className="cms-chart-plot">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Enquiries per ${range === 'year' ? 'month' : 'day'}, ${total} in the last ${span}`} onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
          <defs>
            <linearGradient id="enq-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--chart-1)" stopOpacity=".38" />
              <stop offset="1" stopColor="var(--chart-1)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3, 4].map((k) => (
            <g key={k}>
              <line x1={L} x2={W - R} y1={y(k * step)} y2={y(k * step)} className="cms-grid" />
              {ready && <text x={L - 8} y={y(k * step) + 4} className="cms-axis" textAnchor="end">{k * step}</text>}
            </g>
          ))}
          {data.map((d, i) => (i % every === 0 || i === data.length - 1) && <text key={i} x={x(i)} y={H - 8} className="cms-axis" textAnchor="middle">{d.label}</text>)}
          {!!data.length && <path d={area} fill="url(#enq-fill)" />}
          {!!data.length && <path d={line} fill="none" stroke="var(--chart-1)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
          {hover != null && data[hover] && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={T} y2={y(0)} className="cms-crosshair" />
              <circle cx={x(hover)} cy={y(data[hover].value)} r="5" fill="var(--chart-1)" strokeWidth="2" style={{ stroke: 'var(--d-card, #fff)' }} />
            </g>
          )}
        </svg>
        {hover != null && data[hover] && (
          <div className="cms-tooltip" style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(data[hover].value) / H) * 100}%` }}>
            <b>{data[hover].value}</b> {data[hover].value === 1 ? 'enquiry' : 'enquiries'}
            <small>{data[hover].long}</small>
          </div>
        )}
        {ready && total === 0 && <p className="cms-chart-empty">No enquiries in this period yet. They’ll appear here as the contact form is used.</p>}
      </div>
      <table className="sr-only">
        <caption>Enquiries per {range === 'year' ? 'month' : 'day'}</caption>
        <tbody>{data.map((d, i) => <tr key={i}><th>{d.long}</th><td>{d.value}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
