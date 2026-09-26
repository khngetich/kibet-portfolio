'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SBlock, SField } from '@/lib/studio-schema';
import { themeVars } from '@/components/ThemeStyle';
import { SectionIcon } from '@/components/admin/SectionIcon';
import { Icon } from '@/components/ui/Icon';
import { IconSwap } from '@/components/ui/IconSwap';
import {
  createPage, deletePage, duplicatePage, getGlobal, getPage, listPages, listPageVersions, publishPage, restorePageVersion, saveGlobal, savePageDraft,
} from './api';
import { ConfirmProvider, Modal, useConfirm } from './Modal';
import { MediaLibrary, StudioDataProvider } from './Data';
import { FieldList } from './Fields';
import { ProjectsManager, EnquiriesManager } from './Managers';
import { TabList, TabPanel } from './TabList';
import { defaultsOf, newId, pagePath, slugify, timeAgo, type Rec } from './util';

/**
 * The Studio: a Webflow-style, managed editor for this site.
 *   left   — navigator (this page's sections), pages, site settings, library
 *   centre — the real site in draft mode; click a section to select it
 *   right  — inspector: the selected section's Content and Style, or page settings
 * Edits autosave as a draft (the canvas refreshes as you type); Publish puts them live.
 */

type Schema = { sections: SBlock[]; globals: { slug: string; label: string; description?: string; fields: SField[] }[]; project: SField[] };
type PageRef = { id: number; title: string; slug?: string | null; _status?: string | null; updatedAt?: string };
type GlobalSlug = 'header' | 'footer' | 'theme' | 'site';
type Panel = { kind: 'section'; index: number } | { kind: 'page' } | { kind: 'global'; slug: GlobalSlug };
type Device = 'desktop' | 'tablet' | 'mobile';
const DEVICES: Record<Device, number | null> = { desktop: null, tablet: 834, mobile: 390 };
type SaveState = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

export function Studio(props: { schema: Schema; initialPages: PageRef[]; siteName: string; user: { name: string; email: string }; adminRoute: string }) {
  return (
    <ConfirmProvider>
      <StudioDataProvider>
        <StudioApp {...props} />
      </StudioDataProvider>
    </ConfirmProvider>
  );
}

