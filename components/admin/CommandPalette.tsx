'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Icon, type IconName } from '@/components/ui/Icon';
import type { NavGroup } from './NavMenuClient';
import { openDoc } from './DocModal';
import { sectionIcon } from './sectionIcons';

/**
 * ⌘K / Ctrl+K: jump to any page, project, enquiry, file or setting, or start something new.
 * Mounted once in the sidebar, so it works on every CMS screen. Nothing is fetched until it is
 * first opened; pages and projects then load once (titles only), and enquiries and media are
 * searched on the server as you type.
 */

/** `doc`: open in the pop-up editor (DocModal) instead of navigating; `id` left out = create. */
type Item = { id: string; label: string; hint?: string; group: string; icon: IconName; href: string; full?: boolean; external?: boolean; doc?: { collection: string; id?: number } };

const EVENT = 'cms:palette';
export const openPalette = () => window.dispatchEvent(new Event(EVENT));

const qs = (params: Record<string, string | number>) => new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString();
const getJSON = async <T,>(url: string, signal?: AbortSignal): Promise<T[]> => {
  const res = await fetch(url, { credentials: 'include', signal });
  if (!res.ok) return [];
  return ((await res.json()) as { docs?: T[] }).docs ?? [];
};
const norm = (s?: string | null) => (s ?? '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');

