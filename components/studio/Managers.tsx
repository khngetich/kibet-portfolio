'use client';

import { useCallback, useEffect, useState } from 'react';
import type { SField } from '@/lib/studio-schema';
import { deletePost, deleteProject, deleteService, getPost, getProject, getService, listPosts, listServices, savePost, saveProject, saveService } from './api';
import { Icon } from '@/components/ui/Icon';
import { thumbURL } from '@/lib/media';
import { price } from '@/lib/format';
import { useStudioData, type ProjectRef } from './Data';
import { FieldList } from './Fields';
import { Modal, useConfirm } from './Modal';
import { defaultsOf, type Rec } from './util';

const DISCIPLINE: Record<string, string> = { social: 'Social media', brand: 'Brand identity', web: 'Web design', print: 'Print', packaging: 'Packaging', illustration: 'Illustration', motion: 'Motion' };
type Column = { key: 'draft' | 'edits' | 'live'; label: string; hint: string };
const COLUMNS: Column[] = [
  { key: 'draft', label: 'Not live', hint: 'Drafts visitors can’t see yet' },
  { key: 'edits', label: 'Unpublished changes', hint: 'Live, with newer edits waiting' },
  { key: 'live', label: 'Live', hint: 'On the site, nothing waiting' },
];
const columnOf = (p: ProjectRef): Column['key'] => (!p.live ? 'draft' : p._status === 'draft' ? 'edits' : 'live');

/**
 * Projects: a grid of covers, or a board in publishing columns (Not live → Unpublished changes
 * → Live) whose cards show how complete each case study is. Either opens a pop-up editor with
 * every project field (including the case study).
 */
