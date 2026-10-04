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
 * The footer on every page: the call-to-action card (the one closing call to action on every
 * page), then one row with the name and tagline on one side and the ways to reach you (email,
 * WhatsApp, social icons) on the other, a last line with the copyright, the site credit and the
 * policy links, and the name set large as a sign-off.
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
  const credit = footer.credit?.label?.trim() ? { label: footer.credit.label.trim(), url: footer.credit.url || null } : null;
  // the second way in: on a page that already has the contact form, it takes the button's place
  const alt = wa ? { label: 'Or chat on WhatsApp', url: wa } : site.email ? { label: 'Or email me', url: `mailto:${site.email}` } : null;
  const creditInText = !!credit && copyright.some((part) => part.includes(credit.label));

  return (
    <footer className="fx">
      {cta.show !== false && cta.heading && (
        <div className="fx-cta band-dark">
          <div className="fx-cta-glow" aria-hidden="true" />
          <div className="fx-cta-inner">
            <p className="fx-cta-title"><Accent text={cta.heading} /></p>
            <div className="fx-cta-side">
              {cta.text && <p className="fx-cta-text">{cta.text}</p>}
              <div className="fx-cta-actions">
                {cta.buttonLabel && cta.buttonUrl && <SmartLink className="fx-cta-btn" href={cta.buttonUrl}>{cta.buttonLabel} <Icon name="arrow" size={16} /></SmartLink>}
                {alt && <a className="fx-cta-alt" href={alt.url} {...(alt.url.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{alt.label}</a>}
              </div>
            </div>
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
          <p>
            {copyright.map((part, i) => <Fragment key={i}>{i > 0 && <Year />}{credit && creditInText ? withCredit(part, credit) : part}</Fragment>)}
            {credit && !creditInText && <> Site by <Credit {...credit} />.</>}
            {footer.note ? <span className="fx-note"> {footer.note}</span> : null}
          </p>
          {!!footer.legal?.length && (
            <nav aria-label="Policies"><ul className="fx-legal">{footer.legal.map((l) => <li key={l.id ?? l.url}><SmartLink className="fx-link" href={l.url}>{l.label}</SmartLink></li>)}</ul></nav>
          )}
        </div>
      </div>

      {/* the sign-off: the name set across the full width; the letters lift in a wave on hover */}
      <p className="fx-word" aria-hidden="true" style={{ '--chars': brand.length + 1 } as React.CSSProperties}>
        {[...brand].map((ch, i) => <span key={i} style={{ '--i': i } as React.CSSProperties}>{ch === ' ' ? '\u00a0' : ch}</span>)}
        <span className="brand-dot" style={{ '--i': brand.length } as React.CSSProperties}>.</span>
      </p>
    </footer>
  );
}

/** The credit's name inside the copyright text becomes the link. */
function withCredit(text: string, credit: { label: string; url: string | null }) {
  const at = text.indexOf(credit.label);
  if (at < 0) return text;
  return <>{text.slice(0, at)}<Credit {...credit} />{text.slice(at + credit.label.length)}</>;
}

/** Who made the site: the name rolls up to its accent copy on hover and an arrow slides in. */
function Credit({ label, url }: { label: string; url: string | null }) {
  if (!url) return <b className="fx-credit is-plain">{label}</b>;
  return (
    <a className="fx-credit" href={url} target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens in a new tab)`}>
      <span className="fx-credit-roll"><span data-text={label}>{label}</span></span>
      <Icon name="external" size={12} />
    </a>
  );
}
