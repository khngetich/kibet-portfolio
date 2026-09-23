import Link from 'next/link';
import { asMedia, getAbout, getHome, getProjects, getSite } from '@/lib/cms';
import { digits, price } from '@/lib/format';
import { COPY, DEFAULT_PROCESS, DEFAULT_ROLES, DEFAULT_STATS, SITE_COPY, orDefault, text } from '@/lib/home-copy';
import type { Media } from '@/payload-types';
import { Img } from '@/components/Img';
import { Icon } from '@/components/Icon';
import { ContactForm } from '@/components/ContactForm';
import { Reveal, ScrollWords, SplitWords } from '@/components/home/Reveal';
import { HeroCards } from '@/components/home/HeroCards';
import { RoleWheel } from '@/components/home/RoleWheel';
import { TiltGallery } from '@/components/home/TiltGallery';
import { CoverFlow } from '@/components/home/CoverFlow';
import { StackCards } from '@/components/home/StackCards';
import { AboutBanner } from '@/components/home/AboutBanner';
import { ServiceLink } from '@/components/home/ServiceLink';
import './home.css';

const initials = (name: string) => name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

/**
 * Landing page. All copy comes from Payload (Pages → Homepage and Settings → Site settings). The order is deliberate: show who and how good (hero with the client strip, then work),
 * then who's behind it (about), who it's for, how it runs, what it costs, and finally
 * the contact form, which every "Start a project" button on the page leads to.
 */
