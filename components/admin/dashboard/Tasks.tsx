'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { DocLink } from '../DocModal';

/**
 * "To do": the dashboard's findings as one checklist, worked out from the CMS on each visit
 * (nothing to tick by hand: an item is done when the data says so, and it stays in the list,
 * struck through, so progress is visible). Open items sort by priority; each row goes straight
 * to the fix, in the pop-up editor where there is a single document to open.
 */

export type Priority = 'high' | 'medium' | 'normal';
export type Task = { key: string; label: string; detail: string; priority: Priority; done: boolean; href: string; doc?: { collection: string; id: number } };

const RANK: Record<Priority, number> = { high: 0, medium: 1, normal: 2 };
const WORD: Record<Priority, string> = { high: 'High', medium: 'Medium', normal: 'Normal' };
type Filter = 'all' | 'open' | 'done';

export function Tasks({ tasks }: { tasks: Task[] }) {
  const open = tasks.filter((t) => !t.done).sort((a, b) => RANK[a.priority] - RANK[b.priority]);
  const done = tasks.filter((t) => t.done);
  const [filter, setFilter] = useState<Filter>(open.length ? 'open' : 'all');
  const shown = filter === 'open' ? open : filter === 'done' ? done : [...open, ...done];
  const tabs: { key: Filter; label: string; n: number }[] = [
    { key: 'all', label: 'All', n: tasks.length },
    { key: 'open', label: 'Open', n: open.length },
    { key: 'done', label: 'Done', n: done.length },
  ];

  return (
    <>
      <div className="cms-card-head">
        <div>
          <h2 id="dash-tasks">To do {open.length > 0 && <span className="cms-count is-strong">{open.length}</span>}</h2>
          <p className="cms-muted">{open.length ? `${done.length} of ${tasks.length} done` : 'All caught up'}</p>
        </div>
      </div>
      <div className="cms-tabs cms-tabs-block" role="group" aria-label="Show">
        {tabs.map((t) => (
          <button key={t.key} type="button" aria-pressed={filter === t.key} onClick={() => setFilter(t.key)}>
            {t.label} <span className="cms-tab-n">{t.n}</span>
          </button>
        ))}
      </div>
      {shown.length ? (
        <ul className="cms-tasks">
          {shown.map((t) => {
            const inner = (
              <>
                <span className={`cms-task-mark${t.done ? ' is-done' : ''}`} aria-hidden="true">{t.done && <Icon name="check" size={12} weight="semibold" />}</span>
                <span className="cms-task-main">
                  <b>{t.label}</b>
                  <small>{t.detail}</small>
                </span>
                {!t.done && <span className={`cms-prio is-${t.priority}`}>{WORD[t.priority]}</span>}
                <span className="cms-sr">{t.done ? '(done)' : `(${WORD[t.priority]} priority)`}</span>
              </>
            );
            const cls = `cms-task${t.done ? ' is-done' : ''}`;
            return (
              <li key={t.key}>
                {t.doc
                  ? <DocLink className={cls} collection={t.doc.collection} id={t.doc.id} href={t.href}>{inner}</DocLink>
                  : <Link className={cls} href={t.href}>{inner}</Link>}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="cms-empty"><Icon name="check" size={16} /> {filter === 'done' ? 'Nothing finished yet.' : 'Nothing left to do.'}</p>
      )}
    </>
  );
}
