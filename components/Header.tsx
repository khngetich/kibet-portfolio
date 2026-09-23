'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Logo } from './Logo';
import { Icon } from './Icon';

// In page order.
const LINKS = [
  { label: 'Work', id: 'work' },
  { label: 'About', id: 'about' },
  { label: 'For who', id: 'for-who' },
  { label: 'Process', id: 'process' },
  { label: 'Services', id: 'services' },
];

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Fixed site header on every page: brand on the left, a pill of section links in the
 * centre (beside the brand on phones). It gains a frosted backdrop once the page scrolls.
 * On the homepage the link for the section in view is highlighted; on other pages the
 * links jump back to those sections.
 */
export function Header({ name, availability, ctaLabel }: { name: string; availability?: string | null; ctaLabel: string }) {
  const pathname = usePathname();
  const home = pathname === '/';
  const reduce = useReducedMotion();
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // Highlight whichever section crosses the middle of the viewport.
  useEffect(() => {
    if (!home) { setActive(null); return; }
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: '-50% 0px -50% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    const onTop = () => { if (window.scrollY < window.innerHeight * 0.5) setActive(null); };
    window.addEventListener('scroll', onTop, { passive: true });
    return () => { io.disconnect(); window.removeEventListener('scroll', onTop); };
  }, [home]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const href = (id: string) => (home ? `#${id}` : `/#${id}`);

  return (
    <>
      <header className={`site-header${scrolled || open ? ' is-scrolled' : ''}`}>
        <Link className="brand" href="/" aria-label={`${name}, home`}>
          <Logo />
          <span>{name}</span>
        </Link>

      <motion.nav
        className="pill-nav"
        aria-label="Primary"
        initial={reduce ? false : { y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.9, ease: EASE }}
      >
        <Link className="pill-home" href="/" aria-label="Home" aria-current={home && !active ? 'page' : undefined}>
          <Icon name="home" size={16} />
        </Link>
        <ul className="pill-links">
          {LINKS.map((l) => (
            <li key={l.id}>
              <a href={href(l.id)} className={active === l.id ? 'is-active' : undefined} aria-current={active === l.id ? 'location' : undefined}>
                {active === l.id && <motion.span layoutId="pill-active" className="pill-active" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                <span className="pill-label">{l.label}</span>
              </a>
            </li>
          ))}
        </ul>
        <button className="pill-menu" type="button" aria-expanded={open} aria-controls="pill-sheet" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((v) => !v)}>
          <Icon name={open ? 'close' : 'menu'} size={16} />
        </button>
        <a className="pill-cta" href={href('contact')}>{ctaLabel}</a>

        <AnimatePresence>
          {open && (
            <motion.ul
              id="pill-sheet"
              className="pill-sheet"
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              {LINKS.map((l) => (
                <li key={l.id}><a href={href(l.id)} onClick={() => setOpen(false)}>{l.label}</a></li>
              ))}
              <li><Link href="/work" onClick={() => setOpen(false)}>All work</Link></li>
            </motion.ul>
          )}
        </AnimatePresence>
      </motion.nav>
        <div className="site-header-end">
          {!home && <Link className="topbar-link" href="/work" aria-current={pathname.startsWith('/work') ? 'page' : undefined}>All work</Link>}
        </div>
      </header>

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