export function CommandPalette({ admin, groups }: { admin: string; groups: NavGroup[] }) {
  const router = useRouter();
  const base = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const [docs, setDocs] = useState<Item[] | null>(null);
  // server results, tagged with the term they answer so stale ones are never shown
  const [found, setFound] = useState<{ term: string; items: Item[] }>({ term: '', items: [] });
  const [searching, setSearching] = useState(false);

  const show = useCallback(() => { setOpen(true); setQ(''); setActive(0); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (dialog.current?.open) dialog.current.close(); else show();
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener(EVENT, show);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener(EVENT, show); };
  }, [show]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) { d.showModal(); input.current?.focus(); }
    if (!open && d.open) d.close();
  }, [open]);

  // pages and projects: loaded once, on first open
  useEffect(() => {
    if (!open || docs) return;
    const fields = (f: string[]) => Object.fromEntries(f.map((k) => [`select[${k}]`, 'true']));
    Promise.all([
      getJSON<{ id: number; title?: string | null; slug?: string | null }>(`/api/pages?${qs({ depth: 0, limit: 200, draft: 'true', sort: '-updatedAt', ...fields(['title', 'slug']) })}`),
      getJSON<{ id: number; title?: string | null; client?: string | null }>(`/api/projects?${qs({ depth: 0, limit: 300, draft: 'true', sort: '-updatedAt', ...fields(['title', 'client']) })}`),
    ]).then(([pages, projects]) => setDocs([
      ...pages.map((p) => ({ id: `page-${p.id}`, label: p.title || 'Untitled page', hint: !p.slug ? 'No address yet' : p.slug === 'home' ? '/' : `/${p.slug}`, group: 'Pages', icon: 'file' as const, href: `${admin}/collections/pages/${p.id}`, doc: { collection: 'pages', id: p.id } })),
      ...projects.map((p) => ({ id: `project-${p.id}`, label: p.title || 'Untitled project', hint: p.client || 'Project', group: 'Projects', icon: 'portfolio' as const, href: `${admin}/collections/projects/${p.id}`, doc: { collection: 'projects', id: p.id } })),
    ])).catch(() => setDocs([]));
  }, [open, docs, admin]);

  // enquiries and media: searched on the server (there can be thousands)
  useEffect(() => {
    const term = q.trim();
    if (!open || term.length < 2) return;
    const ctrl = new AbortController();
    const t = window.setTimeout(async () => {
      setSearching(true);
      const like = (fields: string[]) => Object.fromEntries(fields.map((f, i) => [`where[or][${i}][${f}][like]`, term]));
      try {
        const [enquiries, media] = await Promise.all([
          getJSON<{ id: number; name?: string | null; email?: string | null; service?: string | null; status?: string | null }>(`/api/inquiries?${qs({ depth: 0, limit: 6, sort: '-createdAt', ...like(['name', 'email', 'service']), 'select[name]': 'true', 'select[email]': 'true', 'select[service]': 'true', 'select[status]': 'true' })}`, ctrl.signal),
          getJSON<{ id: number; alt?: string | null; filename?: string | null }>(`/api/media?${qs({ depth: 0, limit: 5, sort: '-createdAt', ...like(['alt', 'filename']), 'select[alt]': 'true', 'select[filename]': 'true' })}`, ctrl.signal),
        ]);
        setFound({ term, items: [
          ...enquiries.map((e) => ({ id: `enquiry-${e.id}`, label: e.name || 'Enquiry', hint: `${e.service || e.email || ''}${e.status === 'new' ? ' · New' : ''}`, group: 'Enquiries', icon: 'inbox' as const, href: `${admin}/collections/inquiries/${e.id}`, doc: { collection: 'inquiries', id: e.id } })),
          ...media.map((m) => ({ id: `media-${m.id}`, label: m.alt || m.filename || 'File', hint: m.filename ?? undefined, group: 'Media', icon: 'image' as const, href: `${admin}/collections/media/${m.id}`, doc: { collection: 'media', id: m.id } })),
        ] });
      } catch { /* aborted by the next keystroke */ }
      finally { if (!ctrl.signal.aborted) setSearching(false); }
    }, 180);
    return () => { ctrl.abort(); window.clearTimeout(t); };
  }, [q, open, admin]);

  const fixed = useMemo<Item[]>(() => [
    { id: 'new-page', label: 'New page', group: 'Actions', icon: 'file', href: `${admin}/collections/pages/create`, doc: { collection: 'pages' } },
    { id: 'new-project', label: 'New project', group: 'Actions', icon: 'portfolio', href: `${admin}/collections/projects/create`, doc: { collection: 'projects' } },
    { id: 'upload', label: 'Upload media', group: 'Actions', icon: 'image', href: `${admin}/collections/media/create`, doc: { collection: 'media' } },
    { id: 'studio', label: 'Open Studio', hint: 'Visual editor', group: 'Actions', icon: 'pen', href: '/studio', full: true },
    { id: 'site', label: 'View site', group: 'Actions', icon: 'external', href: '/', external: true },
    { id: 'dashboard', label: 'Dashboard', group: 'Go to', icon: 'dashboard', href: admin },
    ...groups.flatMap((g) => g.items.map((i) => ({ id: `nav-${i.slug}`, label: i.label, hint: i.badge ?? g.label, group: 'Go to', icon: sectionIcon(i.slug), href: i.href }))),
  ], [admin, groups]);

  const results = useMemo(() => {
    const remote = found.term === q.trim() && q.trim().length >= 2 ? found.items : [];
    const term = norm(q.trim());
    const all = [...fixed, ...(docs ?? [])];
    const local = term
      ? all
        .map((i) => { const l = norm(i.label); const at = l.indexOf(term); return { i, score: at === 0 ? 0 : at > 0 ? 1 : norm(i.hint).includes(term) ? 2 : -1 }; })
        .filter((r) => r.score >= 0)
        .sort((a, b) => a.score - b.score)
        .map((r) => r.i)
      : [...fixed.filter((i) => i.group === 'Actions'), ...(docs ?? []).slice(0, 6), ...fixed.filter((i) => i.group === 'Go to')];
    return [...local.slice(0, 30), ...remote];
  }, [q, fixed, docs, found]);

  // one list for the keyboard, shown under group headings
  const grouped = useMemo(() => {
    const order: string[] = [];
    const by = new Map<string, { item: Item; index: number }[]>();
    results.forEach((item, index) => {
      if (!by.has(item.group)) { by.set(item.group, []); order.push(item.group); }
      by.get(item.group)!.push({ item, index });
    });
    return order.map((g) => ({ group: g, rows: by.get(g)! }));
  }, [results]);

  const go = (item?: Item) => {
    if (!item) return;
    setOpen(false);
    if (item.doc) openDoc(item.doc);
    else if (item.external) window.open(item.href, '_blank', 'noopener');
    else if (item.full) window.location.assign(item.href);
    else router.push(item.href);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const n = results.length;
      if (!n) return;
      setActive((a) => (a + (e.key === 'ArrowDown' ? 1 : -1) + n) % n);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(results[active]);
    }
  };

  useEffect(() => {
    document.getElementById(`${base}-opt-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, base]);

  return (
    <dialog ref={dialog} className="cms-palette" aria-label="Search and jump" onClose={() => setOpen(false)} onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      {open && (
        <div className="cms-palette-box">
          <div className="cms-palette-field">
            <Icon name="search" size={18} />
            <input
              ref={input}
              role="combobox"
              aria-expanded="true"
              aria-controls={`${base}-list`}
              aria-activedescendant={results[active] ? `${base}-opt-${active}` : undefined}
              aria-autocomplete="list"
              placeholder="Search pages, projects, enquiries, files…"
              value={q}
              onChange={(e) => { setQ(e.target.value); setActive(0); }}
              onKeyDown={onKey}
              spellCheck={false}
              autoComplete="off"
            />
            {searching && <span className="cms-palette-spin" aria-hidden="true" />}
            <kbd>Esc</kbd>
          </div>
          <div id={`${base}-list`} role="listbox" className="cms-palette-list" aria-label="Results">
            {grouped.map(({ group, rows }) => (
              <div key={group} role="group" aria-labelledby={`${base}-g-${group}`}>
                <p id={`${base}-g-${group}`} className="cms-palette-group">{group}</p>
                {rows.map(({ item, index }) => (
                  <div
                    key={item.id}
                    id={`${base}-opt-${index}`}
                    role="option"
                    aria-selected={index === active}
                    className={`cms-palette-opt${index === active ? ' is-active' : ''}`}
                    onPointerMove={() => setActive(index)}
                    onClick={() => go(item)}
                  >
                    <span className="cms-palette-icon"><Icon name={item.icon} size={16} /></span>
                    <span className="cms-palette-label">{item.label}</span>
                    {item.hint && <span className="cms-palette-hint">{item.hint}</span>}
                    {index === active && <Icon name="right" size={15} className="cms-palette-go" />}
                  </div>
                ))}
              </div>
            ))}
            {!results.length && (
              <p className="cms-palette-empty">{q.trim().length >= 2 && searching ? 'Searching…' : `Nothing matches “${q.trim()}”.`}</p>
            )}
          </div>
          <p className="cms-palette-foot"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span><span><kbd>Esc</kbd> close</span></p>
        </div>
      )}
    </dialog>
  );
}
