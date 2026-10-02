'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { deleteMedia, listMedia, listProjects, updateMedia } from './api';
import { uploadFile, type UploadMode } from './upload';
import { thumbURL } from '@/lib/media';
import { Modal, useConfirm } from './Modal';

/**
 * Shared editor data: a cache of media documents (so thumbnails resolve from ids), the
 * project list for relationship pickers, and a promise-based media picker that opens the
 * library modal from anywhere in the editor.
 */

export type MediaDoc = { id: number; url?: string | null; alt: string; filename?: string | null; mimeType?: string | null; width?: number | null; height?: number | null; filesize?: number | null };
export type ProjectRef = { id: number; title: string; slug?: string | null; client?: string | null; cover?: number | null; featured?: boolean | null; _status?: string | null; updatedAt?: string; disciplines?: string[] | null; live?: boolean; samples?: number; score?: number; missing?: string[] };
type PickOpts = { multiple?: boolean; accept?: 'image' | 'any' };

type Ctx = {
  media: Record<number, MediaDoc>;
  ensureMedia: (ids: number[]) => void;
  remember: (docs: MediaDoc[]) => void;
  pickMedia: (o?: PickOpts) => Promise<MediaDoc[] | null>;
  projects: ProjectRef[];
  refreshProjects: () => Promise<void>;
  upload: (file: File) => Promise<MediaDoc>;
};
const DataContext = createContext<Ctx | null>(null);
export const useStudioData = () => {
  const c = useContext(DataContext);
  if (!c) throw new Error('Studio data used outside its provider');
  return c;
};

export function StudioDataProvider({ children, upload: mode }: { children: ReactNode; upload: UploadMode }) {
  const [media, setMedia] = useState<Record<number, MediaDoc>>({});
  const [projects, setProjects] = useState<ProjectRef[]>([]);
  const pending = useRef(new Set<number>());
  const [picker, setPicker] = useState<(PickOpts & { resolve: (v: MediaDoc[] | null) => void }) | null>(null);

  const remember = useCallback((docs: MediaDoc[]) => setMedia((m) => ({ ...m, ...Object.fromEntries(docs.map((d) => [d.id, d])) })), []);
  const ensureMedia = useCallback((ids: number[]) => {
    const missing = ids.filter((id) => typeof id === 'number' && !pending.current.has(id));
    if (!missing.length) return;
    missing.forEach((id) => pending.current.add(id));
    listMedia({ ids: missing }).then((r) => remember(r.docs as MediaDoc[])).catch(() => missing.forEach((id) => pending.current.delete(id)));
  }, [remember]);
  const refreshProjects = useCallback(async () => setProjects((await listProjects()) as unknown as ProjectRef[]), []);
  useEffect(() => {
    let live = true;
    listProjects().then((r) => { if (live) setProjects(r as unknown as ProjectRef[]); }).catch(() => {});
    return () => { live = false; };
  }, []);

  const upload = useCallback((file: File) => uploadFile(file, mode), [mode]);
  const pickMedia = useCallback((o: PickOpts = {}) => new Promise<MediaDoc[] | null>((resolve) => setPicker({ ...o, resolve })), []);

  return (
    <DataContext.Provider value={{ media, ensureMedia, remember, pickMedia, projects, refreshProjects, upload }}>
      {children}
      <Modal
        open={!!picker}
        onClose={() => { picker?.resolve(null); setPicker(null); }}
        title={picker?.multiple ? 'Choose images' : 'Choose an image'}
        description="Pick from the library, or drop files anywhere in this window to upload."
        size="xl"
      >
        {picker && (
          <MediaLibrary
            selectable={picker.multiple ? 'multiple' : 'single'}
            onChoose={(docs) => { picker.resolve(docs); setPicker(null); }}
          />
        )}
      </Modal>
    </DataContext.Provider>
  );
}

const size = (b?: number | null) => (!b ? '' : b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);

