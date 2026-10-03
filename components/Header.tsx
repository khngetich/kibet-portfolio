'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotionConfig } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from './Icon';
import { ThemeToggle } from './ThemeToggle';

type NavLink = { label: string; url: string };

const EASE = [0.16, 1, 0.3, 1] as const;

/** "/#work" or "#work" → "work"; anything else → null. */
const anchorOf = (url: string) => (url.startsWith('#') ? url.slice(1) : url.startsWith('/#') ? url.slice(2) : null);

/**
 * The header bar on every page: the name on the left, the menu in the middle, and on the right
 * the theme switch (plus a quote button when Header settings turn it on). Links to page
 * sections highlight while that section is on screen; the links and button come from the
 * Header settings in the CMS.
 */
export function Header({ name, menu, quote, availability }: { name: string; menu: NavLink[]; quote: NavLink | null; availability?: string | null }) {
  const pathname = usePathname();
  const reduce = useReducedMotionConfig();
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);

  // On the page itself, "/#work" becomes "#work" so it scrolls instead of reloading.
  const href = (url: string) => (pathname === '/' && url.startsWith('/#') ? url.slice(1) : url);
  const anchors = useMemo(() => menu.map((l) => anchorOf(l.url)).filter((a): a is string => !!a), [menu]);

  // A new page (or menu) closes the sheet and clears the highlight; adjusted during render.
  const [seenFor, setSeenFor] = useState({ pathname, anchors });
  if (seenFor.pathname !== pathname || seenFor.anchors !== anchors) {
    setSeenFor({ pathname, anchors });
    if (seenFor.pathname !== pathname) setOpen(false);
    setActive(null);
  }

  // Highlight whichever linked section crosses the middle of the viewport.
  useEffect(() => {
    const sections = anchors.map((a) => document.getElementById(a)).filter((el): el is HTMLElement => !!el);
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: '-50% 0px -50% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    const onTop = () => { if (window.scrollY < window.innerHeight * 0.5) setActive(null); };
    window.addEventListener('scroll', onTop, { passive: true });
    return () => { io.disconnect(); window.removeEventListener('scroll', onTop); };
  }, [anchors, pathname]);

  useEffect(() => {
    if (!open) return;
    // Escape closes the menu and puts focus back on the button that opened it.
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); menuBtn.current?.focus(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const isCurrent = (l: NavLink) => {
    const a = anchorOf(l.url);
    if (a) return pathname === '/' && active === a;
    return l.url.startsWith('/') && l.url !== '/' && (pathname === l.url || pathname.startsWith(`${l.url}/`));
  };

  return (
    <>
      <motion.header
        className="site-header"
        initial={reduce ? false : { y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.3, ease: EASE }}
      >
        <Link className="brand" href="/" aria-label={`${name}, home`}>{name}<span className="brand-dot" aria-hidden="true">.</span></Link>

        <nav className="header-nav" aria-label="Primary">
          <ul>
            {menu.map((l) => {
              const current = isCurrent(l);
              return (
                <li key={l.url + l.label}>
                  <Link href={href(l.url)} className={current ? 'is-active' : undefined} aria-current={current ? (anchorOf(l.url) ? 'location' : 'page') : undefined}>
                    {current && <motion.span layoutId="nav-active" className="nav-active" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                    <span className="nav-label">{l.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="header-end">
          {!!menu.length && (
            <button ref={menuBtn} className="menu-btn" type="button" aria-expanded={open} aria-controls="menu-sheet" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((v) => !v)}>
              <Icon name={open ? 'close' : 'menu'} size={16} />
            </button>
          )}
          {quote && <Link className="header-cta" href={href(quote.url)}>{quote.label} <Icon name="arrow" size={14} /></Link>}
          <ThemeToggle />
        </div>
        {/* how far down the page you are: a hairline driven by scroll position (CSS only) */}
        <span className="scroll-progress" aria-hidden="true" />

        <AnimatePresence>
          {open && (
            <motion.ul
              id="menu-sheet"
              className="menu-sheet"
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              {menu.map((l) => (
                <li key={l.url + l.label}><Link href={href(l.url)} onClick={() => setOpen(false)} aria-current={isCurrent(l) ? 'page' : undefined}>{l.label}</Link></li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </motion.header>

      {availability && (
        <motion.p
          className="avail-badge"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease: EASE }}
        >
          <span className="dot" aria-hidden="true" />{availability}
        </motion.p>
      )}
    </>
  );
}
