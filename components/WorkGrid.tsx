'use client';

import { useState, type ReactNode } from 'react';
import { disciplineLabel } from '@/lib/format';

/**
 * Discipline filter for the work index. Cards are rendered on the server and passed in,
 * so filtering only toggles visibility — no refetch, no extra JS for the cards themselves.
 */
export function WorkGrid({ items }: { items: { disciplines: string[]; node: ReactNode }[] }) {
  const all = Array.from(new Set(items.flatMap((i) => i.disciplines)));
  const [filter, setFilter] = useState<string | null>(null);
  const shown = items.filter((i) => !filter || i.disciplines.includes(filter));

  return (
    <>
      {all.length > 1 && (
        <div className="filters" role="group" aria-label="Filter by discipline">
          <button type="button" aria-pressed={!filter} onClick={() => setFilter(null)}>All <span>{items.length}</span></button>
          {all.map((d) => (
            <button type="button" key={d} aria-pressed={filter === d} onClick={() => setFilter(d)}>
              {disciplineLabel(d)} <span>{items.filter((i) => i.disciplines.includes(d)).length}</span>
            </button>
          ))}
        </div>
      )}
      <div className="grid-work">{shown.map((i, n) => <div key={n} className="grid-cell">{i.node}</div>)}</div>
    </>
  );
}
