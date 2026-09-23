import Link from 'next/link';
import type { Site } from '@/payload-types';
import { digits } from '@/lib/format';
import { Icon } from './Icon';
import { Socials } from './Socials';

export function Footer({ site }: { site: Site }) {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-card">
          <div className="footer-intro">
            <p className="footer-title">{site.studio || site.name}</p>
            <p className="muted">{site.role}{site.location ? ` · ${site.location}` : ''}</p>
            {site.availability && <p className="status"><span className="dot" aria-hidden="true" />{site.availability}</p>}
            <Socials socials={site.socials} />
          </div>
          <div className="footer-col">
            <p className="kicker">Contact</p>
            <a href={`mailto:${site.email}`}><Icon name="mail" size={15} />{site.email}</a>
            {site.phone && <a href={`tel:+${digits(site.phone)}`}>{site.phone}</a>}
            {site.phone && site.whatsapp && (
              <a href={`https://wa.me/${digits(site.phone)}`} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={15} />WhatsApp</a>
            )}
          </div>
          <div className="footer-col">
            <p className="kicker">Site</p>
            <Link href="/work">Work</Link>
            <Link href="/about">About</Link>
            <Link href="/#process">Process</Link>
            <Link href="/#services">Services</Link>
            <Link href="/#contact">Contact</Link>
          </div>
        </div>
        <p className="footer-bottom">&copy; {year} {site.studio || site.name}.{site.footerNote ? ` ${site.footerNote}` : ''}</p>
      </div>
    </footer>
  );
}
