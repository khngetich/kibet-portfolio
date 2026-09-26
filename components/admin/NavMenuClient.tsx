'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

export type NavGroup = { label: string; items: { slug: string; label: string; href: string; count?: number; badge?: string }[] };

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', className: 'ui-icon' } as const;
const ICONS: Record<string, React.ReactNode> = {
  dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
  pages: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></>,
  projects: <><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M8 6V4h8v2M3 12h18" /></>,
  media: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 16l5-5 4 4 3-3 6 6" /><circle cx="15.5" cy="8.5" r="1.5" /></>,
  inquiries: <><path d="M4 5h16v11H9l-5 4z" /><path d="M8 9h8M8 12h5" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.8c1.6.8 2.6 2.5 3 5.2" /></>,
  header: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18" /></>,
  footer: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 15h18" /></>,
  site: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></>,
  default: <><rect x="4" y="4" width="16" height="16" rx="3" /></>,
};

const noop = () => () => {};

/** Sidebar widths (px). Dragging below COLLAPSE_AT snaps to the icon rail. */
const RAIL = 76;
const MIN = 200;
const MAX = 400;
const DEFAULT = 264;
const COLLAPSE_AT = 150;
const STORE = 'cms-nav-width';
/** Resizing only applies where the sidebar sits beside the content (Payload overlays it below this). */
const DESKTOP = '(min-width: 1025px)';

function applyWidth(w: number) {
  const root = document.documentElement;
  root.style.setProperty('--nav-width', `${w}px`);
  root.classList.toggle('cms-nav-collapsed', w <= RAIL);
}

/** Drag handle on the sidebar's edge plus a collapse button; the width is remembered per browser. */
function useSidebarWidth() {
  const [width, setWidth] = useState(DEFAULT);
  const [desktop, setDesktop] = useState(false);
  const last = useRef(DEFAULT);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP);
    const sync = () => {
      setDesktop(mq.matches);
      if (!mq.matches) {
        document.documentElement.style.removeProperty('--nav-width');
        document.documentElement.classList.remove('cms-nav-collapsed');
      } else {
        let stored = DEFAULT;
        try { stored = Number(localStorage.getItem(STORE)) || DEFAULT; } catch { /* private mode */ }
        setWidth(stored);
        applyWidth(stored);
      }
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const save = (w: number) => { try { localStorage.setItem(STORE, String(w)); } catch { /* private mode */ } };
  const set = useCallback((w: number, persist = true) => {
    setWidth(w);
    applyWidth(w);
    if (w > RAIL) last.current = w;
    if (persist) save(w);
  }, []);

  const toggle = () => set(width <= RAIL ? Math.max(last.current, MIN) : RAIL);

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const handle = e.currentTarget as HTMLElement;
    handle.setPointerCapture(e.pointerId);
    document.documentElement.classList.add('cms-nav-resizing');
    // One layout per frame while dragging; the width is stored once, on release.
    let frame = 0;
    let next = width;
    const move = (ev: PointerEvent) => {
      const x = ev.clientX;
      next = x < COLLAPSE_AT ? RAIL : Math.min(MAX, Math.max(MIN, x));
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; set(next, false); });
    };
    const up = () => {
      cancelAnimationFrame(frame);
      set(next);
      document.documentElement.classList.remove('cms-nav-resizing');
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      handle.removeEventListener('pointercancel', up);
      handle.removeEventListener('lostpointercapture', up);
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', up);
    handle.addEventListener('lostpointercapture', up, { once: true });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') set(width - 24 < COLLAPSE_AT ? RAIL : Math.max(MIN, width - 24));
    if (e.key === 'ArrowRight') set(Math.min(MAX, Math.max(MIN, width + 24)));
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  };

  return { width, desktop, collapsed: desktop && width <= RAIL, toggle, onPointerDown, onKeyDown };
}

export function NavMenuClient({ admin, groups }: { admin: string; groups: NavGroup[] }) {
  const pathname = usePathname();
  const nav = useSidebarWidth();
  const iconOut = useReducedMotion() ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: 'blur(4px)' };
  // true once on the client (the resizer is portalled into <body>)
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const isActive = (href: string) => (href === admin ? pathname === admin : pathname === href || pathname.startsWith(`${href}/`));

  const item = (slug: string, label: string, href: string, count?: number, badge?: string) => {
    const active = isActive(href);
    return (
      <li key={href}>
        <Link href={href} className={`cms-nav-link${active ? ' is-active' : ''}`} aria-current={active ? 'page' : undefined} title={nav.collapsed ? label : undefined}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...S}>{ICONS[slug] ?? ICONS.default}</svg>
          <span className="cms-nav-label">{label}</span>
          {badge ? <em className="cms-nav-badge">{badge}</em> : count != null && <i className="cms-nav-count">{count}</i>}
        </Link>
      </li>
    );
  };

  return (
    <div className="cms-nav">
      <ul>
        {item('dashboard', 'Dashboard', admin)}
        <li>
          {/* the Studio has its own root layout: a full page load, not a <Link> */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/studio" className="cms-nav-link cms-nav-studio" title={nav.collapsed ? 'Open Studio' : undefined}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...S}><path d="M4 20l4-1 11-11-3-3L5 16z" /><path d="M14 6l3 3" /></svg>
            <span className="cms-nav-label">Studio</span>
            <em className="cms-nav-badge cms-nav-badge-blue">Edit site</em>
          </a>
        </li>
      </ul>
      {groups.map((g) => (
        <div key={g.label} className="cms-nav-group">
          <p>{g.label}</p>
          <ul>{g.items.map((i) => item(i.slug, i.label, i.href, i.count, i.badge))}</ul>
        </div>
      ))}
      {nav.desktop && (
        <button type="button" className="cms-nav-collapse" onClick={nav.toggle} aria-label={nav.collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={nav.collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <span className="ui-swap" aria-hidden="true">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.svg key={nav.collapsed ? 'expand' : 'collapse'} viewBox="0 0 24 24" width="16" height="16" {...S}
                initial={iconOut} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={iconOut}
                transition={{ type: 'spring', duration: 0.3, bounce: 0 }}>
                <rect x="3" y="4" width="18" height="16" rx="2" /><path d={nav.collapsed ? 'M9 4v16M13 10l2 2-2 2' : 'M9 4v16M16 10l-2 2 2 2'} />
              </motion.svg>
            </AnimatePresence>
          </span>
          <span className="cms-nav-label">Collapse</span>
        </button>
      )}
      {mounted && nav.desktop && createPortal(
        <div
          className="cms-nav-resizer"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          aria-valuemin={RAIL}
          aria-valuemax={MAX}
          aria-valuenow={nav.width}
          tabIndex={0}
          onPointerDown={nav.onPointerDown}
          onKeyDown={nav.onKeyDown}
          onDoubleClick={nav.toggle}
        />,
        document.body,
      )}
    </div>
  );
}
