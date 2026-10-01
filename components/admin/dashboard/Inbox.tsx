'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { OpenInModal } from '../Crud';

/**
 * Latest enquiries with triage on the row: reply by email, mark replied / unread, archive,
 * or open the full record in a drawer. Changes show at once and are saved in the background;
 * after a save the server cards (and the sidebar's "new" badge) re-render via router.refresh().
 * Archiving leaves a short "Undo" in the row's place before the list closes the gap.
 */

type Status = 'new' | 'replied' | 'archived';
export type InboxItem = { id: number; name: string; email: string; service: string | null; excerpt: string; status: Status; ago: string };

const initials = (name: string) => name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

async function setStatus(id: number, status: Status) {
  const res = await fetch(`/api/inquiries/${id}?depth=0`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Could not save');
}

export function Inbox({ items, unread, admin }: { items: InboxItem[]; unread: number; admin: string }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [local, setLocal] = useState<Record<number, Status>>({});
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // a fresh server list replaces the optimistic overrides
  const [seen, setSeen] = useState(items);
  if (seen !== items) { setSeen(items); setLocal({}); }

  const statusOf = (i: InboxItem) => local[i.id] ?? i.status;
  const unreadNow = unread + items.reduce((a, i) => a + (local[i.id] ? (local[i.id] === 'new' ? 1 : 0) - (i.status === 'new' ? 1 : 0) : 0), 0);

  const change = async (item: InboxItem, to: Status) => {
    const from = statusOf(item);
    setError(null);
    setLocal((l) => ({ ...l, [item.id]: to }));
    try {
      await setStatus(item.id, to);
      window.clearTimeout(timer.current);
      // archived rows wait out the undo window before the list closes up
      timer.current = window.setTimeout(() => router.refresh(), to === 'archived' ? 6000 : 400);
    } catch {
      setLocal((l) => ({ ...l, [item.id]: from }));
      setError(`Couldn’t update ${item.name}’s enquiry. Check your connection and try again.`);
    }
  };

  return (
    <>
      <div className="cms-card-head">
        <div>
          <h2 id="dash-inbox">Inbox <span className={`cms-count${unreadNow ? ' is-new' : ''}`}>{unreadNow ? `${unreadNow} new` : 'All read'}</span></h2>
          <p className="cms-muted">Latest messages from the contact form</p>
        </div>
        <Link className="cms-link" href={`${admin}/collections/inquiries`}>All enquiries →</Link>
      </div>
      {error && <p className="cms-alert" role="alert">{error}</p>}
      {items.length ? (
        <ul className="cms-inbox">
          <AnimatePresence initial={false}>
            {items.map((e) => {
              const s = statusOf(e);
              if (s === 'archived') {
                return (
                  <motion.li key={`${e.id}-undo`} className="cms-inbox-undo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Icon name="archive" size={15} /> Archived {e.name}’s enquiry.
                    <button type="button" onClick={() => change(e, e.status === 'archived' ? 'new' : e.status)}>Undo</button>
                  </motion.li>
                );
              }
              const subject = encodeURIComponent(`Re: your enquiry${e.service ? ` about ${e.service}` : ''}`);
              return (
                <motion.li key={e.id} className={`cms-inbox-row${s === 'new' ? ' is-new' : ''}`} layout={reduce ? false : 'position'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <OpenInModal collection="inquiries" id={e.id} className="cms-inbox-open" label={`Open enquiry from ${e.name}`}>
                    <span className="cms-avatar" aria-hidden="true">{initials(e.name)}</span>
                    <span className="cms-inbox-main">
                      <span className="cms-inbox-top">
                        <b>{e.name}</b>
                        {s === 'new' && <span className="cms-new-dot" aria-label="Unread" />}
                        <small>{e.service || 'General enquiry'} · {e.ago}</small>
                      </span>
                      <span className="cms-inbox-excerpt">{e.excerpt}</span>
                    </span>
                  </OpenInModal>
                  <span className="cms-inbox-actions">
                    <a className="cms-icon-btn" href={`mailto:${e.email}?subject=${subject}`} title={`Reply to ${e.email}`} aria-label={`Reply to ${e.name} by email`}><Icon name="mail" size={16} /></a>
                    {s === 'new'
                      ? <button type="button" className="cms-icon-btn" onClick={() => change(e, 'replied')} title="Mark replied" aria-label={`Mark ${e.name}’s enquiry replied`}><Icon name="check" size={16} /></button>
                      : <button type="button" className="cms-icon-btn" onClick={() => change(e, 'new')} title="Mark unread" aria-label={`Mark ${e.name}’s enquiry unread`}><Icon name="undo" size={16} /></button>}
                    <button type="button" className="cms-icon-btn" onClick={() => change(e, 'archived')} title="Archive" aria-label={`Archive ${e.name}’s enquiry`}><Icon name="archive" size={16} /></button>
                  </span>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      ) : (
        <p className="cms-empty"><Icon name="inbox" size={16} /> No open enquiries. New messages from the contact form land here.</p>
      )}
    </>
  );
}
