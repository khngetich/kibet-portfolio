'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from './Logo';
import { Icon } from './Icon';
import { ThemeToggle } from './ThemeToggle';

const LINKS = [
  { label: 'Work', href: '/work' },
  { label: 'Services', href: '/#services' },
  { label: 'About', href: '/about' },
];

/** Sticky header: always visible, gains a frosted background once the page scrolls. */
export function Header({ name }: { name: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open]);

  const active = (href: string) => !href.includes('#') && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header className={`header${scrolled || open ? ' is-scrolled' : ''}`}>
      <div className="wrap header-row">
        <Link className="brand" href="/" aria-label={`${name}, home`}>
          <Logo />
          <span>{name}</span>
        </Link>

        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={active(l.href) ? 'page' : undefined}>{l.label}</Link>
          ))}
        </nav>

        <div className="header-actions">
          <ThemeToggle />
          <Link className="btn btn-dark btn-sm hide-sm" href="/#contact">Start a project</Link>
          <button className="icon-btn menu-btn" type="button" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((v) => !v)}>
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={`mobile-menu${open ? ' open' : ''}`} hidden={!open}>
        <nav className="wrap" aria-label="Mobile">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} aria-current={active(l.href) ? 'page' : undefined}>{l.label}</Link>
          ))}
          <Link className="btn btn-dark" href="/#contact" onClick={() => setOpen(false)}>Start a project</Link>
        </nav>
      </div>
    </header>
  );
}
