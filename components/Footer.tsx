import Link from 'next/link';
import type { Footer as FooterData, Site } from '@/payload-types';
import { Icon, type IconName } from './Icon';
import { Accent } from './Accent';

const SOCIAL: Record<string, string> = { instagram: 'Instagram', behance: 'Behance', dribbble: 'Dribbble', linkedin: 'LinkedIn', x: 'X', facebook: 'Facebook', tiktok: 'TikTok' };
const isExternal = (url: string) => /^(https?:|mailto:|tel:)/.test(url);
function A({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return isExternal(href)
    ? <a className={className} href={href} {...(/^https?:/.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{children}</a>
    : <Link className={className} href={href}>{children}</Link>;
}

/**
 * The footer on every page, kept short: a dark call-to-action band, then one row with the name,
 * tagline and social icons, and a last line with the copyright and the policy links.
 * Everything comes from Website → Footer and Site settings (Socials).
 */
export function Footer({ site, footer }: { site: Site; footer: FooterData }) {
  const first = site.name.split(/\s+/)[0];
  const brand = footer.title || site.name;
  const cta = footer.cta ?? {};
  const copyright = (footer.copyright || '© {year} {name}. All rights reserved.').replace('{year}', String(new Date().getFullYear())).replace('{name}', first);
  const socials = footer.showSocials !== false ? (site.socials ?? []).filter((s) => s.url) : [];
  const statement = footer.tagline || site.tagline || `${site.role}${site.location ? ` · ${site.location}` : ''}`;

  return (
    <footer className="fx">
      {cta.show !== false && cta.heading && (
        <div className="fx-cta band-dark">
          <div className="fx-cta-glow" aria-hidden="true" />
          <div className="wrap fx-cta-inner">
            <p className="fx-cta-title"><Accent text={cta.heading} /></p>
            {cta.text && <p className="fx-cta-text">{cta.text}</p>}
            {cta.buttonLabel && cta.buttonUrl && <A className="fx-cta-btn" href={cta.buttonUrl}>{cta.buttonLabel} <Icon name="arrow" size={16} /></A>}
          </div>
        </div>
      )}

      <div className="wrap fx-main">
        <div className="fx-top">
          <div className="fx-brand">
            <Link className="fx-name" href="/">{brand}<span className="brand-dot" aria-hidden="true">.</span></Link>
            {statement && <p className="fx-statement">{statement}</p>}
            {footer.showAvailability !== false && site.availability && <p className="fx-status"><span className="dot" aria-hidden="true" />{site.availability}</p>}
          </div>
          {!!socials.length && (
            <ul className="fx-socials" aria-label="Social profiles">
              {socials.map((s) => (
                <li key={s.id ?? s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={SOCIAL[s.platform] ?? s.platform}><Icon name={s.platform as IconName} size={18} /></a></li>
              ))}
            </ul>
          )}
        </div>
        <div className="fx-bottom">
          <p>{copyright}{footer.note ? <span className="fx-note"> {footer.note}</span> : null}</p>
          {!!footer.legal?.length && (
            <nav aria-label="Policies"><ul className="fx-legal">{footer.legal.map((l) => <li key={l.id ?? l.url}><A className="fx-link" href={l.url}>{l.label}</A></li>)}</ul></nav>
          )}
        </div>
      </div>
    </footer>
  );
}
