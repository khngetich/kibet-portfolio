'use client';

import './service-row.css';
import Link from 'next/link';
import { useId, useState } from 'react';
import type { Media } from '@/payload-types';
import { Img } from '@/components/Img';
import { Icon } from '@/components/Icon';
import { ServiceLink } from './ServiceLink';

export type ServiceRowItem = {
  key: string;
  title: string;
  description?: string | null;
  price?: string | null;
  unit?: string | null;
  deliverables?: string[] | null;
  slug?: string | null;
  image?: Media | null;
  featured?: boolean | null;
};

/**
 * Services as a row of cards where one is open at a time (after a "product card" reference):
 * the open card widens to show its promise, price, the first things you get and its cover;
 * the others fold to a tinted panel with the title and an arrow. Pointing at a card, tabbing
 * into it or pressing its title opens it. On phones the cards stack and open downwards.
 */
export function ServiceRow({ items, labels }: { items: ServiceRowItem[]; labels: { pageLink: string; inquire: string; featured: string } }) {
  const [open, setOpen] = useState(0);
  const base = useId();

  return (
    <ul className="svr" role="list">
      {items.map((item, i) => {
        const active = i === open;
        const panel = `${base}-panel-${i}`;
        const link = item.slug ? `/services/${item.slug}` : null;
        const go = (
          <>
            <span className="svr-go-label">{link ? labels.pageLink : labels.inquire}</span>
            <span className="svr-arrow" aria-hidden="true"><Icon name="arrow" size={16} /></span>
          </>
        );
        return (
          <li
            key={item.key}
            className={`svr-card${active ? ' is-open' : ''}`}
            onPointerEnter={(e) => { if (e.pointerType === 'mouse') setOpen(i); }}
            onFocus={() => setOpen(i)}
          >
            <div className="svr-text">
              {item.featured && <p className="svr-flag">{labels.featured}</p>}
              <h3 className="svr-title">
                <button type="button" aria-expanded={active} aria-controls={panel} onClick={() => setOpen(i)}>{item.title}</button>
              </h3>
              <div className="svr-more" id={panel} inert={!active}>
                <div className="svr-more-in">
                  {item.description && <p className="svr-desc">{item.description}</p>}
                  {item.price && <p className="svr-price"><small>From</small> {item.price}{item.unit && <small>{item.unit}</small>}</p>}
                  {!!item.deliverables?.length && <ul className="svr-get">{item.deliverables.slice(0, 3).map((d) => <li key={d}>{d}</li>)}</ul>}
                </div>
              </div>
              {link
                ? <Link className="svr-go" href={link} aria-label={`${labels.pageLink}: ${item.title}`}>{go}</Link>
                : <ServiceLink className="svr-go" service={item.title}>{go}</ServiceLink>}
            </div>
            <figure className="svr-media" aria-hidden={!active}>
              {item.image
                ? <span className="svr-img"><Img media={item.image} sizes="(max-width: 760px) 90vw, 420px" /></span>
                : <span className="svr-img is-blank"><b>{String(i + 1).padStart(2, '0')}</b></span>}
            </figure>
          </li>
        );
      })}
    </ul>
  );
}
