'use client';

import { useRef } from 'react';

/**
 * Accessible tabs on the segmented-control look: one tab stop, arrow keys / Home / End to
 * move, each tab tied to its panel. Switching is instant (routine UI, no animation).
 * Pair with <TabPanel base={base} active={…}> around the content.
 */
export function TabList<T extends string | number>({ base, label, tabs, active, onChange, className = '' }: {
  base: string; label: string; tabs: { value: T; label: string }[]; active: T; onChange: (v: T) => void; className?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const last = tabs.length - 1;
    const to = e.key === 'ArrowRight' ? (i === last ? 0 : i + 1) : e.key === 'ArrowLeft' ? (i === 0 ? last : i - 1) : e.key === 'Home' ? 0 : e.key === 'End' ? last : null;
    if (to == null) return;
    e.preventDefault();
    onChange(tabs[to].value);
    refs.current[to]?.focus();
  };
  return (
    <div className={`st-seg ${className}`} role="tablist" aria-label={label}>
      {tabs.map((t, i) => {
        const on = t.value === active;
        return (
          <button
            key={String(t.value)} ref={(el) => { refs.current[i] = el; }} type="button" role="tab"
            id={`${base}-tab-${t.value}`} aria-controls={`${base}-panel`} aria-selected={on} tabIndex={on ? 0 : -1}
            className={on ? 'is-on' : undefined} onClick={() => onChange(t.value)} onKeyDown={(e) => onKeyDown(e, i)}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ base, active, className, children }: { base: string; active: string | number; className?: string; children: React.ReactNode }) {
  return <div role="tabpanel" id={`${base}-panel`} aria-labelledby={`${base}-tab-${active}`} className={className}>{children}</div>;
}
