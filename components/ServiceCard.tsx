import Link from 'next/link';
import type { ServiceCard as Service } from '@/lib/cms';
import { asMedia } from '@/lib/cms';
import { price } from '@/lib/format';
import { Img } from './Img';
import { Icon } from './Icon';
import { Reveal } from './motion/Reveal';
import { ServiceLink } from './motion/ServiceLink';

/** "Graphic Design & Social Assets" → "Graphic" in ink, "Design & Social Assets" muted (as on the reference's tiles). */
function twoTone(title: string) {
  const [first, ...rest] = title.split(' ');
  return rest.length ? <>{first} <span className="svc-title-rest">{rest.join(' ')}</span></> : title;
}

type Item = Omit<Service, 'id' | 'slug'> & { id?: string | number | null; slug?: string | null };

/**
 * A service as a product card: its cover (or a numbered tile when it has none, never another
 * project's image), the one-line promise, price, "What you get", and a link to its page.
 * Shared by the homepage Services section and the /services index.
 */
export function ServiceCardItem({ item, index, labels = {} }: { item: Item; index: number; labels?: { featured?: string; pageLink?: string; inquire?: string } }) {
  const image = asMedia(item.image);
  return (
    <Reveal className={`svc-card${item.featured ? ' band-dark is-featured' : ''}`} delay={(index % 3) * 0.08}>
      <figure className="svc-media">
        {image
          ? <span className="svc-img"><Img media={image} sizes="(max-width: 760px) 90vw, 400px" /></span>
          : <span className="svc-img is-blank" aria-hidden="true"><b>{String(index + 1).padStart(2, '0')}</b></span>}
        {item.featured && <span className="svc-flag">{labels.featured || 'Featured service'}</span>}
        {item.imageCaption && <figcaption>{item.imageCaption}</figcaption>}
      </figure>
      <div className="svc-body">
        {item.starter && <p className="svc-starter"><Icon name="spark" size={12} /> A good first project</p>}
        <h3 className="svc-title">{twoTone(item.title)}</h3>
        {item.description && <p className="svc-desc">{item.description}</p>}
        {item.priceFrom != null && <p className="svc-price"><small>From</small> {price(item.priceFrom, item.currency)}<small>{item.unit}</small></p>}
        {!!item.deliverables?.length && (
          <div className="svc-get">
            <p className="ed-kicker">What you get</p>
            <ul>{item.deliverables.map((d) => <li key={d}>{d}</li>)}</ul>
          </div>
        )}
        {item.slug
          ? <Link className="svc-cta" href={`/services/${item.slug}`}><span className="svc-cta-ic" aria-hidden="true"><Icon name="arrow" size={14} /></span>{labels.pageLink || 'What’s included'}</Link>
          : <ServiceLink className="svc-cta" service={item.title}><span className="svc-cta-ic" aria-hidden="true"><Icon name="arrow" size={14} /></span>{labels.inquire || 'Ask about this one'}</ServiceLink>}
      </div>
    </Reveal>
  );
}
