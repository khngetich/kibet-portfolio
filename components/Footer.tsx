import Link from 'next/link';
import type { Footer as FooterData, Site } from '@/payload-types';
import { digits } from '@/lib/format';
import { Icon } from './Icon';
import { Socials } from './Socials';

/** The footer on every page. Columns, contact column and small print come from Website → Footer. */
export function Footer({ site, footer }: { site: Site; footer: FooterData }) {
  const name = site.studio || site.name;
  const contact = footer.contact ?? {};
  const copyright = (footer.copyright || '© {year} {name}.').replace('{year}', String(new Date().getFullYear())).replace('{name}', name);
  const isExternal = (url: string) => /^https?:\/\//.test(url);

  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-card">
          <div className="footer-intro">
            <p className="footer-title">{footer.title || name}</p>
            <p className="muted">{footer.tagline || `${site.role}${site.location ? ` · ${site.location}` : ''}`}</p>
            {footer.showAvailability !== false && site.availability && <p className="status"><span className="dot" aria-hidden="true" />{site.availability}</p>}
            {footer.showSocials !== false && <Socials socials={site.socials} />}
          </div>
          {contact.show !== false && (
            <div className="footer-col">
              <p className="kicker">{contact.heading || 'Contact'}</p>
              {contact.showEmail !== false && <a href={`mailto:${site.email}`}><Icon name="mail" size={15} />{site.email}</a>}
              {contact.showPhone !== false && site.phone && <a href={`tel:+${digits(site.phone)}`}>{site.phone}</a>}
              {contact.showWhatsApp !== false && site.phone && site.whatsapp && (
                <a href={`https://wa.me/${digits(site.phone)}`} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={15} />WhatsApp</a>
              )}
            </div>
          )}
          {(footer.columns ?? []).map((col) => (
            <div className="footer-col" key={col.id ?? col.heading}>
              <p className="kicker">{col.heading}</p>
              {(col.links ?? []).map((l) =>
                isExternal(l.url)
                  ? <a key={l.id ?? l.url} href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a>
                  : <Link key={l.id ?? l.url} href={l.url}>{l.label}</Link>,
              )}
            </div>
          ))}
        </div>
        <p className="footer-bottom">{copyright}{footer.note ? ` ${footer.note}` : ''}</p>
      </div>
    </footer>
  );
}