function StudioApp({ schema, initialPages, siteName, user, adminRoute }: Parameters<typeof Studio>[0]) {
  const confirm = useConfirm();
  const [pages, setPages] = useState<PageRef[]>(initialPages);
  const [pageId, setPageId] = useState<number | null>(() => initialPages.find((p) => p.slug === 'home')?.id ?? initialPages[0]?.id ?? null);
  const [doc, setDoc] = useState<Rec | null>(null);
  const [past, setPast] = useState<Rec[]>([]);
  const [future, setFuture] = useState<Rec[]>([]);
  const [panel, setPanel] = useState<Panel>({ kind: 'page' });
  const [tab, setTab] = useState<'content' | 'style'>('content');
  const [left, setLeft] = useState<'navigator' | 'pages' | 'site'>('navigator');
  const [device, setDevice] = useState<Device>('desktop');
  const [save, setSave] = useState<SaveState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [modal, setModal] = useState<null | 'addSection' | 'newPage' | 'versions' | 'media' | 'projects' | 'enquiries'>(null);
  const [insertAt, setInsertAt] = useState(0);
  const [canvasKey, setCanvasKey] = useState(0);
  const frame = useRef<HTMLIFrameElement>(null);
  const saveTimer = useRef<number | null>(null);
  const latest = useRef<Rec | null>(null);

  const blocks = useMemo(() => Object.fromEntries(schema.sections.map((b) => [b.slug, b])), [schema.sections]) as Record<string, SBlock>;
  const page = pages.find((p) => p.id === pageId) ?? null;
  const sections = ((doc?.sections as Rec[]) ?? []);
  const selected = panel.kind === 'section' ? panel.index : null;

  const post = useCallback((msg: object) => frame.current?.contentWindow?.postMessage({ source: 'studio', ...msg }, location.origin), []);

  /* ── load a page ── */
  // Switching page resets the editor state (adjusted during render), then the effect fetches it.
  const [loadedFor, setLoadedFor] = useState<number | null | undefined>(undefined);
  if (loadedFor !== pageId) {
    setLoadedFor(pageId);
    setDoc(null); setPast([]); setFuture([]); setPanel({ kind: 'page' }); setSave('idle');
  }
  useEffect(() => {
    if (pageId == null) return;
    let live = true;
    getPage(pageId).then((d) => { if (live) { setDoc(d as unknown as Rec); latest.current = d as unknown as Rec; } }).catch((e) => setError((e as Error).message));
    return () => { live = false; };
  }, [pageId]);

  /* ── autosave drafts ── */
  const flush = useCallback(async () => {
    if (saveTimer.current) { window.clearTimeout(saveTimer.current); saveTimer.current = null; }
    const d = latest.current;
    if (!d || pageId == null) return;
    setSave('saving');
    try {
      await savePageDraft(pageId, { title: d.title, slug: d.slug, sections: d.sections, meta: d.meta });
      setSave('saved');
      setPages((ps) => ps.map((p) => (p.id === pageId ? { ...p, title: d.title as string, slug: d.slug as string, _status: 'draft', updatedAt: new Date().toISOString() } : p)));
      post({ type: 'refresh' });
    } catch (e) {
      setSave('error');
      setError((e as Error).message);
    }
  }, [pageId, post]);

  const change = useCallback((next: Rec, opts: { history?: boolean } = {}) => {
    const prev = latest.current;
    if (prev && opts.history !== false) { setPast((p) => [...p.slice(-49), prev]); setFuture([]); }
    setDoc(next);
    latest.current = next;
    setSave('pending');
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(flush, 700);
  }, [flush]);

  const undo = useCallback(() => {
    const cur = latest.current;
    if (!past.length || !cur) return;
    setPast(past.slice(0, -1));
    setFuture([cur, ...future]);
    change(past[past.length - 1], { history: false });
  }, [past, future, change]);
  const redo = useCallback(() => {
    const cur = latest.current;
    if (!future.length || !cur) return;
    setFuture(future.slice(1));
    setPast([...past, cur]);
    change(future[0], { history: false });
  }, [past, future, change]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const typing = (e.target as HTMLElement)?.closest('input, textarea, select, [contenteditable]');
      if (mod && e.key.toLowerCase() === 'z' && !typing) { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
      if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); flush(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo, flush]);

  // Warn before leaving with an unsaved draft.
  useEffect(() => {
    const onBefore = (e: BeforeUnloadEvent) => { if (save === 'pending' || save === 'saving') e.preventDefault(); };
    window.addEventListener('beforeunload', onBefore);
    return () => window.removeEventListener('beforeunload', onBefore);
  }, [save]);

  /* ── canvas messages ── */
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.data?.source !== 'studio-canvas') return;
      if (e.data.type === 'select' && typeof e.data.index === 'number') { setPanel({ kind: 'section', index: e.data.index }); setLeft('navigator'); }
      if (e.data.type === 'ready' && selected != null) post({ type: 'select', index: selected });
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [post, selected]);
  useEffect(() => { post({ type: 'select', index: selected, scroll: true }); }, [selected, post]);

  /* ── section operations ── */
  const setSections = (next: Rec[]) => { if (latest.current) change({ ...latest.current, sections: next }); };
  const addSection = (slug: string) => {
    const b = blocks[slug];
    if (!b || !doc) return;
    const row = { blockType: slug, ...defaultsOf(b.fields), id: newId() };
    const next = [...sections];
    next.splice(insertAt, 0, row);
    setSections(next);
    setPanel({ kind: 'section', index: insertAt });
    setTab('content');
    setModal(null);
  };
  const moveSection = (from: number, to: number) => {
    if (to < 0 || to >= sections.length || from === to) return;
    const next = [...sections];
    const [row] = next.splice(from, 1);
    next.splice(to, 0, row);
    setSections(next);
    if (selected === from) setPanel({ kind: 'section', index: to });
  };
  const duplicateSection = (i: number) => {
    const copy = { ...structuredClone(sections[i]), id: newId() };
    const strip = (v: unknown): unknown => (Array.isArray(v) ? v.map((x) => (x && typeof x === 'object' ? { ...(strip(x) as unknown as Rec), id: newId() } : x)) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, strip(x)])) : v);
    const fresh = strip(copy) as unknown as Rec;
    const next = [...sections];
    next.splice(i + 1, 0, { ...fresh, id: newId() });
    setSections(next);
    setPanel({ kind: 'section', index: i + 1 });
  };
  const removeSection = async (i: number) => {
    const b = blocks[sections[i]?.blockType as string];
    if (!(await confirm({ title: 'Delete this section?', body: <>The <b>{b?.label ?? 'section'}</b> section and everything in it will be removed. You can undo, or restore an earlier version.</>, confirmLabel: 'Delete section', danger: true }))) return;
    setSections(sections.filter((_, j) => j !== i));
    setPanel({ kind: 'page' });
  };
  const toggleHidden = (i: number) => setSections(sections.map((s, j) => (j === i ? { ...s, hidden: !s.hidden } : s)));

  /* ── page operations ── */
  const publish = async () => {
    if (pageId == null || !latest.current) return;
    if (saveTimer.current) { window.clearTimeout(saveTimer.current); saveTimer.current = null; }
    setSave('saving');
    try {
      const d = latest.current;
      await publishPage(pageId, { title: d.title, slug: d.slug, sections: d.sections, meta: d.meta });
      setSave('saved');
      setPages((ps) => ps.map((p) => (p.id === pageId ? { ...p, _status: 'published', updatedAt: new Date().toISOString() } : p)));
      setStatus('Published — your changes are live.');
      post({ type: 'refresh' });
    } catch (e) { setSave('error'); setError((e as Error).message); }
  };
  const refreshPages = async () => setPages((await listPages()) as PageRef[]);
  const openPage = async (id: number) => { if (save === 'pending') await flush(); setPageId(id); setLeft('navigator'); setCanvasKey((k) => k + 1); };

  const previewPath = page ? pagePath((doc?.slug as string) ?? page.slug) : '/';
  const canvasURL = `/preview?path=${encodeURIComponent(previewPath)}&studio=1`;
  const lastPath = useRef(previewPath);
  useEffect(() => { if (lastPath.current !== previewPath && save !== 'pending') { lastPath.current = previewPath; setCanvasKey((k) => k + 1); } }, [previewPath, save]);

  const saveLabel = { idle: page?._status === 'draft' ? 'Unpublished changes' : 'Published', pending: 'Editing…', saving: 'Saving draft…', saved: 'Draft saved — not live yet', error: 'Couldn’t save' }[save];

  return (
    <div className="st-app">
      {/* ── top bar ── */}
      <header className="st-top">
        <h1 className="st-sr">Studio: editing {page?.title ?? 'the site'}</h1>
        <div className="st-top-left">
          <a className="st-brand" href={adminRoute} title="Back to the CMS dashboard">{siteName.split(' ')[0]}<i>.</i> <span>Studio</span></a>
          <select className="st-input st-page-select" value={pageId ?? ''} onChange={(e) => openPage(Number(e.target.value))} aria-label="Page">
            {pages.map((p) => <option key={p.id} value={p.id}>{p.title}{p._status === 'draft' ? ' •' : ''}</option>)}
          </select>
          <button type="button" className="st-btn st-btn-sm" onClick={() => setModal('newPage')}><Icon name="plus" size={14} /> Page</button>
        </div>
        <div className="st-devices" role="group" aria-label="Canvas width">
          {(Object.keys(DEVICES) as Device[]).map((d) => (
            <button key={d} type="button" className={device === d ? 'is-on' : undefined} aria-pressed={device === d} onClick={() => setDevice(d)} title={d[0].toUpperCase() + d.slice(1)}>
              <DeviceIcon d={d} />
            </button>
          ))}
        </div>
        <div className="st-top-right">
          {/* shown as text (a dot on narrow screens); only settled states are announced */}
          <span className={`st-save is-${save}`} title={saveLabel} aria-hidden="true"><span className="st-save-text">{saveLabel}</span></span>
          <span className="st-sr" role="status">{save === 'saved' || save === 'error' ? saveLabel : ''}</span>
          <button type="button" className="st-icon-btn" onClick={undo} disabled={!past.length} aria-label="Undo" title="Undo (⌘Z)"><Icon name="undo" size={18} /></button>
          <button type="button" className="st-icon-btn" onClick={redo} disabled={!future.length} aria-label="Redo" title="Redo (⇧⌘Z)"><Icon name="redo" size={18} /></button>
          <button type="button" className="st-btn st-btn-sm" onClick={() => setModal('versions')} disabled={pageId == null}>History</button>
          <a className="st-btn st-btn-sm" href={previewPath} target="_blank" rel="noopener noreferrer">View live <Icon name="external" size={14} /></a>
          {/* phones: the controls above fold into this menu */}
          <details className="st-more">
            <summary className="st-icon-btn" aria-label="More actions"><Icon name="more" size={18} /></summary>
            <div className="st-more-menu" onClick={(e) => { if ((e.target as HTMLElement).closest('button, a')) (e.currentTarget.parentElement as HTMLDetailsElement).open = false; }}>
              <button type="button" onClick={undo} disabled={!past.length}><Icon name="undo" size={16} /> Undo</button>
              <button type="button" onClick={redo} disabled={!future.length}><Icon name="redo" size={16} /> Redo</button>
              <button type="button" onClick={() => setModal('versions')} disabled={pageId == null}>History</button>
              <a href={previewPath} target="_blank" rel="noopener noreferrer">View live <Icon name="external" size={14} /></a>
            </div>
          </details>
          <button type="button" className="st-btn st-btn-primary" onClick={publish} disabled={pageId == null || save === 'saving'}>Publish</button>
          <span className="st-avatar" title={user.email}>{(user.name || user.email).slice(0, 1).toUpperCase()}</span>
        </div>
      </header>

      {/* ── left: navigator / pages / site ── */}
      <aside className="st-left" aria-label="Structure">
        <TabList base="st-left" label="Structure" className="st-left-tabs" active={left} onChange={setLeft}
          tabs={[{ value: 'navigator', label: 'Sections' }, { value: 'pages', label: 'Pages' }, { value: 'site', label: 'Site' }]} />
        <TabPanel base="st-left" active={left} className="st-left-panel">

        {left === 'navigator' && (
          <div className="st-nav">
            <button type="button" className={`st-nav-page${panel.kind === 'page' ? ' is-on' : ''}`} onClick={() => setPanel({ kind: 'page' })}>
              <b>{(doc?.title as string) ?? page?.title ?? '…'}</b><small>{previewPath} · Page settings &amp; SEO</small>
            </button>
            {!doc ? <p className="st-help st-pad">Loading…</p> : (
              <ol className="st-sections">
                {sections.map((s, i) => {
                  const b = blocks[s.blockType as string];
                  const summary = b?.summary ? (s[b.summary] as string) : (s.heading as string);
                  return (
                    <li
                      key={(s.id as string) ?? i}
                      className={`st-sec${selected === i ? ' is-on' : ''}${s.hidden ? ' is-hidden' : ''}`}
                      draggable
                      onDragStart={(e) => { e.dataTransfer.setData('text/plain', String(i)); e.dataTransfer.effectAllowed = 'move'; }}
                      onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('is-drop'); }}
                      onDragLeave={(e) => e.currentTarget.classList.remove('is-drop')}
                      onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('is-drop'); moveSection(Number(e.dataTransfer.getData('text/plain')), i); }}
                    >
                      <button type="button" className="st-insert-btn" onClick={() => { setInsertAt(i); setModal('addSection'); }} aria-label="Insert a section here"><Icon name="plus" size={12} weight="semibold" /></button>
                      <button type="button" className="st-sec-main" aria-current={selected === i ? 'true' : undefined} onClick={() => { setPanel({ kind: 'section', index: i }); }}>
                        <span className="st-sec-icon" aria-hidden="true"><SectionIcon type={s.blockType as string} size={16} /></span>
                        <span className="st-sec-text"><b>{b?.label ?? String(s.blockType)}</b>{summary && <small>{summary}</small>}</span>
                        {Boolean(s.hidden) && <em className="st-badge">Hidden</em>}
                      </button>
                      <span className="st-sec-actions">
                        <button type="button" onClick={() => toggleHidden(i)} aria-label={s.hidden ? 'Show section' : 'Hide section'} title={s.hidden ? 'Show' : 'Hide'} aria-pressed={Boolean(s.hidden)}><IconSwap a="eye" b="eyeOff" show={s.hidden ? 'b' : 'a'} size={15} /></button>
                        <button type="button" onClick={() => moveSection(i, i - 1)} disabled={i === 0} aria-label="Move up" title="Move up"><Icon name="up" size={15} /></button>
                        <button type="button" onClick={() => moveSection(i, i + 1)} disabled={i === sections.length - 1} aria-label="Move down" title="Move down"><Icon name="down" size={15} /></button>
                        <button type="button" onClick={() => duplicateSection(i)} aria-label="Duplicate" title="Duplicate"><Icon name="copy" size={15} /></button>
                        <button type="button" className="is-danger" onClick={() => removeSection(i)} aria-label="Delete" title="Delete"><Icon name="trash" size={15} /></button>
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
            <button type="button" className="st-add" onClick={() => { setInsertAt(sections.length); setModal('addSection'); }} disabled={!doc}><Icon name="plus" size={14} /> Add section</button>
          </div>
        )}

        {left === 'pages' && (
          <PagesList
            pages={pages}
            current={pageId}
            onOpen={openPage}
            onNew={() => setModal('newPage')}
            onDuplicate={async (id) => { const p = await duplicatePage(id); await refreshPages(); openPage(p.id); }}
            onDelete={async (p) => {
              if (p.slug === 'home') { setError('The homepage can’t be deleted.'); return; }
              if (!(await confirm({ title: `Delete “${p.title}”?`, body: 'The page and its history will be removed, and its address will stop working.', confirmLabel: 'Delete page', danger: true }))) return;
              await deletePage(p.id);
              const rest = pages.filter((x) => x.id !== p.id);
              setPages(rest);
              if (pageId === p.id) setPageId(rest.find((x) => x.slug === 'home')?.id ?? rest[0]?.id ?? null);
            }}
          />
        )}

        {left === 'site' && (
          <div className="st-site">
            <p className="st-group-title">Design</p>
            {schema.globals.filter((g) => g.slug === 'theme').map((g) => <SiteLink key={g.slug} label="Styles" hint="Colours, fonts, buttons, corners, spacing" on={panel.kind === 'global' && panel.slug === 'theme'} onClick={() => setPanel({ kind: 'global', slug: 'theme' })} />)}
            <SiteLink label="Header" hint="Menu links and the quote button" on={panel.kind === 'global' && panel.slug === 'header'} onClick={() => setPanel({ kind: 'global', slug: 'header' })} />
            <SiteLink label="Footer" hint="Columns, contact and copyright" on={panel.kind === 'global' && panel.slug === 'footer'} onClick={() => setPanel({ kind: 'global', slug: 'footer' })} />
            <SiteLink label="Site settings" hint="Name, contact details, socials, SEO" on={panel.kind === 'global' && panel.slug === 'site'} onClick={() => setPanel({ kind: 'global', slug: 'site' })} />
            <p className="st-group-title">Library</p>
            <SiteLink label="Media" hint="Images, videos and PDFs" onClick={() => setModal('media')} />
            <SiteLink label="Projects" hint="Case studies" onClick={() => setModal('projects')} />
            <SiteLink label="Enquiries" hint="Messages from the contact form" onClick={() => setModal('enquiries')} />
            <p className="st-group-title">More</p>
            <SiteLink label="CMS dashboard" hint="The full Payload admin" href={adminRoute} />
          </div>
        )}
        </TabPanel>
      </aside>

      {/* ── canvas ── */}
      <main className="st-canvas" aria-label="Page preview">
        <div className="st-canvas-frame" style={{ width: DEVICES[device] ?? '100%' }}>
          {page ? <iframe key={canvasKey} ref={frame} src={canvasURL} title={`Preview of ${page.title}`} /> : <div className="st-canvas-empty">Create a page to start.</div>}
        </div>
      </main>

      {/* ── inspector ── */}
      <aside className="st-right" aria-label="Inspector">
        {panel.kind === 'section' && doc && sections[panel.index] && blocks[sections[panel.index].blockType as string] ? (
          <SectionInspector
            block={blocks[sections[panel.index].blockType as string]}
            value={sections[panel.index]}
            tab={tab}
            setTab={setTab}
            onChange={(v) => setSections(sections.map((s, j) => (j === panel.index ? v : s)))}
            onClose={() => setPanel({ kind: 'page' })}
          />
        ) : panel.kind === 'global' ? (
          <GlobalInspector key={panel.slug} slug={panel.slug} schema={schema.globals.find((g) => g.slug === panel.slug)!} post={post} onSaved={() => { setStatus('Saved — live across the site.'); post({ type: 'refresh' }); }} onError={setError} />
        ) : doc ? (
          <PageInspector doc={doc} onChange={(v) => change(v)} />
        ) : <p className="st-help st-pad">Loading…</p>}
      </aside>

      {/* ── toasts ── */}
      <div className="st-toasts" aria-live="polite">
        {error && <div className="st-toast is-error"><span>{error}</span><button type="button" onClick={() => setError(null)} aria-label="Dismiss"><Icon name="close" size={14} /></button></div>}
        {status && <Toast text={status} onDone={() => setStatus(null)} />}
      </div>

      {/* ── modals ── */}
      <Modal open={modal === 'addSection'} onClose={() => setModal(null)} title="Add a section" description={`Inserted at position ${insertAt + 1}. You can move it afterwards.`} size="xl">
        <ul className="st-block-grid">
          {schema.sections.map((b) => (
            <li key={b.slug}>
              <button type="button" className="st-block-card" onClick={() => addSection(b.slug)}>
                {b.image && <img src={b.image} alt="" />}
                <b>{b.label}</b>
                {b.description && <small>{b.description}</small>}
              </button>
            </li>
          ))}
        </ul>
      </Modal>
      <NewPageModal open={modal === 'newPage'} onClose={() => setModal(null)} existing={pages.map((p) => p.slug ?? '')} onCreated={async (p) => { setModal(null); await refreshPages(); openPage(p.id); }} />
      <VersionsModal open={modal === 'versions'} pageId={pageId} onClose={() => setModal(null)} onRestored={async () => { setModal(null); if (pageId != null) { const d = await getPage(pageId); setDoc(d as unknown as Rec); latest.current = d as unknown as Rec; post({ type: 'refresh' }); setStatus('Earlier version restored as a draft.'); } }} />
      <Modal open={modal === 'media'} onClose={() => setModal(null)} title="Media library" description="Drop files anywhere in this window to upload. Click a file to edit its description or delete it." size="xl"><MediaLibrary /></Modal>
      <Modal open={modal === 'projects'} onClose={() => setModal(null)} title="Projects" description="Case studies shown on Work and in the showcase sections." size="xl"><ProjectsManager fields={schema.project} onChanged={() => post({ type: 'refresh' })} /></Modal>
      <Modal open={modal === 'enquiries'} onClose={() => setModal(null)} title="Enquiries" description="Messages sent through the contact form." size="lg"><EnquiriesManager /></Modal>
    </div>
  );
}

/* ── pieces ── */

function Toast({ text, onDone }: { text: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [text, onDone]);
  return <div className="st-toast"><span>{text}</span></div>;
}

function DeviceIcon({ d }: { d: Device }) {
  const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" className="ui-icon" {...S}>
      {d === 'desktop' && <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>}
      {d === 'tablet' && <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M11 18h2" /></>}
      {d === 'mobile' && <><rect x="7" y="3" width="10" height="18" rx="2" /><path d="M11 18h2" /></>}
    </svg>
  );
}

function SiteLink({ label, hint, on, onClick, href }: { label: string; hint: string; on?: boolean; onClick?: () => void; href?: string }) {
  const inner = <><b>{label}</b><small>{hint}</small></>;
  return href ? <a className="st-site-link" href={href}>{inner}</a> : <button type="button" className={`st-site-link${on ? ' is-on' : ''}`} onClick={onClick}>{inner}</button>;
}

function PagesList({ pages, current, onOpen, onNew, onDuplicate, onDelete }: { pages: PageRef[]; current: number | null; onOpen: (id: number) => void; onNew: () => void; onDuplicate: (id: number) => void; onDelete: (p: PageRef) => void }) {
  return (
    <div className="st-pages">
      <ul>
        {pages.map((p) => (
          <li key={p.id} className={p.id === current ? 'is-on' : undefined}>
            <button type="button" className="st-page-main" onClick={() => onOpen(p.id)}>
              <b>{p.title}</b>
              <small>{pagePath(p.slug)} · {p._status === 'draft' ? 'Unpublished changes' : 'Published'} · {timeAgo(p.updatedAt)}</small>
            </button>
            <span className="st-sec-actions">
              <button type="button" onClick={() => onDuplicate(p.id)} aria-label={`Duplicate ${p.title}`} title="Duplicate"><Icon name="copy" size={15} /></button>
              <button type="button" className="is-danger" onClick={() => onDelete(p)} aria-label={`Delete ${p.title}`} title="Delete" disabled={p.slug === 'home'}><Icon name="trash" size={15} /></button>
            </span>
          </li>
        ))}
      </ul>
      <button type="button" className="st-add" onClick={onNew}><Icon name="plus" size={14} /> New page</button>
    </div>
  );
}

function SectionInspector({ block, value, tab, setTab, onChange, onClose }: { block: SBlock; value: Rec; tab: 'content' | 'style'; setTab: (t: 'content' | 'style') => void; onChange: (v: Rec) => void; onClose: () => void }) {
  const styleGroup = block.fields.find((f) => f.styleTab);
  const anchor = block.fields.find((f) => f.name === 'anchor');
  const content = block.fields.filter((f) => !f.styleTab && f.name !== 'anchor' && f.name !== 'hidden');
  return (
    <div className="st-inspector">
      <div className="st-insp-head">
        <span className="st-sec-icon" aria-hidden="true"><SectionIcon type={block.slug} size={18} /></span>
        <div><small>Section</small><h2>{block.label}</h2></div>
        <button type="button" className="st-icon-btn" onClick={onClose} aria-label="Close inspector" title="Close"><Icon name="close" size={16} /></button>
      </div>
      <TabList base="st-insp" label={`${block.label} settings`} className="st-insp-tabs" active={tab} onChange={setTab}
        tabs={[{ value: 'content', label: 'Content' }, { value: 'style', label: 'Style' }]} />
      <TabPanel base="st-insp" active={tab} className="st-insp-body">
        {tab === 'content' ? (
          <>
            {block.description && <p className="st-note">{block.description}</p>}
            <FieldList fields={content} value={value} onChange={onChange} />
          </>
        ) : (
          <>
            <p className="st-note">Overrides for this section only. Leave a value empty to keep the site-wide style.</p>
            {styleGroup && <FieldList fields={styleGroup.fields ?? []} value={(value.style as unknown as Rec) ?? {}} onChange={(v) => onChange({ ...value, style: v })} />}
            {anchor && <FieldList fields={[{ ...anchor, label: 'Menu anchor' }]} value={value} onChange={onChange} />}
            <label className="st-switch-row">
              <span className="st-switch"><input type="checkbox" checked={!!value.hidden} onChange={(e) => onChange({ ...value, hidden: e.target.checked })} /><span aria-hidden="true" /></span>
              <span>Hide this section<small>It stays in the list but is left off the live page.</small></span>
            </label>
          </>
        )}
      </TabPanel>
    </div>
  );
}

function PageInspector({ doc, onChange }: { doc: Rec; onChange: (v: Rec) => void }) {
  const meta = (doc.meta as unknown as Rec) ?? {};
  const setMeta = (k: string, v: unknown) => onChange({ ...doc, meta: { ...meta, [k]: v } });
  const title = (meta.title as string) || (doc.title as string) || '';
  const desc = (meta.description as string) || '';
  const url = `${typeof window !== 'undefined' ? window.location.host : ''}${pagePath(doc.slug as string)}`;
  const isHome = doc.slug === 'home';
  return (
    <div className="st-inspector">
      <div className="st-insp-head"><div><small>Page</small><h2>{doc.title as string}</h2></div></div>
      <div className="st-insp-body">
        <div className="st-fields">
          <label className="st-field"><span className="st-label">Page name</span><input className="st-input" value={(doc.title as string) ?? ''} onChange={(e) => onChange({ ...doc, title: e.target.value })} /></label>
          <label className="st-field">
            <span className="st-label">Address</span>
            <div className="st-prefix"><span>/</span><input className="st-input" value={isHome ? '' : (doc.slug as string) ?? ''} placeholder={isHome ? '(homepage)' : 'about'} disabled={isHome} onChange={(e) => onChange({ ...doc, slug: slugify(e.target.value) })} /></div>
            {isHome && <p className="st-help">The homepage always lives at the site root.</p>}
          </label>
          <fieldset className="st-group">
            <legend>Search &amp; sharing</legend>
            <div className="st-serp" role="group" aria-label="Google preview">
              <small>{url}</small>
              <b>{title.slice(0, 60)}{title.length > 60 ? '…' : ''}</b>
              <p>{desc ? `${desc.slice(0, 160)}${desc.length > 160 ? '…' : ''}` : 'Add a description to control what Google shows under the title.'}</p>
            </div>
            <label className="st-field"><span className="st-label-row"><span className="st-label">Search title</span><span className={`st-value${title.length > 60 ? ' is-warn' : ''}`}>{title.length}/60</span></span><input className="st-input" value={(meta.title as string) ?? ''} placeholder={doc.title as string} onChange={(e) => setMeta('title', e.target.value)} /></label>
            <label className="st-field"><span className="st-label-row"><span className="st-label">Description</span><span className={`st-value${desc.length > 160 ? ' is-warn' : ''}`}>{desc.length}/160</span></span><textarea className="st-input" rows={3} value={desc} onChange={(e) => setMeta('description', e.target.value)} /></label>
            <FieldList fields={[{ type: 'upload', name: 'image', label: 'Share image', relationTo: 'media', description: '1200×630 works best. Falls back to the site default.' }]} value={meta} onChange={(v) => onChange({ ...doc, meta: v })} />
          </fieldset>
        </div>
      </div>
    </div>
  );
}

function GlobalInspector({ slug, schema, post, onSaved, onError }: { slug: GlobalSlug; schema: { label: string; description?: string; fields: SField[] }; post: (m: object) => void; onSaved: () => void; onError: (m: string) => void }) {
  const [value, setValue] = useState<Rec | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => { getGlobal(slug).then((v) => setValue(v as unknown as Rec)).catch((e) => onError((e as Error).message)); }, [slug, onError]);
  // Styles preview live on the canvas before saving.
  useEffect(() => { if (slug === 'theme' && value) post({ type: 'theme', vars: themeVars(value) }); }, [slug, value, post]);
  const saveNow = async () => {
    if (!value) return;
    setBusy(true);
    try { setValue((await saveGlobal(slug, value)) as unknown as Rec); setDirty(false); onSaved(); } catch (e) { onError((e as Error).message); } finally { setBusy(false); }
  };
  return (
    <div className="st-inspector">
      <div className="st-insp-head"><div><small>Site</small><h2>{slug === 'theme' ? 'Styles' : schema.label}</h2></div></div>
      <div className="st-insp-body">
        {schema.description && <p className="st-note">{schema.description}{slug === 'theme' ? ' Changes preview on the canvas as you edit.' : ''}</p>}
        {value ? <FieldList fields={schema.fields} value={value} onChange={(v) => { setValue(v); setDirty(true); }} /> : <p className="st-help">Loading…</p>}
      </div>
      <div className="st-insp-foot">
        <span className="st-help">{dirty ? 'Unsaved changes' : 'Saved'}</span>
        <button type="button" className="st-btn st-btn-primary" disabled={!dirty || busy} onClick={saveNow}>{busy ? 'Saving…' : 'Save & publish'}</button>
      </div>
    </div>
  );
}

