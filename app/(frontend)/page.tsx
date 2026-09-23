import Link from 'next/link';
import { asMedia, getAbout, getHome, getProjects, getSite } from '@/lib/cms';
import { digits, price } from '@/lib/format';
import { Img } from '@/components/Img';
import { Icon } from '@/components/Icon';
import { ProjectCard } from '@/components/ProjectCard';
import { ContactForm } from '@/components/ContactForm';

export default async function Home() {
  const [home, about, site, featured] = await Promise.all([getHome(), getAbout(), getSite(), getProjects({ featured: true })]);
  const work = featured.length ? featured : (await getProjects()).slice(0, 4);
  const heroImages = (home.heroImages?.length ? home.heroImages : work.map((p) => p.cover)).map(asMedia).filter(Boolean).slice(0, 5);
  const services = home.services ?? [];

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="wrap">
          <h1 className="h-xl hero-title">{home.headline}</h1>
          {home.intro && <p className="lede hero-intro">{home.intro}</p>}
          <div className="ctas">
            <Link className="btn btn-dark" href="/work">See the work <Icon name="arrow" size={15} /></Link>
            <Link className="btn btn-soft" href="/#contact">Start a project</Link>
          </div>
        </div>
        {heroImages.length > 0 && (
          <div className="hero-strip" aria-label="Recent work">
            {heroImages.map((m, i) => (
              <div className="hero-tile" key={m!.id}>
                <Img media={m} sizes="(max-width: 700px) 60vw, 22vw" preload={i < 3} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Selected work ── */}
      <section className="section" id="work" aria-labelledby="work-title">
        <div className="wrap">
          <div className="section-head">
            <div>
              <h2 className="h-lg" id="work-title">{home.workHeading}</h2>
              {home.workIntro && <p className="lede">{home.workIntro}</p>}
            </div>
            <Link className="link-arrow" href="/work">All projects <Icon name="arrow" size={15} /></Link>
          </div>
          <div className="grid-work">
            {work.map((p, i) => {
              // First card spans the row; so does the last one when it would otherwise sit alone.
              const large = i === 0 || (i === work.length - 1 && work.length % 2 === 0);
              return (
                <div className="grid-cell" key={p.id}>
                  <ProjectCard project={p} large={large} sizes={large ? '(max-width: 1240px) 100vw, 1200px' : '(max-width: 800px) 100vw, 600px'} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      {services.length > 0 && (
        <section className="section section-alt" id="services" aria-labelledby="services-title">
          <div className="wrap">
            <div className="section-head">
              <div>
                <h2 className="h-lg" id="services-title">{home.servicesHeading}</h2>
                {home.servicesIntro && <p className="lede">{home.servicesIntro}</p>}
              </div>
            </div>
            <div className="services">
              {services.map((s) => (
                <article className="service reveal" key={s.id}>
                  <h3 className="h-sm">{s.title}</h3>
                  {s.description && <p>{s.description}</p>}
                  {!!s.deliverables?.length && <ul className="tags">{s.deliverables.map((d) => <li key={d}>{d}</li>)}</ul>}
                  {s.priceFrom != null && (
                    <p className="service-price"><small>From</small> {price(s.priceFrom, s.currency)}<small>{s.unit}</small></p>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── About teaser ── */}
      <section className="section" aria-labelledby="about-title">
        <div className="wrap about-teaser">
          {asMedia(about.photo) && (
            <div className="about-photo reveal"><Img media={about.photo} sizes="(max-width: 800px) 80vw, 420px" /></div>
          )}
          <div>
            <p className="kicker">About</p>
            <h2 className="h-md" id="about-title">{about.headline}</h2>
            {about.short && <p className="lede">{about.short}</p>}
            <Link className="link-arrow" href="/about">More about me <Icon name="arrow" size={15} /></Link>
          </div>
        </div>
      </section>

      {/* ── Clients & testimonials ── */}
      {(!!home.clients?.length || !!home.testimonials?.length) && (
        <section className="section section-tight" aria-label="Clients">
          <div className="wrap">
            {!!home.clients?.length && (
              <>
                <p className="kicker center">Clients I’ve designed for</p>
                <ul className="clients">
                  {home.clients.map((c) => {
                    const logo = asMedia(c.logo);
                    const inner = logo ? <Img media={logo} sizes="160px" fill={false} className="client-logo" /> : c.name;
                    return <li key={c.id}>{c.url ? <a href={c.url} target="_blank" rel="noopener noreferrer">{inner}</a> : inner}</li>;
                  })}
                </ul>
              </>
            )}
            {!!home.testimonials?.length && (
              <div className="testimonials">
                {home.testimonials.map((t) => (
                  <figure className="quote reveal" key={t.id}>
                    <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
                    <figcaption><b>{t.name}</b>{t.title ? `, ${t.title}` : ''}</figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Contact ── */}
      <section className="section section-contact" id="contact" aria-labelledby="contact-title">
        <div className="wrap contact">
          <div>
            <h2 className="h-lg" id="contact-title">{home.contactHeading}</h2>
            {home.contactIntro && <p className="lede">{home.contactIntro}</p>}
            {site.availability && <p className="status"><span className="dot" aria-hidden="true" />{site.availability}</p>}
            <div className="contact-direct">
              <a className="btn btn-soft" href={`mailto:${site.email}`}><Icon name="mail" size={15} />{site.email}</a>
              {site.phone && site.whatsapp && (
                <a className="btn btn-soft" href={`https://wa.me/${digits(site.phone)}`} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={15} />WhatsApp</a>
              )}
            </div>
          </div>
          <ContactForm services={services.map((s) => s.title)} />
        </div>
      </section>
    </>
  );
}
