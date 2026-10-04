import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { asMedia, getProjects, getService, getServices, getServiceSlugs, getSite } from '@/lib/cms';
import { digits, price } from '@/lib/format';
import { Img } from '@/components/Img';
import { Icon } from '@/components/Icon';
import { GlassFolder } from '@/components/GlassFolder';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbLd, canonical, ogCard, pageTitle, serviceLd } from '@/lib/seo';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getServiceSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getService((await params).slug);
  if (!service) return {};
  const image = asMedia(service.image);
  const description = service.metaDescription || service.description || undefined;
  const title = service.metaTitle || service.title;
  return {
    title: pageTitle(title, (await getSite()).name),
    description,
    alternates: { canonical: canonical(`/services/${service.slug}`) },
    openGraph: { title, description, images: [image?.url ? { url: image.url, width: image.width ?? undefined, height: image.height ?? undefined, alt: image.alt } : { url: ogCard(title, 'Service'), width: 1200, height: 630, alt: title }] },
  };
}

/**
 * A service's own page (Content → Services): what it is and costs, what you get, who it suits,
 * how it runs, real work for it, questions, and a way to start. Empty parts are left out.
 * "Start this project" opens the homepage's contact form with this service already chosen.
 */
export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const [service, all, projects, site] = await Promise.all([getService(slug), getServices(), getProjects(), getSite()]);
  if (!service) notFound();

  const i = all.findIndex((x) => x.slug === slug);
  const number = String((i < 0 ? 0 : i) + 1).padStart(2, '0');
  const image = asMedia(service.image);
  const picked = new Set((service.projects ?? []).map((p) => (typeof p === 'object' ? p.id : p)));
  const work = projects.filter((p) => picked.has(p.id));
  const others = all.filter((x) => x.slug !== slug);
  const start = `/?service=${encodeURIComponent(service.title)}#contact`;
  const whatsapp = site.phone && site.whatsapp ? `https://wa.me/${digits(site.phone)}` : null;
  const steps = service.steps ?? [];
  const faqs = service.faqs ?? [];

  return (
    <article className="svp">
      <JsonLd data={[serviceLd(service, site.name), breadcrumbLd([{ name: 'Services', path: '/services' }, { name: service.title, path: `/services/${service.slug}` }])]} />
      <header className="wrap svp-head">
        <Link className="case-back" href="/services"><Icon name="left" size={14} /> All services</Link>
        <div className="case-title-row">
          <div>
            <p className="eyebrow">Service {number}{service.starter ? ' · A good first project' : ''}</p>
            <h1 className="h-xl svp-title">{service.title}<span className="case-dot" aria-hidden="true">.</span></h1>
          </div>
          <p className="case-no" aria-hidden="true">{number}</p>
        </div>
        {service.description && <p className="lede svp-lede">{service.description}</p>}
        <dl className="svp-facts">
          {service.priceFrom != null && <div><dt>From</dt><dd>{price(service.priceFrom, service.currency)}{service.unit && <small> {service.unit}</small>}</dd></div>}
          {service.timeline && <div><dt>Typical timeline</dt><dd>{service.timeline}</dd></div>}
        </dl>
        <div className="svp-actions">
          <Link className="btn btn-light" href={start}>Start this project <Icon name="arrow" size={15} /></Link>
          {whatsapp && <a className="link-under" href={whatsapp} target="_blank" rel="noopener noreferrer">Or chat on WhatsApp</a>}
        </div>
      </header>

      {image && (
        <figure className="wrap svp-lead">
          <span className="svp-lead-img"><Img media={image} sizes="(max-width: 1240px) 100vw, 1240px" preload /></span>
          {service.imageCaption && <figcaption>{service.imageCaption}</figcaption>}
        </figure>
      )}

      {(service.intro || !!service.deliverables?.length || !!service.goodFor?.length) && (
        <section className="wrap svp-split" aria-label="What it includes">
          <div>
            {service.intro && <><p className="ed-kicker">About this service</p><p className="svp-intro">{service.intro}</p></>}
            {!!service.goodFor?.length && (
              <div className="svp-good">
                <p className="ed-kicker">Good for</p>
                <ul className="tl-points">{service.goodFor.map((g) => <li key={g}>{g}</li>)}</ul>
              </div>
            )}
          </div>
          {!!service.deliverables?.length && (
            <div className="svp-get">
              <h2 className="ed-kicker">What you get</h2>
              <ul>{service.deliverables.map((d) => <li key={d}><Icon name="check" size={16} />{d}</li>)}</ul>
            </div>
          )}
        </section>
      )}

      {steps.length > 0 && (
        <section className="wrap svp-steps" aria-labelledby="svp-steps-title">
          <h2 id="svp-steps-title" className="h-md">How it works</h2>
          <ol className="tl-steps">
            {steps.map((st, n) => (
              <li key={st.id ?? n} className="tl-step">
                <span className="tl-num" aria-hidden="true">{String(n + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="tl-title"><span className="sr-only">Step {n + 1}: </span>{st.title}</h3>
                  {st.description && <p className="tl-desc">{st.description}</p>}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {work.length > 0 && (
        <section className="svp-work" aria-labelledby="svp-work-title">
          <div className="wrap">
            <h2 id="svp-work-title" className="h-md">Selected work</h2>
            <ol className="gf-shelf" data-count={work.length}>
              {work.map((p, i) => <li key={p.id}><GlassFolder project={p} n={i + 1} sizes="(max-width: 760px) 60vw, 340px" /></li>)}
            </ol>
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="wrap svp-faq" aria-labelledby="svp-faq-title">
          <h2 id="svp-faq-title" className="h-md">Questions</h2>
          <div className="faq-list">
            {faqs.map((q, n) => (
              <details key={q.id ?? n} className="faq-item">
                <summary>{q.question}<span aria-hidden="true" /></summary>
                <p>{q.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <nav className="wrap ed-more svp-more" aria-label="Other services">
          <p className="ed-kicker">Other services</p>
          <ul>{others.map((x) => <li key={x.id}><Link className="link-under" href={`/services/${x.slug}`}>{x.title} <Icon name="arrow" size={13} /></Link></li>)}</ul>
        </nav>
      )}
    </article>
  );
}