function NewPageModal({ open, onClose, existing, onCreated }: { open: boolean; onClose: () => void; existing: string[]; onCreated: (p: { id: number }) => void }) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  // Each opening starts from an empty form (adjusted during render).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) { setWasOpen(open); if (open) { setTitle(''); setSlug(''); setTouched(false); setErr(null); } }
  const finalSlug = touched ? slug : slugify(title);
  const clash = existing.includes(finalSlug);
  const submit = async () => {
    if (!title.trim() || !finalSlug || clash) return;
    setBusy(true);
    try { onCreated(await createPage({ title: title.trim(), slug: finalSlug })); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };
  return (
    <Modal open={open} onClose={onClose} title="New page" description="Name it and choose its address. You'll add sections next." size="sm"
      footer={<><button type="button" className="st-btn" onClick={onClose}>Cancel</button><button type="button" className="st-btn st-btn-primary" disabled={busy || !title.trim() || !finalSlug || clash} onClick={submit}>{busy ? 'Creating…' : 'Create page'}</button></>}>
      <form className="st-fields" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <label className="st-field"><span className="st-label">Page name</span><input className="st-input" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Pricing" /></label>
        <label className="st-field"><span className="st-label">Address</span><div className="st-prefix"><span aria-hidden="true">/</span><input className={`st-input${clash ? ' is-invalid' : ''}`} aria-invalid={clash || undefined} aria-describedby={clash ? 'st-new-slug-error' : undefined} value={finalSlug} onChange={(e) => { setTouched(true); setSlug(slugify(e.target.value)); }} /></div>{clash && <p className="st-error" id="st-new-slug-error" role="alert">Another page already uses /{finalSlug}.</p>}</label>
        {err && <p className="st-error" role="alert">{err}</p>}
      </form>
    </Modal>
  );
}