export default async function Home() {
  const [home, about, site, all, featured] = await Promise.all([getHome(), getAbout(), getSite(), getProjects(), getProjects({ featured: true })]);
  const work = featured.length ? featured : all;
  const covers = [...(home.heroImages ?? []), ...all.map((p) => p.cover)].map(asMedia).filter((m): m is Media => !!m);
  const coverAt = (i: number) => (covers.length ? covers[i % covers.length] : null);
  const services = home.services ?? [];
  const clients = home.clients ?? [];
  const testimonials = home.testimonials ?? [];
  const firstName = site.name.split(/\s+/)[0];

  const roles = orDefault(home.audienceRoles, DEFAULT_ROLES);
  const steps = orDefault(home.process, DEFAULT_PROCESS).map((s, i) => ({ ...s, image: asMedia((s as { image?: unknown }).image) ?? coverAt(i + 1) }));
  const stats = orDefault(home.stats, DEFAULT_STATS);
  const whatsapp = site.phone && site.whatsapp ? `https://wa.me/${digits(site.phone)}` : null;
  const cta = text(site.ctaLabel, SITE_COPY.ctaLabel);
  // An emptied field hides the line rather than falling back.
  const trusted = home.trustedText == null ? COPY.trustedText : home.trustedText.trim();

  return (
    <>
      {/* ── 1. Hero ── */}
      <section className="hero dark" aria-labelledby="hero-title">
        <div className="hero-glow" aria-hidden="true" />
        <div className="wrap hero-inner">
          {!!clients.length && trusted && (
            <Reveal className="hero-proof" y={12}>{trusted.replace('{count}', String(clients.length))}</Reveal>
          )}
          <h1 className="hero-title" id="hero-title"><SplitWords text={home.headline} delay={0.1} /></h1>
          {home.intro && <Reveal delay={0.45} y={16}><p className="hero-intro">{home.intro}</p></Reveal>}
          <Reveal delay={0.6} y={16}>
            <div className="hero-cta">
              <span>{text(home.heroCtaText, COPY.heroCtaText)}</span>
              <a className="btn btn-light btn-sm" href="#contact">{cta}</a>
            </div>
          </Reveal>
          {!!clients.length && (
            <Reveal delay={0.75} y={0} className="marquee">
              {/* Repeated so the loop is seamless; only the first copy is read out. */}
              <ul className="marquee-track" aria-label="Clients">
                {[...clients, ...clients, ...clients, ...clients].map((c, i) => (
                  <li key={`${c.id}-${i}`} aria-hidden={i >= clients.length || undefined}><Icon name="spark" size={12} />{c.name}</li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>
        <div className="wrap">
          <HeroCards projects={work.slice(0, 3)} />
        </div>
      </section>

      {/* ── 2. Selected work ── */}
      <section className="work dark" id="work" aria-labelledby="work-title">
        <TiltGallery images={covers} />
        <div className="wrap section-intro">
          <ScrollWords className="h-lg" id="work-title" text={text(home.workHeading, COPY.workHeading)} />
          {home.workIntro && <Reveal><p className="lede">{home.workIntro}</p></Reveal>}
        </div>
        <CoverFlow projects={work} />
        <div className="center">
          <Link className="link-arrow" href="/work">{text(home.workLinkLabel, COPY.workLinkLabel)} <Icon name="arrow" size={15} /></Link>
        </div>
      </section>

      {/* ── 3. About me ── */}
      <AboutBanner
        greeting={`${text(home.aboutGreeting, COPY.aboutGreeting)} ${firstName}`}
        firstName={firstName}
        headline={about.headline}
        photo={about.photo}
        stats={stats}
        linkLabel={text(home.aboutLinkLabel, COPY.aboutLinkLabel)}
      />

      {/* ── 4. Who it's for ── */}
      <RoleWheel heading={text(home.rolesHeading, COPY.rolesHeading)} lead={text(home.rolesLead, COPY.rolesLead)} roles={roles} />

      {/* ── 5. How it works ── */}
      <section className="process dark" id="process" aria-labelledby="process-title">
        <div className="wrap">
          <Reveal className="section-intro">
            <p className="eyebrow">{text(home.processEyebrow, COPY.processEyebrow)}</p>
            <h2 className="h-lg" id="process-title">{text(home.processHeading, COPY.processHeading)}</h2>
          </Reveal>
          <StackCards steps={steps} ctaLabel={cta} />
        </div>
      </section>

      {/* ── 6. What I do ── */}
      {services.length > 0 && (
        <section className="pricing dark" id="services" aria-labelledby="services-title">
          <div className="streaks" aria-hidden="true"><span /><span /><span /><span /></div>
          <div className="wrap">
            <Reveal className="section-intro">
              <p className="eyebrow">{text(home.servicesEyebrow, COPY.servicesEyebrow)}</p>
              <h2 className="h-lg" id="services-title">{text(home.servicesHeading, COPY.servicesHeading)}</h2>
              {home.servicesIntro && <p className="lede">{home.servicesIntro}</p>}
            </Reveal>
            <ul className="price-grid">
              {services.map((s, i) => (
                <li key={s.id}>
                  <Reveal className="price-card" delay={i * 0.1}>
                    <div className="price-media" aria-hidden="true">{coverAt(i) && <Img media={coverAt(i)} sizes="400px" />}</div>
                    <div className="price-body">
                      <div className="price-top">
                        <h3 className="pill-tag">{s.title}</h3>
                        {s.priceFrom != null && <p className="price-amount"><small>from</small> {price(s.priceFrom, s.currency)}<small>{s.unit}</small></p>}
                      </div>
                      {s.description && <p className="price-desc">{s.description}</p>}
                      {!!s.deliverables?.length && (
                        <ul className="price-list">{s.deliverables.map((d) => <li key={d}><Icon name="check" size={14} />{d}</li>)}</ul>
                      )}
                      <ServiceLink className="btn btn-dark price-btn" service={s.title}>{cta}</ServiceLink>
                      {whatsapp && <a className="price-alt" href={whatsapp} target="_blank" rel="noopener noreferrer">Or chat on WhatsApp</a>}
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Testimonials (only once some are added in the CMS) ── */}
      {testimonials.length > 0 && (
        <section className="reviews dark" aria-labelledby="reviews-title">
          <div className="wrap">
            <Reveal className="section-intro">
              <p className="eyebrow">{text(home.testimonialsEyebrow, COPY.testimonialsEyebrow)}</p>
              <h2 className="h-lg" id="reviews-title">{text(home.testimonialsHeading, COPY.testimonialsHeading)}</h2>
            </Reveal>
            <div className="review-grid">
              {testimonials.map((t, i) => (
                <Reveal key={t.id} className={`review${i % 3 === 1 ? ' is-dark' : ''}`} delay={(i % 3) * 0.08}>
                  <figure>
                    <p className="stars" role="img" aria-label="5 out of 5">{Array.from({ length: 5 }, (_, k) => <Icon key={k} name="star" size={14} />)}</p>
                    <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
                    <figcaption>
                      {asMedia(t.photo) ? <span className="review-photo"><Img media={t.photo} sizes="40px" /></span> : <span className="review-photo">{initials(t.name)}</span>}
                      <span><b>{t.name}</b>{t.title && <small>{t.title}</small>}</span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 7. Contact ── */}
      <section className="contact-section dark" id="contact" aria-labelledby="contact-title">
        <div className="wrap contact">
          <Reveal>
            <p className="eyebrow">{text(home.contactEyebrow, COPY.contactEyebrow)}</p>
            <h2 className="h-lg" id="contact-title">{text(home.contactHeading, COPY.contactHeading)}</h2>
            {home.contactIntro && <p className="lede">{home.contactIntro}</p>}
            {site.availability && <p className="status"><span className="dot" aria-hidden="true" />{site.availability}</p>}
            <div className="contact-direct">
              <a className="btn btn-soft" href={`mailto:${site.email}`}><Icon name="mail" size={15} />{site.email}</a>
              {whatsapp && <a className="btn btn-soft" href={whatsapp} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={15} />WhatsApp</a>}
            </div>
          </Reveal>
          <Reveal delay={0.1}><ContactForm services={services.map((s) => s.title)} /></Reveal>
        </div>
      </section>
    </>
  );
}
