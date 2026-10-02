'use client';

import { useEffect, useState } from 'react';
import type { SField } from '@/lib/studio-schema';
import { deleteProject, getProject, saveProject } from './api';
import { Icon } from '@/components/ui/Icon';
import { thumbURL } from '@/lib/media';
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