type VersionRow = { id: number | string; updatedAt: string; status: string; autosave: boolean; title: string; sections: number };
function VersionsModal({ open, pageId, onClose, onRestored }: { open: boolean; pageId: number | null; onClose: () => void; onRestored: () => void }) {
  const confirm = useConfirm();
  const [rows, setRows] = useState<VersionRow[] | null>(null);
  const [key, setKey] = useState(`${open}-${pageId}`);
  if (key !== `${open}-${pageId}`) { setKey(`${open}-${pageId}`); setRows(null); }
  useEffect(() => {
    if (!open || pageId == null) return;
    let live = true;
    listPageVersions(pageId).then((r) => { if (live) setRows(r as VersionRow[]); }).catch(() => { if (live) setRows([]); });
    return () => { live = false; };
  }, [open, pageId]);
  return (
    <Modal open={open} onClose={onClose} title="Version history" description="Every publish and autosaved draft. Restoring loads that version as a draft; publish it to make it live." size="md">
      {!rows ? <p className="st-help">Loading…</p> : !rows.length ? <p className="st-help">No earlier versions yet.</p> : (
        <ul className="st-versions">
          {rows.map((v, i) => (
            <li key={String(v.id)}>
              <span><b>{new Date(v.updatedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</b><small>{v.status === 'published' ? 'Published' : v.autosave ? 'Autosaved draft' : 'Draft'} · {v.sections} sections{i === 0 ? ' · current' : ''}</small></span>
              {i > 0 && <button type="button" className="st-btn st-btn-sm" onClick={async () => { if (await confirm({ title: 'Restore this version?', body: 'It replaces the current draft. The live page only changes when you publish.', confirmLabel: 'Restore' })) { await restorePageVersion(v.id); onRestored(); } }}>Restore</button>}
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
