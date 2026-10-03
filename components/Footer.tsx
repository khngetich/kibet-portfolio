import Link from 'next/link';
import { Fragment } from 'react';
import type { Footer as FooterData, Site } from '@/payload-types';
import { Icon } from './Icon';
import { digits } from '@/lib/format';
import { SOCIAL_LABEL, socialIcon } from '@/lib/socials';
import { Accent } from './Accent';
import { SmartLink } from './SmartLink';
import { Year } from './Year';
import { FooterWatch } from './FooterWatch';


/**
 * The footer on every page, kept short: a dark call-to-action band, then one row with the name and
 * tagline on one side and the ways to reach you (email, WhatsApp, social icons) on the other, and a
 * last line with the copyright and the policy links.
 * Everything comes from Website → Footer and Site settings (Socials).
 */
export function Footer({ site, footer }: { site: Site; footer: FooterData }) {
  const first = site.name.split(/\s+/)[0];
  const brand = footer.title || site.name;
  const cta = footer.cta ?? {};
  // {year} becomes the live year (components/Year.tsx); {name} the first name
  const copyright = (footer.copyright || '© {year} {name}. All rights reserved.').replace('{name}', first).split('{year}');
  const socials = footer.showSocials !== false ? (site.socials ?? []).filter((s) => s.url) : [];
  const wa = site.phone && site.whatsapp ? `https://wa.me/${digits(site.phone)}` : null;
  const statement = footer.tagline || site.tagline || `${site.role}${site.location ? ` · ${site.location}` : ''}`;

  return (
    <footer className="fx">
      {cta.show !== false && cta.heading && (
        <div className="fx-cta band-dark">
          <div className="fx-cta-glow" aria-hidden="true" />
          <div className="wrap fx-cta-inner">
            <p className="fx-cta-title"><Accent text={cta.heading} /></p>
            {cta.text && <p className="fx-cta-text">{cta.text}</p>}
            {cta.buttonLabel && cta.buttonUrl && <SmartLink className="fx-cta-btn" href={cta.buttonUrl}>{cta.buttonLabel} <Icon name="arrow" size={16} /></SmartLink>}
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
          <div className="fx-reach">
            <ul className="fx-contact" aria-label="Contact">
              {site.email && <li><a className="fx-link" href={`mailto:${site.email}`}><Icon name="mail" size={16} />{site.email}</a></li>}
              {wa && <li><a className="fx-link" href={wa} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={16} />{site.phone}</a></li>}
              {site.phone && !wa && <li><a className="fx-link" href={`tel:+${digits(site.phone)}`}><Icon name="phone" size={16} />{site.phone}</a></li>}
            </ul>
          {!!socials.length && (
            <ul className="fx-socials" aria-label="Social profiles">
              {socials.map((s) => (
                <li key={s.id ?? s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={SOCIAL_LABEL[s.platform] ?? s.platform}><Icon name={socialIcon(s.platform)} size={18} /></a></li>
              ))}
            </ul>
          )}
          </div>
        </div>
        <div className="fx-bottom">
          <FooterWatch />
          <p>{copyright.map((part, i) => <Fragment key={i}>{i > 0 && <Year />}{part}</Fragment>)}{footer.note ? <span className="fx-note"> {footer.note}</span> : null}</p>
          {!!footer.legal?.length && (
            <nav aria-label="Policies"><ul className="fx-legal">{footer.legal.map((l) => <li key={l.id ?? l.url}><SmartLink className="fx-link" href={l.url}>{l.label}</SmartLink></li>)}</ul></nav>
          )}
        </div>
      </div>
    </footer>
  );
}
