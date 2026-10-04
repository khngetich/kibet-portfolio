'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNav } from '@payloadcms/ui';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Icon } from '@/components/ui/Icon';
import { CommandPalette, openPalette } from './CommandPalette';
import { DocModalHost } from './DocModal';
import { sectionIcon } from './sectionIcons';
import { RecentlyOpened } from './RecentlyOpened';

export type NavGroup = { label: string; items: { slug: string; label: string; href: string; count?: number; badge?: string }[] };

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', className: 'ui-icon' } as const;

const noop = () => () => {};

/** Sidebar widths (px). Dragging below COLLAPSE_AT snaps to the icon rail. */
const RAIL = 72;
const MIN = 200;
const MAX = 400;
const DEFAULT = 256;
const COLLAPSE_AT = 150;
const STORE = 'cms-nav-width';
/** From this width up the sidebar sits beside the content; below it, phones get the bottom tab bar. */
const DESKTOP = '(min-width: 641px)';

function applyWidth(w: number) {
  const root = document.documentElement;
  root.style.setProperty('--nav-width', `${w}px`);
  root.classList.toggle('cms-nav-collapsed', w <= RAIL);
}

/** Below this width (tablets, small laptops) the sidebar starts as the icon rail unless you've chosen a width. */
const ROOMY = '(min-width: 1200px)';

/**
 * Tablet and desktop (641px up): the sidebar is always there (sticky, never hidden), and the
 * collapse button or the drag handle narrows it to the icon rail. Payload itself closes the
 * sidebar on any screen up to 1440px and only offers its hamburger to bring it back, so here
 * it is held open and the hamburgers are hidden (custom.css). Phones get a bottom tab bar
 * instead (<TabBar>), whose "More" opens Payload's full-screen menu. The width is remembered
 * per browser.
 */