/** The media grid: search, drag-and-drop upload, choose, edit descriptions, delete. */
export function MediaLibrary({ selectable, onChoose }: { selectable?: 'single' | 'multiple'; onChoose?: (docs: MediaDoc[]) => void }) {
  const { remember, upload: send } = useStudioData();
  const confirm = useConfirm();
  const [docs, setDocs] = useState<MediaDoc[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(false);
  const [chosen, setChosen] = useState<number[]>([]);
  const [uploads, setUploads] = useState<{ name: string; state: 'uploading' | 'done' | 'error'; error?: string }[]>([]);
  const [dragging, setDragging] = useState(false);
  const [editing, setEditing] = useState<MediaDoc | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const load = useCallback(async (p = 1, q = search) => {
    const r = await listMedia({ page: p, search: q || undefined });
    const list = r.docs as MediaDoc[];
    remember(list);
    setDocs((d) => (p === 1 ? list : [...d, ...list]));
    setMore(r.hasNextPage);
    setPage(p);
  }, [remember, search]);
  useEffect(() => { const t = setTimeout(() => load(1, search).catch(() => {}), 200); return () => clearTimeout(t); }, [search, load]);

  const upload = async (files: FileList | File[]) => {
    const list = Array.from(files);
    setUploads((u) => [...list.map((f) => ({ name: f.name, state: 'uploading' as const })), ...u]);
    for (const f of list) {
      try {
        const doc = await send(f);
        remember([doc]);
        setDocs((d) => [doc, ...d]);
        if (selectable === 'single') setChosen([doc.id]);
        else if (selectable === 'multiple') setChosen((c) => [...c, doc.id]);
        setUploads((u) => u.map((x) => (x.name === f.name && x.state === 'uploading' ? { ...x, state: 'done' } : x)));
      } catch (e) {
        setUploads((u) => u.map((x) => (x.name === f.name && x.state === 'uploading' ? { ...x, state: 'error', error: (e as Error).message } : x)));
      }
    }
  };

  const toggle = (id: number) => setChosen((c) => (selectable === 'single' ? [id] : c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  return (
    <div
      className={`st-media${dragging ? ' is-dragging' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => { if (e.currentTarget === e.target) setDragging(false); }}
      onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) upload(e.dataTransfer.files); }}
    >
      <div className="st-media-bar">
        <input className="st-input" type="search" aria-label="Search media" placeholder="Search by description or file name" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button type="button" className="st-btn st-btn-primary" onClick={() => input.current?.click()}>Upload files</button>
        <input ref={input} aria-label="Upload files" type="file" multiple accept="image/*,video/mp4,video/webm,application/pdf" hidden onChange={(e) => { if (e.target.files?.length) upload(e.target.files); e.target.value = ''; }} />
      </div>
      <p className="st-sr" role="status">{uploads.length ? (uploads.some((u) => u.state === 'uploading') ? `Uploading ${uploads.filter((u) => u.state === 'uploading').length} file(s)` : uploads[0].state === 'error' ? `Upload failed: ${uploads[0].name}` : `Uploaded ${uploads[0].name}`) : ''}</p>
      {uploads.length > 0 && (
        <ul className="st-uploads">
          {uploads.slice(0, 4).map((u, i) => <li key={i} className={`is-${u.state}`}>{u.state === 'uploading' ? 'Uploading' : u.state === 'done' ? 'Uploaded' : 'Failed'} · {u.name}{u.error ? ` — ${u.error}` : ''}</li>)}
        </ul>
      )}
      <div className="st-drop-hint" aria-hidden={!dragging}>Drop to upload</div>
      {docs.length === 0 ? (
        <button type="button" className="st-dropzone" onClick={() => input.current?.click()}>
          <b>Drop images, videos or PDFs here</b>
          <span>or click to choose files</span>
        </button>
      ) : (
        <ul className="st-media-grid">
          {docs.map((m) => {
            const on = chosen.includes(m.id);
            return (
              <li key={m.id}>
                <button type="button" className={`st-media-item${on ? ' is-on' : ''}`} onClick={() => (selectable ? toggle(m.id) : setEditing(m))} aria-pressed={selectable ? on : undefined}>
                  <span className="st-media-thumb">
                    {m.mimeType?.startsWith('image/') && m.url ? <img src={thumbURL(m, 384)!} alt="" loading="lazy" /> : <span className="st-media-type">{m.mimeType?.split('/')[1] ?? 'file'}</span>}
                  </span>
                  <span className="st-media-meta"><b>{m.alt || m.filename}</b><small>{m.width && m.height ? `${m.width}×${m.height} · ` : ''}{size(m.filesize)}</small></span>
                </button>
                {selectable && <button type="button" className="st-media-edit" onClick={() => setEditing(m)} aria-label={`Edit ${m.alt}`}>Edit</button>}
              </li>
            );
          })}
        </ul>
      )}
      {more && <div className="st-center"><button type="button" className="st-btn" onClick={() => load(page + 1)}>Load more</button></div>}
      {selectable && (
        <div className="st-media-choose">
          <span>{chosen.length ? `${chosen.length} selected` : 'Nothing selected'}</span>
          <button type="button" className="st-btn st-btn-primary" disabled={!chosen.length} onClick={() => onChoose?.(chosen.map((id) => docs.find((d) => d.id === id)!).filter(Boolean))}>
            {selectable === 'multiple' ? 'Add selected' : 'Use this image'}
          </button>
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Image details" size="md">
        {editing && (
          <MediaDetails
            doc={editing}
            onSave={async (alt) => { await updateMedia(editing.id, { alt }); const next = { ...editing, alt }; remember([next]); setDocs((d) => d.map((x) => (x.id === editing.id ? next : x))); setEditing(null); }}
            onDelete={async () => {
              if (!(await confirm({ title: 'Delete this file?', body: 'It will be removed from the library, and anywhere it appears on the site will show nothing in its place. Files used as a project cover or sample can’t be deleted until they’re replaced there.', confirmLabel: 'Delete file', danger: true }))) return;
              await deleteMedia(editing.id);
              setDocs((d) => d.filter((x) => x.id !== editing.id));
              setEditing(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function MediaDetails({ doc, onSave, onDelete }: { doc: MediaDoc; onSave: (alt: string) => Promise<void>; onDelete: () => Promise<void> }) {
  const [alt, setAlt] = useState(doc.alt);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const attempt = async (fn: () => Promise<void>) => { setBusy(true); setErr(null); try { await fn(); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); } };
  return (
    <div className="st-media-details">
      <div className="st-media-preview">{doc.mimeType?.startsWith('image/') && doc.url ? <img src={doc.url} alt="" /> : <span className="st-media-type">{doc.filename}</span>}</div>
      <label className="st-field">
        <span className="st-label">Description <em>for screen readers and search engines</em></span>
        <textarea className="st-input" rows={3} value={alt} onChange={(e) => setAlt(e.target.value)} />
      </label>
      <p className="st-help">{doc.filename} · {doc.width && doc.height ? `${doc.width}×${doc.height} · ` : ''}{size(doc.filesize)}</p>
      {err && <p className="st-error" role="alert">{err}</p>}
      <div className="st-row-end">
        <button type="button" className="st-btn st-btn-danger-ghost" disabled={busy} onClick={() => attempt(onDelete)}>Delete file</button>
        <button type="button" className="st-btn st-btn-primary" disabled={busy || !alt.trim()} onClick={() => attempt(() => onSave(alt.trim()))}>Save</button>
      </div>
    </div>
  );
}
