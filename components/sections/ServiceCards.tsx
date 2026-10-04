import './services.css';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { ServiceLink } from '@/components/motion/ServiceLink';
import { Spotlight } from './Spotlight';

export type ServiceCardData = { title: string; description?: string | null; deliverables?: string[] | null; slug?: string | null; price?: string | null; unit?: string | null; featured?: boolean | null };

// a hue per card, as on the process steps: it tints the glow, the number and the list markers
const HUES = ['#FF6A2B', '#5B8DEF', '#A78BFA', '#2BB673', '#F5B83D', '#E8352B'];

/**
 * Services as typographic cards, two to a row: a large serif-italic number, the title, the
 * promise, what you get as a ruled list, and the price set large beside "Inquire". A soft glow
 * in the card's hue sits in its corner and a spotlight follows the pointer (Spotlight.tsx). The
 * whole card opens the service's page; "Inquire" jumps to the contact form with the service
 * chosen. One column on phones.
 */
export function ServiceCards({ services, ctaLabel, pageLabel, featuredLabel }: { services: ServiceCardData[]; ctaLabel: string; pageLabel: string; featuredLabel: string }) {
  return (
    <Spotlight className="svb-grid" data-count={services.length}>
      {services.map((s, i) => {
        const href = s.slug ? `/services/${s.slug}` : null;
        return (
          <li key={s.title} className="svb-card" style={{ '--h': HUES[i % HUES.length] } as CSSProperties}>
            <div className="svb-top">
              <span className="svb-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              {s.featured && <span className="svb-flag">{featuredLabel}</span>}
              <span className="svb-arrow" aria-hidden="true"><Icon name="arrow" size={18} /></span>
            </div>
            <h3 className="svb-title">
              {href
                ? <Link className="svb-link" href={href} aria-label={`${s.title}. ${pageLabel}`}>{s.title}</Link>
                : <ServiceLink className="svb-link" service={s.title}>{s.title}</ServiceLink>}
            </h3>
            {s.description && <p className="svb-desc">{s.description}</p>}
            {!!s.deliverables?.length && (
              <ul className="svb-get" aria-label="What you get">
                {s.deliverables.slice(0, 4).map((d) => <li key={d}>{d}</li>)}
              </ul>
            )}
            {(s.price || href) && (
              <div className="svb-foot">
                {s.price ? <p className="svb-price"><small>From</small><b>{s.price}</b>{s.unit && <small>{s.unit}</small>}</p> : <span />}
                {href && <ServiceLink className="svb-inquire" service={s.title}>{ctaLabel} <Icon name="arrow" size={14} /></ServiceLink>}
              </div>
            )}
          </li>
        );
      })}
    </Spotlight>
  );
}