function useSidebarWidth() {
  const [width, setWidth] = useState(DEFAULT);
  const [desktop, setDesktop] = useState(false);
  const last = useRef(DEFAULT);
  const { navOpen, setNavOpen } = useNav();

  useEffect(() => {
    if (desktop && !navOpen) setNavOpen(true);
  }, [desktop, navOpen, setNavOpen]);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP);
    const sync = () => {
      setDesktop(mq.matches);
      if (!mq.matches) {
        document.documentElement.style.removeProperty('--nav-width');
        document.documentElement.classList.remove('cms-nav-collapsed');
      } else {
        // no saved choice yet: full width on roomy screens, the rail on small laptops
        let stored = window.matchMedia(ROOMY).matches ? DEFAULT : RAIL;
        try { stored = Number(localStorage.getItem(STORE)) || stored; } catch { /* private mode */ }
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

  return { width, desktop, collapsed: desktop && width <= RAIL, toggle, onPointerDown, onKeyDown, navOpen, setNavOpen };
}

export function NavMenuClient({ admin, groups }: { admin: string; groups: NavGroup[] }) {
  const pathname = usePathname();
  // inside a settings pop-up (DocModal's GlobalWindow): hide the CMS frame, then say we're ready
  useEffect(() => {
    if (window.self === window.top) return;
    document.documentElement.classList.add('cms-embed');
    window.parent.postMessage('cms:embed-ready', location.origin);
  }, []);
  const nav = useSidebarWidth();
  const iconOut = useReducedMotion() ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: 'blur(4px)' };
  // true once on the client (the resizer is portalled into <body>)
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const mac = useSyncExternalStore(noop, () => /Mac|iPhone|iPad/.test(navigator.userAgent), () => true);
  // settings pages' names, for the Recent list (globals have no title of their own)
  const globalLabels = useMemo(() => Object.fromEntries(groups.flatMap((g) => g.items).filter((i) => i.href.includes('/globals/')).map((i) => [i.slug, i.label])), [groups]);
  const isActive = (href: string) => (href === admin ? pathname === admin : pathname === href || pathname.startsWith(`${href}/`));

  const item = (slug: string, label: string, href: string, count?: number, badge?: string) => {
    const active = isActive(href);
    return (
      <li key={href}>
        <Link href={href} className={`cms-nav-link${active ? ' is-active' : ''}`} aria-current={active ? 'page' : undefined} data-tip={badge ? `${label} · ${badge}` : label}>
          <Icon name={sectionIcon(slug)} size={20} />
          <span className="cms-nav-label">{label}</span>
          {badge ? <em className="cms-nav-badge">{badge}</em> : count != null && <i className="cms-nav-count">{count}</i>}
        </Link>
      </li>
    );
  };

  return (
    <div className="cms-nav">
      {/* opens the ⌘K palette below; looks like a field so it reads as "search" */}
      <button type="button" className="cms-nav-search" onClick={() => openPalette()} aria-keyshortcuts={mac ? 'Meta+K' : 'Control+K'} data-tip={`Search · ${mac ? '⌘' : 'Ctrl'} K`}>
        <Icon name="search" size={18} />
        <span className="cms-nav-label">Search</span>
        <kbd className="cms-nav-kbd">{mac ? '⌘' : 'Ctrl'} K</kbd>
      </button>
      {/* the links scroll on their own; search stays at the top and the controls below stay put */}
      <div className="cms-nav-body">
        <ul>{item('dashboard', 'Dashboard', admin)}</ul>
        {groups.map((g) => (
          <div key={g.label} className="cms-nav-group" role="group" aria-label={g.label}>
            <p aria-hidden="true">{g.label}</p>
            <ul>{g.items.map((i) => item(i.slug, i.label, i.href, i.count, i.badge))}</ul>
          </div>
        ))}
        <RecentlyOpened admin={admin} globals={globalLabels} />
      </div>
      <div className="cms-nav-foot">
      {/* The Studio, as a card at the foot of the sidebar; the icon rail keeps just its mark.
          It has its own root layout: a full page load, not a <Link>. */}
      <div className="cms-nav-promo">
        <span className="cms-nav-promo-mark" aria-hidden="true"><Icon name="pen" size={16} /></span>
        <b className="cms-nav-label">Studio</b>
        <p className="cms-nav-label">Edit pages on a live preview of the site.</p>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/studio" className="cms-nav-promo-btn" aria-label="Open Studio" data-tip="Open Studio">
          <Icon name="pen" size={18} className="cms-nav-promo-icon" /><span className="cms-nav-label">Open Studio</span>
        </a>
      </div>
      {nav.desktop && (
        <button type="button" className="cms-nav-collapse" onClick={nav.toggle} aria-label={nav.collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!nav.collapsed} data-tip={nav.collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <span className="ui-swap" aria-hidden="true">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.svg key={nav.collapsed ? 'expand' : 'collapse'} viewBox="0 0 24 24" width="18" height="18" {...S}
                initial={iconOut} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={iconOut}
                transition={{ type: 'spring', duration: 0.3, bounce: 0 }}>
                <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><path d={nav.collapsed ? 'M9.5 4.5v15M13.5 10l2 2-2 2' : 'M9.5 4.5v15M16 10l-2 2 2 2'} />
              </motion.svg>
            </AnimatePresence>
          </span>
          <span className="cms-nav-label">Collapse</span>
        </button>
      )}
      </div>
      {mounted && nav.collapsed && <RailTips />}
      <CommandPalette admin={admin} groups={groups} />
      <DocModalHost admin={admin} />
      {mounted && !nav.desktop && createPortal(
        <TabBar admin={admin} groups={groups} isActive={isActive} menuOpen={nav.navOpen} onMenu={() => nav.setNavOpen(!nav.navOpen)} />,
        document.body,
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

/**
 * The icon rail's labels: a tooltip beside whichever item is hovered or focused (keyboard too),
 * read from its data-tip. One element for the whole rail, positioned in the viewport so the
 * sidebar's scrolling never clips it. The label itself stays in the link for screen readers.
 */
function RailTips() {
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null);
  useEffect(() => {
    const rail = document.querySelector('.nav');
    if (!rail) return;
    // Payload's own sign-out link has no label of its own in the rail
    rail.querySelector('.nav__log-out')?.setAttribute('data-tip', 'Log out');
    const show = (e: Event) => {
      const el = (e.target as Element | null)?.closest?.('[data-tip]');
      if (!el || !rail.contains(el)) return setTip(null);
      const r = el.getBoundingClientRect();
      // just outside the rail's edge, level with the item
      setTip({ text: el.getAttribute('data-tip') ?? '', x: rail.getBoundingClientRect().right + 10, y: r.top + r.height / 2 });
    };
    const hide = () => setTip(null);
    rail.addEventListener('pointerover', show);
    rail.addEventListener('focusin', show);
    rail.addEventListener('pointerleave', hide);
    rail.addEventListener('focusout', hide);
    rail.addEventListener('scroll', hide, true);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') hide(); };
    document.addEventListener('keydown', onKey);
    return () => {
      rail.removeEventListener('pointerover', show);
      rail.removeEventListener('focusin', show);
      rail.removeEventListener('pointerleave', hide);
      rail.removeEventListener('focusout', hide);
      rail.removeEventListener('scroll', hide, true);
      document.removeEventListener('keydown', onKey);
    };
  }, []);
  if (!tip) return null;
  return createPortal(<div className="cms-rail-tip" role="tooltip" style={{ left: tip.x, top: tip.y }}>{tip.text}</div>, document.body);
}

/**
 * Phones: the main sections as icons along the bottom, in thumb reach. "More" opens Payload's
 * full-screen menu (every collection and setting, search and the Studio); it closes again on
 * navigation. Enquiries carries the same "new" count as the sidebar.
 */
function TabBar({ admin, groups, isActive, menuOpen, onMenu }: { admin: string; groups: NavGroup[]; isActive: (href: string) => boolean; menuOpen: boolean; onMenu: () => void }) {
  const find = (slug: string) => groups.flatMap((g) => g.items).find((i) => i.slug === slug);
  const tabs = [
    { slug: 'dashboard', label: 'Home', href: admin, badge: undefined as string | undefined },
    ...(['pages', 'projects', 'inquiries'] as const).flatMap((slug) => {
      const i = find(slug);
      return i ? [{ slug, label: slug === 'inquiries' ? 'Inbox' : i.label, href: i.href, badge: i.badge ? i.badge.replace(/\D+/g, '') : undefined }] : [];
    }),
  ];
  return (
    <nav className="cms-tabbar" aria-label="Main">
      {tabs.map((t) => {
        const on = !menuOpen && isActive(t.href);
        return (
          <Link key={t.slug} href={t.href} className={`cms-tab${on ? ' is-active' : ''}`} aria-current={on ? 'page' : undefined}>
            <span className="cms-tab-icon">
              <Icon name={sectionIcon(t.slug)} size={22} />
              {t.badge && <em className="cms-tab-badge" aria-label={`${t.badge} new`}>{t.badge}</em>}
            </span>
            <span className="cms-tab-label">{t.label}</span>
          </Link>
        );
      })}
      <button type="button" className={`cms-tab${menuOpen ? ' is-active' : ''}`} aria-expanded={menuOpen} onClick={onMenu}>
        <span className="cms-tab-icon"><Icon name={menuOpen ? 'close' : 'more'} size={22} /></span>
        <span className="cms-tab-label">{menuOpen ? 'Close' : 'More'}</span>
      </button>
    </nav>
  );
}
