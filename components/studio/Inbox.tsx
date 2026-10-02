'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { deleteEnquiry, getGlobal, listEnquiries, setEnquiryStatus } from './api';
import { useConfirm } from './Modal';
import { timeAgo } from './util';

/**
 * Enquiries as a mail client: the list on the left (filtered by status), the open message on
 * the right with its details, triage buttons and reply templates. A template opens your own
 * email app with the reply written (subject and body), so nothing is sent from the site; once
 * it's gone, "Mark replied" files it. Status changes show at once and save in the background.
 */

type Status = 'new' | 'replied' | 'archived';
type Enquiry = { id: number; name: string; email: string; service?: string | null; budget?: string | null; timeline?: string | null; message: string; status: Status; createdAt: string };
type Filter = 'open' | Status;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'open', label: 'Open' },
  { key: 'new', label: 'New' },
  { key: 'replied', label: 'Replied' },
  { key: 'archived', label: 'Archived' },
];

/** Replies, written in the first person; {placeholders} come from the enquiry and Site settings. */
function templates(e: Enquiry, site: { name: string; availability: string | null }) {
  const first = e.name.trim().split(/\s+/)[0] || 'there';
  const about = e.service ? ` about ${e.service.toLowerCase()}` : '';
  const me = site.name.split(' ')[0] || site.name;
  const when = site.availability ? `${site.availability}.` : 'I have room for new projects at the moment.';
  return [
    {
      key: 'call', label: 'Thanks, let’s talk',
      subject: `Re: your enquiry${about}`,
      body: `Hi ${first},\n\nThanks for getting in touch${about}. It sounds like a great project and I’d love to hear more. ${when}\n\nWould you be free for a quick call this week? Send over a couple of times that suit you.\n\nBest,\n${me}`,
    },
    {
      key: 'details', label: 'Ask for details',
      subject: `Re: your enquiry${about}`,
      body: `Hi ${first},\n\nThanks for your message! So I can give you an accurate quote and timeline, could you tell me a little more:\n\n• What you need delivered, and where it will be used\n• Your ideal timeline${e.timeline ? ` (you mentioned ${e.timeline})` : ''}\n• A budget range${e.budget ? ` (you mentioned ${e.budget})` : ''}\n• Any examples you like the look of\n\nBest,\n${me}`,
    },
    {
      key: 'booked', label: 'Fully booked',
      subject: `Re: your enquiry${about}`,
      body: `Hi ${first},\n\nThank you for thinking of me for this. I’m fully booked at the moment, so I can’t take it on and do it justice right now.\n\nIf your dates are flexible, I’d be glad to pick it up later; just let me know. Otherwise I hope it goes brilliantly.\n\nBest,\n${me}`,
    },
  ];
}

