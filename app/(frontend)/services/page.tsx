import type { Metadata } from 'next';
import Link from 'next/link';
import { getPage, getServices, getSite } from '@/lib/cms';
import { breadcrumbLd, canonical, ogCard, SITE_URL } from '@/lib/seo';
import { Accent, plain } from '@/components/Accent';
import { JsonLd } from '@/components/JsonLd';
import { ServiceCardItem } from '@/components/ServiceCard';

/**
 * /services: every published service (Content → Services) as product cards, each opening its own
 * page. The heading, intro and labels come from the homepage's Services section, so they're
 * edited in one place.
 */

async function copy() {
  const home = await getPage('home');
  const block = home?.sections?.find((s) => s.blockType === 'services' && !s.hidden);
  return block?.blockType === 'services' ? block : null;
}

export async function generateMetadata(): Promise<Metadata> {
  const [s, site] = await Promise.all([copy(), getSite()]);
  const title = plain(s?.heading) || 'Services';
  return {
    title,
    description: s?.intro || `Services from ${site.name}.`,
    alternates: { canonical: canonical('/services') },
    openGraph: { images: [{ url: ogCard(title, 'Services'), width: 1200, height: 630, alt: title }] },
  };
}

export default async function ServicesIndex() {
  const [services, s] = await Promise.all([getServices(), copy()]);
  const heading = s?.heading || 'What I can do *for you*';
  return (
    <section className="svx" aria-labelledby="svx-title">
      <JsonLd data={[
        { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: services.map((x, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/services/${x.slug}`, name: x.title })) },
        breadcrumbLd([{ name: 'Services', path: '/services' }]),
      ]} />
      <div className="wrap">
        <header className="svx-head">
          <p className="eyebrow">{s?.eyebrow || 'Services'}</p>
          <h1 className="h-xl" id="svx-title"><Accent text={heading} /></h1>
          {s?.intro && <p className="lede">{s.intro}</p>}
          {/* the page ends on the site-wide call to action (components/Footer.tsx), so the nudge lives up here */}
          <p className="svx-note">Not sure which fits? <Link className="link-under" href="/#contact">Tell me what you’re working on</Link> and I’ll suggest one.</p>
        </header>
        {services.length ? (
          <ul className="svc-grid">
            {services.map((item, i) => (
              <li key={item.id}>
                <ServiceCardItem item={item} index={i} labels={{ featured: s?.labels?.featured || '', pageLink: s?.pageLinkLabel || '' }} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="insights-empty">Services are on their way. In the meantime, <Link className="link-under" href="/#contact">tell me what you need</Link>.</p>
        )}
      </div>
    </section>
  );
}
