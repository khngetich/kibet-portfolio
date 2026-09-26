import Link from 'next/link';
import type { Footer as FooterData, Site } from '@/payload-types';
import { digits } from '@/lib/format';
import { Icon, type IconName } from './Icon';
import { FooterRise } from './motion/FooterRise';

const SOCIAL: Record<string, string> = { instagram: 'Instagram', behance: 'Behance', dribbble: 'Dribbble', linkedin: 'LinkedIn', x: 'X', facebook: 'Facebook', tiktok: 'TikTok' };
const isExternal = (url: string) => /^(https?:|mailto:|tel:)/.test(url);
function A({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return isExternal(href)
    ? <a className={className} href={href} {...(/^https?:/.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{children}</a>
    : <Link className={className} href={href}>{children}</Link>;
}

/**
 * The inverted footer on every page: a dark call-to-action card with rounded bottom corners,
 * then a light canvas holding a white card (brand, statement, socials, link lists, contact,
 * copyright and legal links) that rises from behind the dark card, over a giant watermark.
 * Everything comes from Website → Footer and Site settings.
 */
export function Footer({ site, footer }: { site: Site; footer: FooterData }) {
  const first = site.name.split(/\s+/)[0];
  const brand = footer.title || first.toUpperCase();
  const contact = footer.contact ?? {};
  const cta = footer.cta ?? {};
  const copyright = (footer.copyright || '© {year} {name}. All rights reserved.').replace('{year}', String(new Date().getFullYear())).replace('{name}', first);
  const socials = footer.showSocials !== false ? (site.socials ?? []).filter((s) => s.url) : [];
  const wa = site.phone && site.whatsapp ? `https://wa.me/${digits(site.phone)}` : null;

  return (
    <footer className="fx">
      {cta.show !== false && cta.heading && (
        <div className="fx-cta">
          <div className="fx-cta-glow" aria-hidden="true" />
          <div className="wrap fx-cta-inner">
            <p className="fx-cta-title">{cta.heading}</p>
            {cta.text && <p className="fx-cta-text">{cta.text}</p>}
            {cta.buttonLabel && cta.buttonUrl && <A className="fx-cta-btn" href={cta.buttonUrl}>{cta.buttonLabel} <Icon name="arrow" size={16} /></A>}
          </div>
        </div>
      )}

      <div className="fx-canvas">
        <div className="wrap">
          <FooterRise className="fx-card">
            <div className="fx-grid">
              <div className="fx-brand">
                <p className="fx-name">{brand}</p>
                <p className="fx-statement">{footer.tagline || `${site.role}${site.location ? ` · ${site.location}` : ''}`}</p>
                {footer.showAvailability !== false && site.availability && <p className="fx-status"><span className="dot" aria-hidden="true" />{site.availability}</p>}
                {!!socials.length && (
                  <ul className="fx-socials" aria-label="Social profiles">
                    {socials.map((s) => (
                      <li key={s.id ?? s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={SOCIAL[s.platform] ?? s.platform}><Icon name={s.platform as IconName} size={18} /></a></li>
                    ))}
                  </ul>
                )}
              </div>
              {(footer.columns ?? []).map((col) => (
                <nav className="fx-col" key={col.id ?? col.heading} aria-label={col.heading}>
                  <p className="fx-col-title">{col.heading}</p>
                  <ul>{(col.links ?? []).map((l) => <li key={l.id ?? l.url}><A className="fx-link" href={l.url}>{l.label}</A></li>)}</ul>
                </nav>
              ))}
              {contact.show !== false && (
                <div className="fx-col">
                  <p className="fx-col-title">{contact.heading || 'Contact'}</p>
                  <ul>
                    {contact.showEmail !== false && <li><a className="fx-link" href={`mailto:${site.email}`}>{site.email}</a></li>}
                    {contact.showPhone !== false && site.phone && <li><a className="fx-link" href={`tel:+${digits(site.phone)}`}>{site.phone}</a></li>}
                    {contact.showWhatsApp !== false && wa && <li><a className="fx-link" href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>}
                  </ul>
                </div>
              )}
            </div>
            <div className="fx-bottom">
              <p>{copyright}{footer.note ? <span className="fx-note"> {footer.note}</span> : null}</p>
              {!!footer.legal?.length && <ul className="fx-legal">{footer.legal.map((l) => <li key={l.id ?? l.url}><A className="fx-link" href={l.url}>{l.label}</A></li>)}</ul>}
            </div>
          </FooterRise>
        </div>
        <p className="fx-watermark" aria-hidden="true">{first.toUpperCase()}</p>
      </div>
    </footer>
  );
}