const mailto = (to: string, subject: string, body: string) => `mailto:${to}?${new URLSearchParams({ subject, body }).toString().replace(/\+/g, '%20')}`;
const initials = (name: string) => name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
const when = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export function EnquiriesManager() {
  const confirm = useConfirm();
  const [rows, setRows] = useState<Enquiry[] | null>(null);
  const [site, setSite] = useState<{ name: string; availability: string | null }>({ name: '', availability: null });
  const [filter, setFilter] = useState<Filter>('open');
  const [openId, setOpenId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => setRows((await listEnquiries()) as unknown as Enquiry[]), []);
  useEffect(() => {
    let live = true;
    listEnquiries().then((r) => { if (live) setRows(r as unknown as Enquiry[]); }).catch(() => { if (live) setRows([]); });
    getGlobal('site').then((s) => { if (live) { const g = s as { name?: string; availability?: string | null }; setSite({ name: g.name ?? '', availability: g.availability?.trim() || null }); } }).catch(() => {});
    return () => { live = false; };
  }, []);

  const counts = useMemo(() => {
    const r = rows ?? [];
    return { open: r.filter((e) => e.status !== 'archived').length, new: r.filter((e) => e.status === 'new').length, replied: r.filter((e) => e.status === 'replied').length, archived: r.filter((e) => e.status === 'archived').length };
  }, [rows]);
  const shown = (rows ?? []).filter((e) => (filter === 'open' ? e.status !== 'archived' : e.status === filter));
  // keep a selection when the filter changes, and fall back to the first visible message
  const open = shown.find((e) => e.id === openId) ?? shown[0] ?? null;

  const status = async (e: Enquiry, s: Status) => {
    setError(null);
    const before = rows;
    setRows((r) => r && r.map((x) => (x.id === e.id ? { ...x, status: s } : x)));
    try { await setEnquiryStatus(e.id, s); } catch { setRows(before); setError(`Couldn’t update ${e.name}’s enquiry. Try again.`); }
  };
  const remove = async (e: Enquiry) => {
    if (!(await confirm({ title: 'Delete this enquiry?', body: `The message from ${e.name} will be removed permanently.`, confirmLabel: 'Delete', danger: true }))) return;
    await deleteEnquiry(e.id);
    setOpenId(null);
    load();
  };

  if (!rows) return <p className="st-help">Loading…</p>;
  if (!rows.length) return <p className="st-empty-note">No messages yet. They arrive here from the contact form.</p>;

  return (
    <div className="st-mail">
      <div className="st-mail-list">
        <div className="st-seg st-mail-filters" role="group" aria-label="Show">
          {FILTERS.map((f) => (
            <button key={f.key} type="button" className={filter === f.key ? 'is-on' : undefined} aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
              {f.label} <span className="st-mail-n">{counts[f.key]}</span>
            </button>
          ))}
        </div>
        {shown.length ? (
          <ul>
            {shown.map((e) => (
              <li key={e.id}>
                <button type="button" className={`st-mail-item${open?.id === e.id ? ' is-on' : ''}${e.status === 'new' ? ' is-new' : ''}`} aria-current={open?.id === e.id ? 'true' : undefined} onClick={() => setOpenId(e.id)}>
                  <span className="st-mail-avatar" aria-hidden="true">{initials(e.name)}</span>
                  <span className="st-mail-text">
                    <span className="st-mail-top"><b>{e.name}</b><small>{timeAgo(e.createdAt)}</small></span>
                    <span className="st-mail-subject">{e.service || 'General enquiry'}{e.status === 'new' && <i aria-label="Unread" />}</span>
                    <span className="st-mail-excerpt">{e.message.replace(/\s+/g, ' ')}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : <p className="st-empty-note">Nothing here.</p>}
      </div>

      {open ? (
        <article className="st-mail-read" aria-label={`Enquiry from ${open.name}`}>
          <div className="st-mail-toolbar">
            {open.status === 'new'
              ? <button type="button" className="st-btn st-btn-sm" onClick={() => status(open, 'replied')}><Icon name="check" size={14} /> Mark replied</button>
              : <button type="button" className="st-btn st-btn-sm" onClick={() => status(open, 'new')}><Icon name="undo" size={14} /> Mark unread</button>}
            {open.status !== 'archived'
              ? <button type="button" className="st-btn st-btn-sm" onClick={() => status(open, 'archived')}><Icon name="archive" size={14} /> Archive</button>
              : <button type="button" className="st-btn st-btn-sm" onClick={() => status(open, 'replied')}><Icon name="inbox" size={14} /> Move to inbox</button>}
            <span className="st-spacer" />
            <button type="button" className="st-icon-btn" onClick={() => remove(open)} aria-label="Delete enquiry" title="Delete"><Icon name="trash" size={16} /></button>
          </div>
          {error && <p className="st-error" role="alert">{error}</p>}
          <h3 className="st-mail-title">{open.service || 'General enquiry'}</h3>
          <div className="st-mail-from">
            <span className="st-mail-avatar is-lg" aria-hidden="true">{initials(open.name)}</span>
            <span><b>{open.name}</b> <a href={`mailto:${open.email}`}>{open.email}</a></span>
            <small>{when(open.createdAt)}</small>
          </div>
          {(open.budget || open.timeline) && (
            <dl className="st-mail-facts">
              {open.budget && <div><dt>Budget</dt><dd>{open.budget}</dd></div>}
              {open.timeline && <div><dt>Timeline</dt><dd>{open.timeline}</dd></div>}
            </dl>
          )}
          <p className="st-message">{open.message}</p>
          <div className="st-mail-reply">
            <p className="st-label">Reply with a template</p>
            <p className="st-help">Opens your email app with the reply written. Edit it there, send it, then mark this replied.</p>
            <div className="st-mail-templates">
              {templates(open, site).map((t) => (
                <a key={t.key} className="st-btn st-btn-sm" href={mailto(open.email, t.subject, t.body)}>{t.label}</a>
              ))}
              <a className="st-btn st-btn-sm st-btn-primary" href={mailto(open.email, `Re: your enquiry${open.service ? ` about ${open.service.toLowerCase()}` : ''}`, '')}><Icon name="mail" size={14} /> Write a reply</a>
            </div>
          </div>
        </article>
      ) : <div className="st-mail-read st-empty-note">Choose a message.</div>}
    </div>
  );
}