export function ProjectsManager({ fields, onChanged }: { fields: SField[]; onChanged: () => void }) {
  const { projects, refreshProjects, media, ensureMedia } = useStudioData();
  const confirm = useConfirm();
  const [editing, setEditing] = useState<{ id: number | null; value: Rec } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'board'>('board');

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
      setEditing(publish ? null : { id: r.id, value: { ...editing.value, updatedAt: r.updatedAt } });
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
      <div className="st-manager-bar">
        <span className="st-help">{projects.length} projects</span>
        <span className="st-spacer" />
        <div className="st-seg" role="group" aria-label="View">
          {(['board', 'grid'] as const).map((v) => <button key={v} type="button" className={view === v ? 'is-on' : undefined} aria-pressed={view === v} onClick={() => setView(v)}>{v === 'board' ? 'Board' : 'Grid'}</button>)}
        </div>
        <button type="button" className="st-btn st-btn-primary" onClick={() => open(null)}><Icon name="plus" size={14} /> New project</button>
      </div>
      {view === 'grid' ? (
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
      ) : (
        <div className="st-board">
          {COLUMNS.map((c) => {
            const list = projects.filter((p) => columnOf(p) === c.key);
            return (
              <section key={c.key} className="st-board-col" aria-label={c.label}>
                <header><b>{c.label}</b><span className="st-board-n">{list.length}</span><small>{c.hint}</small></header>
                {list.length ? (
                  <ul>
                    {list.map((p) => (
                      <li key={p.id}>
                        <button type="button" className="st-board-card" onClick={() => open(p.id)}>
                          <span className="st-board-cover">{p.cover && media[p.cover]?.url ? <img src={thumbURL(media[p.cover], 384)!} alt="" loading="lazy" /> : <Icon name="image" size={18} />}</span>
                          <span className="st-board-body">
                            <b>{p.title}</b>
                            <small>{p.client || 'No client yet'}{p.featured ? ' · Featured' : ''}</small>
                            {!!p.disciplines?.length && <span className="st-board-tags">{p.disciplines.map((d) => <i key={d}>{DISCIPLINE[d] ?? d}</i>)}</span>}
                            <span className="st-board-meter" role="img" aria-label={`Case study ${p.score ?? 0}% complete`}><i style={{ width: `${p.score ?? 0}%` }} className={(p.score ?? 0) >= 100 ? 'is-done' : undefined} /></span>
                            <span className="st-board-meta"><span>{p.score ?? 0}% story</span><span>{p.samples ? `${p.samples} sample${p.samples === 1 ? '' : 's'}` : 'No samples'}</span></span>
                            {!!p.missing?.length && <small className="st-board-missing">Missing {p.missing.join(', ')}</small>}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : <p className="st-board-empty">Nothing here</p>}
              </section>
            );
          })}
        </div>
      )}
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

type PostRef = { id: number; title: string; slug?: string | null; excerpt?: string | null; cover?: number | null; publishedAt?: string | null; tags?: string[] | null; _status?: string | null; updatedAt?: string };
const postDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No date');

/**
 * Insights: articles as cards (cover, date, title, excerpt, status), and the same pop-up
 * editor as projects: every field, Save draft / Publish / Delete.
 */
export function PostsManager({ fields, onChanged }: { fields: SField[]; onChanged: () => void }) {
  const { media, ensureMedia } = useStudioData();
  const confirm = useConfirm();
  const [posts, setPosts] = useState<PostRef[] | null>(null);
  const [editing, setEditing] = useState<{ id: number | null; value: Rec } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => setPosts((await listPosts()) as unknown as PostRef[]), []);
  useEffect(() => {
    let live = true;
    listPosts().then((r) => { if (live) setPosts(r as unknown as PostRef[]); }).catch(() => { if (live) setPosts([]); });
    return () => { live = false; };
  }, []);
  useEffect(() => { ensureMedia((posts ?? []).map((p) => p.cover).filter((c): c is number => typeof c === 'number')); }, [posts, ensureMedia]);

  const open = async (id: number | null) => {
    setErr(null);
    setEditing({ id, value: id ? ((await getPost(id)) as unknown as Rec) : { ...defaultsOf(fields), publishedAt: new Date().toISOString() } });
  };
  const save = async (publish: boolean) => {
    if (!editing) return;
    setBusy(true); setErr(null);
    try {
      const r = await savePost(editing.id, editing.value, publish);
      await load();
      onChanged();
      setEditing(publish ? null : { id: r.id, value: { ...editing.value, updatedAt: r.updatedAt } });
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };
  const remove = async () => {
    if (!editing?.id) return;
    if (!(await confirm({ title: 'Delete this insight?', body: 'Its page will stop working and it will disappear from the site.', confirmLabel: 'Delete insight', danger: true }))) return;
    await deletePost(editing.id);
    await load();
    onChanged();
    setEditing(null);
  };

  return (
    <div className="st-manager">
      <div className="st-manager-bar">
        <span className="st-help">{posts ? `${posts.length} ${posts.length === 1 ? 'insight' : 'insights'}` : 'Loading…'}</span>
        <span className="st-spacer" />
        <button type="button" className="st-btn st-btn-primary" onClick={() => open(null)}><Icon name="plus" size={14} /> New insight</button>
      </div>
      {posts && !posts.length && <p className="st-empty-note">No insights yet. Write a short design note: what you made, why, and what you learned.</p>}
      {!!posts?.length && (
        <ul className="st-cards">
          {posts.map((p) => (
            <li key={p.id}>
              <button type="button" className="st-card st-post-card" onClick={() => open(p.id)}>
                <span className="st-card-media">{p.cover && media[p.cover]?.url ? <img src={thumbURL(media[p.cover], 384)!} alt="" loading="lazy" /> : <span className="st-post-type">{p.title}</span>}</span>
                <small className="st-post-date">{postDate(p.publishedAt)}{p._status === 'draft' ? ' · Draft' : ''}</small>
                <b>{p.title}</b>
                {p.excerpt && <small className="st-post-excerpt">{p.excerpt}</small>}
              </button>
            </li>
          ))}
        </ul>
      )}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? (editing.value.title as string) || 'Insight' : 'New insight'}
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

type ServiceRef = { id: number; title: string; slug?: string | null; description?: string | null; image?: number | null; priceFrom?: number | null; currency?: string | null; unit?: string | null; featured?: boolean | null; starter?: boolean | null; _status?: string | null };

/**
 * Services: one card per service in site order, showing its cover. A service without one is
 * flagged, because the site then borrows a project cover for its card. Each card opens a
 * pop-up editor with every service field, the cover first.
 */
export function ServicesManager({ fields, onChanged }: { fields: SField[]; onChanged: () => void }) {
  const { media, ensureMedia } = useStudioData();
  const confirm = useConfirm();
  const [services, setServices] = useState<ServiceRef[] | null>(null);
  const [editing, setEditing] = useState<{ id: number | null; value: Rec } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => setServices((await listServices()) as unknown as ServiceRef[]), []);
  useEffect(() => {
    let live = true;
    listServices().then((r) => { if (live) setServices(r as unknown as ServiceRef[]); }).catch(() => { if (live) setServices([]); });
    return () => { live = false; };
  }, []);
  useEffect(() => { ensureMedia((services ?? []).map((x) => x.image).filter((c): c is number => typeof c === 'number')); }, [services, ensureMedia]);

  const open = async (id: number | null) => {
    setErr(null);
    setEditing({ id, value: id ? ((await getService(id)) as unknown as Rec) : defaultsOf(fields) });
  };
  const save = async (publish: boolean) => {
    if (!editing) return;
    setBusy(true); setErr(null);
    try {
      const r = await saveService(editing.id, editing.value, publish);
      await load();
      onChanged();
      setEditing(publish ? null : { id: r.id, value: { ...editing.value, updatedAt: r.updatedAt } });
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };
  const remove = async () => {
    if (!editing?.id) return;
    if (!(await confirm({ title: 'Delete this service?', body: 'Its page will stop working and its card will leave the Services section.', confirmLabel: 'Delete service', danger: true }))) return;
    await deleteService(editing.id);
    await load();
    onChanged();
    setEditing(null);
  };
  const missing = (services ?? []).filter((x) => !x.image).length;

  return (
    <div className="st-manager">
      <div className="st-manager-bar">
        <span className="st-help">{services ? `${services.length} ${services.length === 1 ? 'service' : 'services'}${missing ? ` · ${missing} without a cover` : ''}` : 'Loading…'}</span>
        <span className="st-spacer" />
        <button type="button" className="st-btn st-btn-primary" onClick={() => open(null)}><Icon name="plus" size={14} /> New service</button>
      </div>
      {missing > 0 && <p className="st-note">Services without a cover borrow a project cover on their card, and their page shows no picture. Open one and add a cover from your own work for it.</p>}
      {services && !services.length && <p className="st-empty-note">No services yet. Add what you offer: each one gets a card in the Services section and its own page.</p>}
      {!!services?.length && (
        <ul className="st-cards">
          {services.map((x) => {
            const cover = x.image ? media[x.image] : null;
            return (
              <li key={x.id}>
                <button type="button" className="st-card st-svc-card" onClick={() => open(x.id)}>
                  <span className="st-card-media">
                    {cover?.url ? <img src={thumbURL(cover, 384)!} alt="" loading="lazy" /> : <span className="st-svc-empty"><Icon name="image" size={18} />Add a cover</span>}
                    {x.featured && <i className="st-svc-flag">Featured</i>}
                  </span>
                  <b>{x.title}</b>
                  <small>{x.priceFrom != null ? `From ${price(x.priceFrom, x.currency)}${x.unit ? ` ${x.unit}` : ''}` : 'No price shown'}{x._status === 'draft' ? ' · Draft' : ''}</small>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? (editing.value.title as string) || 'Service' : 'New service'}
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
