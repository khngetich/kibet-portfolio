'use client';

import { useCallback, useEffect, useState } from 'react';
import type { SField } from '@/lib/studio-schema';
import { deleteEnquiry, deleteProject, getProject, listEnquiries, saveProject, setEnquiryStatus } from './api';
import { Icon } from '@/components/ui/Icon';
import { thumbURL } from '@/lib/media';
import { useStudioData } from './Data';
import { FieldList } from './Fields';
import { Modal, useConfirm } from './Modal';
import { defaultsOf, timeAgo, type Rec } from './util';

/** Projects: card list, and a pop-up editor with every project field (including the case study). */
export function ProjectsManager({ fields, onChanged }: { fields: SField[]; onChanged: () => void }) {
  const { projects, refreshProjects, media, ensureMedia } = useStudioData();
  const confirm = useConfirm();
  const [editing, setEditing] = useState<{ id: number | null; value: Rec } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { ensureMedia(projects.map((p) => p.cover).filter((c): c is number => typeof c === 'number')); }, [projects, ensureMedia]);

  const open = async (id: number | null) => {
    setErr(null);
    setEditing({ id, value: id ? ((await getProject(id)) as unknown as Rec) : defaultsOf(fields) });
  };
  const save = async (publish: boolean) => {
    if (!editing) return;
    setBusy(true); setErr(null);
    try {
      const r = await saveProject(editing.id, editing.value, publish);
      await refreshProjects();
      onChanged();
      setEditing(publish ? null : { id: r.id, value: editing.value });
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };
  const remove = async () => {
    if (!editing?.id) return;
    if (!(await confirm({ title: 'Delete this project?', body: 'Its case study page will stop working and it will disappear from the site.', confirmLabel: 'Delete project', danger: true }))) return;
    await deleteProject(editing.id);
    await refreshProjects();
    onChanged();
    setEditing(null);
  };

  return (
    <div className="st-manager">
      <div className="st-manager-bar"><span className="st-help">{projects.length} projects</span><button type="button" className="st-btn st-btn-primary" onClick={() => open(null)}><Icon name="plus" size={14} /> New project</button></div>
      <ul className="st-cards">
        {projects.map((p) => (
          <li key={p.id}>
            <button type="button" className="st-card" onClick={() => open(p.id)}>
              <span className="st-card-media">{p.cover && media[p.cover]?.url ? <img src={thumbURL(media[p.cover], 384)!} alt="" loading="lazy" /> : null}</span>
              <b>{p.title}</b>
              <small>{p.client} · {p._status === 'draft' ? 'Draft' : 'Published'}{p.featured ? ' · Featured' : ''}</small>
            </button>
          </li>
        ))}
      </ul>
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? (editing.value.title as string) || 'Project' : 'New project'}
        size="lg"
        className="st-modal-editor"
        footer={
          <>
            {editing?.id && <button type="button" className="st-btn st-btn-danger-ghost" onClick={remove}>Delete</button>}
            <span className="st-spacer" />
            {err && <span className="st-error">{err}</span>}
            <button type="button" className="st-btn" disabled={busy} onClick={() => save(false)}>Save draft</button>
            <button type="button" className="st-btn st-btn-primary" disabled={busy} onClick={() => save(true)}>{busy ? 'Saving…' : 'Publish'}</button>
          </>
        }
      >
        {editing && <FieldList fields={fields} value={editing.value} onChange={(v) => setEditing({ ...editing, value: v })} />}
      </Modal>
    </div>
  );
}

type Enquiry = { id: number; name: string; email: string; service?: string | null; budget?: string | null; message: string; status: 'new' | 'replied' | 'archived'; createdAt: string };

/** Enquiries: inbox list; each opens in a pop-up with its status and a delete option. */
export function EnquiriesManager() {
  const confirm = useConfirm();
  const [rows, setRows] = useState<Enquiry[] | null>(null);
  const [open, setOpen] = useState<Enquiry | null>(null);
  const load = useCallback(async () => setRows((await listEnquiries()) as unknown as Enquiry[]), []);
  useEffect(() => {
    let live = true;
    listEnquiries().then((r) => { if (live) setRows(r as unknown as Enquiry[]); }).catch(() => { if (live) setRows([]); });
    return () => { live = false; };
  }, []);

  const status = async (e: Enquiry, s: Enquiry['status']) => { await setEnquiryStatus(e.id, s); setOpen({ ...e, status: s }); load(); };
  const remove = async (e: Enquiry) => {
    if (!(await confirm({ title: 'Delete this enquiry?', body: `The message from ${e.name} will be removed permanently.`, confirmLabel: 'Delete', danger: true }))) return;
    await deleteEnquiry(e.id); setOpen(null); load();
  };

  if (!rows) return <p className="st-help">Loading…</p>;
  if (!rows.length) return <p className="st-empty-note">No messages yet. They arrive here from the contact form.</p>;
  return (
    <>
      <ul className="st-inbox">
        {rows.map((e) => (
          <li key={e.id}>
            <button type="button" onClick={() => setOpen(e)}>
              <span className="st-avatar">{e.name.slice(0, 1).toUpperCase()}</span>
              <span className="st-inbox-text"><b>{e.name}</b><small>{e.service || 'General enquiry'} · {timeAgo(e.createdAt)}</small></span>
              <em className={`st-badge is-${e.status}`}>{e.status}</em>
            </button>
          </li>
        ))}
      </ul>
      <Modal open={!!open} onClose={() => setOpen(null)} title={open ? `From ${open.name}` : ''} description={open ? `${open.email}${open.budget ? ` · Budget: ${open.budget}` : ''}` : ''} size="md"
        footer={open && <><button type="button" className="st-btn st-btn-danger-ghost" onClick={() => remove(open)}>Delete</button><span className="st-spacer" /><a className="st-btn st-btn-primary" href={`mailto:${open.email}?subject=${encodeURIComponent('Re: your enquiry')}`}>Reply by email</a></>}>
        {open && (
          <div className="st-fields">
            <p className="st-message">{open.message}</p>
            <div className="st-field"><span className="st-label" id="st-enquiry-status">Status</span>
              <div className="st-seg" role="group" aria-labelledby="st-enquiry-status">{(['new', 'replied', 'archived'] as const).map((s) => <button key={s} type="button" aria-pressed={open.status === s} className={open.status === s ? 'is-on' : undefined} onClick={() => status(open, s)}>{s[0].toUpperCase() + s.slice(1)}</button>)}</div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
