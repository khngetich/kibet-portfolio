'use client';

import { useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';

/**
 * Interactive pieces of the dashboard: the horizontally scrolling page strip and the
 * enquiries-over-time chart: a single purple series with a crosshair tooltip. Values and
 * labels stay in text colours.
 */

export function Scroller({ children, label }: { children: React.ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const by = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.8, behavior: 'smooth' });
  return (
    <div className="cms-scroller">
      <div ref={ref} className="cms-scroller-track" role="region" aria-label={label} tabIndex={0}>{children}</div>
      <button type="button" className="cms-scroller-btn is-prev" onClick={() => by(-1)} aria-label="Scroll back"><Icon name="left" size={18} /></button>
      <button type="button" className="cms-scroller-btn is-next" onClick={() => by(1)} aria-label="Scroll forward"><Icon name="right" size={18} /></button>
    </div>
  );
}

type Range = 'week' | 'month' | 'year';
const RANGES: { key: Range; label: string }[] = [{ key: 'week', label: 'Week' }, { key: 'month', label: 'Month' }, { key: 'year', label: 'Year' }];
const DAY = 86400000;

function bucket(dates: number[], range: Range) {
  const now = new Date();
  if (range === 'year') {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      return { label: d.toLocaleDateString('en-GB', { month: 'short' }), long: d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }), value: dates.filter((t) => t >= d.getTime() && t < next.getTime()).length };
    });
  }
  const days = range === 'week' ? 7 : 30;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - (days - 1) * DAY;
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(start + i * DAY);
    return { label: range === 'week' ? d.toLocaleDateString('en-GB', { weekday: 'short' }) : String(d.getDate()), long: d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' }), value: dates.filter((t) => t >= d.getTime() && t < d.getTime() + DAY).length };
  });
}

/** Enquiries per day (or month) as a single purple area with a crosshair tooltip. */
export function EnquiryChart({ dates }: { dates: string[] }) {
  const [range, setRange] = useState<Range>('month');
  const [hover, setHover] = useState<number | null>(null);
  const times = useMemo(() => dates.map((d) => new Date(d).getTime()), [dates]);
  const data = useMemo(() => bucket(times, range), [times, range]);
  const total = data.reduce((a, d) => a + d.value, 0);

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
    const box = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * W;
    const i = Math.round(((px - L) / (W - L - R)) * (data.length - 1));
    setHover(Math.min(Math.max(i, 0), data.length - 1));
  };

  return (
    <div className="cms-chart">
      <div className="cms-card-head">
        <div>
          <h2>Enquiries</h2>
          <p className="cms-muted">{total} in the last {range === 'week' ? '7 days' : range === 'month' ? '30 days' : '12 months'}</p>
        </div>
        <div className="cms-tabs" role="group" aria-label="Time range">
          {RANGES.map((r) => (
            <button key={r.key} type="button" aria-pressed={range === r.key} className={range === r.key ? 'is-active' : undefined} onClick={() => setRange(r.key)}>{r.label}</button>
          ))}
        </div>
      </div>
      <div className="cms-chart-plot">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Enquiries per ${range === 'year' ? 'month' : 'day'}, ${total} in total`} onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
          <defs>
            <linearGradient id="enq-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--chart-purple)" stopOpacity=".38" />
              <stop offset="1" stopColor="var(--chart-purple)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3, 4].map((k) => (
            <g key={k}>
              <line x1={L} x2={W - R} y1={y(k * step)} y2={y(k * step)} className="cms-grid" />
              <text x={L - 8} y={y(k * step) + 4} className="cms-axis" textAnchor="end">{k * step}</text>
            </g>
          ))}
          {data.map((d, i) => (i % every === 0 || i === data.length - 1) && <text key={i} x={x(i)} y={H - 8} className="cms-axis" textAnchor="middle">{d.label}</text>)}
          <path d={area} fill="url(#enq-fill)" />
          <path d={line} fill="none" stroke="var(--chart-purple)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {hover != null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={T} y2={y(0)} className="cms-crosshair" />
              <circle cx={x(hover)} cy={y(data[hover].value)} r="5" fill="var(--chart-purple)" strokeWidth="2" style={{ stroke: 'var(--d-card, #fff)' }} />
            </g>
          )}
        </svg>
        {hover != null && (
          <div className="cms-tooltip" style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(data[hover].value) / H) * 100}%` }}>
            <b>{data[hover].value}</b> {data[hover].value === 1 ? 'enquiry' : 'enquiries'}
            <small>{data[hover].long}</small>
          </div>
        )}
        {total === 0 && <p className="cms-chart-empty">No enquiries in this period yet. They’ll appear here as the contact form is used.</p>}
      </div>
      <table className="sr-only">
        <caption>Enquiries per {range === 'year' ? 'month' : 'day'}</caption>
        <tbody>{data.map((d, i) => <tr key={i}><th>{d.long}</th><td>{d.value}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
