'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { Status } from './data';
import { DocLink } from '../DocModal';

export type WorkItem = { key: string; id: number; kind: 'page' | 'project'; title: string; sub: string; path: string | null; href: string; status: Status; ago: string };

const LABEL: Record<Status, string> = { live: 'Live', edits: 'Unpublished changes', draft: 'Not live' };
const HINT: Record<Status, string> = {
  live: 'Published, nothing waiting',
  edits: 'Live, with newer edits saved as a draft. Publish to put them on the site.',
  draft: 'Not on the site. Visitors can’t see it until it’s published.',
};

/** Status badge: dot + word on the tone's soft ground. "Unpublished changes" pulses gently, so waiting work stands out. */
export function StatusBadge({ status }: { status: Status }) {
  return <span className={`cms-status is-${status}`} title={HINT[status]}><i aria-hidden="true" />{LABEL[status]}</span>;
}

type Filter = 'todo' | 'page' | 'project';

/** Pages and projects in one list, newest first; opens on what still needs publishing. */
export function Workflow({ items }: { items: WorkItem[] }) {
  const todo = items.filter((i) => i.status !== 'live');
  const [filter, setFilter] = useState<Filter>(todo.length ? 'todo' : 'page');
  const shown = filter === 'todo' ? todo : items.filter((i) => i.kind === filter);
  const tabs: { key: Filter; label: string; n: number }[] = [
    { key: 'todo', label: 'To publish', n: todo.length },
    { key: 'page', label: 'Pages', n: items.filter((i) => i.kind === 'page').length },
    { key: 'project', label: 'Projects', n: items.filter((i) => i.kind === 'project').length },
  ];

  return (
    <>
      <div className="cms-card-head">
        <div>
          <h2 id="dash-workflow">Content <span className="cms-count is-strong">{items.length}</span></h2>
          <p className="cms-muted">
            {todo.length ? `${todo.length} waiting to publish · ${todo.filter((i) => i.status === 'edits').length} with unpublished changes, ${todo.filter((i) => i.status === 'draft').length} not live` : 'Everything is published'}
          </p>
        </div>
        <div className="cms-tabs" role="group" aria-label="Show">
          {tabs.map((t) => (
            <button key={t.key} type="button" aria-pressed={filter === t.key} onClick={() => setFilter(t.key)}>
              {t.label} <span className="cms-tab-n">{t.n}</span>
            </button>
          ))}
        </div>
      </div>
      {shown.length ? (
        <ul className="cms-work">
          {shown.map((i) => (
            <li key={i.key}>
              <DocLink collection={i.kind === 'page' ? 'pages' : 'projects'} id={i.id} href={i.href} className="cms-work-row">
                <span className={`cms-tile tint-${i.kind === 'page' ? 0 : 3}`} aria-hidden="true"><Icon name={i.kind === 'page' ? 'file' : 'folder'} size={16} /></span>
                <span className="cms-work-main">
                  <b>{i.title}</b>
                  <small>{i.kind === 'page' ? 'Page' : 'Project'} · {i.sub} · edited {i.ago}</small>
                </span>
                <StatusBadge status={i.status} />
                <span className="cms-work-edit" aria-hidden="true">Edit</span>
              </DocLink>
              {i.status !== 'draft' && i.path && (
                <a className="cms-work-view" href={i.path} target="_blank" rel="noopener noreferrer" aria-label={`View ${i.title} on the site`} title="View on the site"><Icon name="external" size={15} /></a>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="cms-empty"><Icon name="check" size={16} /> Nothing waiting. Every page and project is live.</p>
      )}
    </>
  );
}
