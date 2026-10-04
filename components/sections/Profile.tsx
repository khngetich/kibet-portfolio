import './profile.css';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { RichText } from '@payloadcms/richtext-lexical/react';
import type { Page, Site } from '@/payload-types';
import { asMedia } from '@/lib/cms';
import { Accent } from '@/components/Accent';
import { Icon } from '@/components/Icon';
import { Img } from '@/components/Img';

type Block = Extract<NonNullable<Page['sections']>[number], { blockType: 'profile' }>;

const BUTTON: Record<string, string> = { light: 'btn-light', dark: 'btn-dark', accent: 'btn-accent', outline: 'btn-outline', ghost: 'btn-ghost' };
const btn = (variant: string | null | undefined, fallback: string) => `btn ${(variant && BUTTON[variant]) || fallback}`;

// sticker and tag colours, cycled; text is the same hue deepened towards ink, as on printed stickers
const HUES = ['#FF6A2B', '#F5B83D', '#E8352B', '#F7A8C4', '#5B8DEF', '#C6F432', '#A78BFA'];
const hue = (i: number) => ({ '--h': HUES[i % HUES.length] }) as CSSProperties;
// a lean, a lift and an overlap per sticker, so the pile looks dropped rather than set
const TILT = [-7, 4, -3, 6, -5, 3, -2, 5];

// the two-letter marks design tools use for themselves; anything else gets its first letters
const MARKS: Record<string, string> = {
  illustrator: 'Ai', photoshop: 'Ps', indesign: 'Id', 'premiere pro': 'Pr', premiere: 'Pr', 'after effects': 'Ae',
  lightroom: 'Lr', xd: 'Xd', figma: 'Fg', canva: 'Cv', blender: 'Bl', procreate: 'Pc', 'davinci resolve': 'Dr', framer: 'Fr', webflow: 'Wf',
};
const mark = (tool: string) => MARKS[tool.trim().toLowerCase()] ?? tool.replace(/[^A-Za-z]/g, '').slice(0, 2).replace(/^./, (c) => c.toUpperCase());

/**
 * The About page, as a hello. A portrait card on grid paper with chips floating around it (role,
 * place, availability) and thin connector lines drawn across the page; the story; what you're good
 * at as a pile of tilted stickers; the tools as notched tags; and the experience on a dial, the
 * current role in the dark pill. Every part comes from the Profile section and Site settings, and
 * a part with nothing in it is left out.
 */
export function ProfileSection({ s, site, id, first }: { s: Block; site: Site; id?: string; first: boolean }) {
  const cv = asMedia(s.cv);
  const photo = asMedia(s.photo);
  const Heading = first ? 'h1' : 'h2';
  const skills = (s.skills ?? []).filter(Boolean);
  const tools = (s.tools ?? []).filter(Boolean);
  const jobs = s.experience ?? [];
  const role = jobs[0]?.role || site.role;
  const cta = s.button?.label && s.button?.url ? s.button : null;

  return (
    <div className="pf" id={id}>
      {/* ── hello: headline, portrait card, floating chips ── */}
      <section className="pf-hello" aria-labelledby="pf-title">
        {/* thin connector lines across the page, each ending in a dot (the dots are HTML, so the
            stretched SVG doesn't squash them into ovals) */}
        <svg className="pf-lines" viewBox="0 0 1200 640" preserveAspectRatio="none" aria-hidden="true">
          <path pathLength={1} d="M-20 560 C 140 560, 250 600, 268 500 S 270 430, 270 420" />
          <path pathLength={1} d="M800 330 C 960 330, 1010 360, 1040 470 S 1120 600, 1220 600" />
        </svg>
        <span className="pf-dot is-a" aria-hidden="true" />
        <span className="pf-dot is-b" aria-hidden="true" />
        <div className="wrap pf-hello-grid">
          <div className="pf-hello-copy">
            {s.eyebrow && <p className="eyebrow">{s.eyebrow}</p>}
            <Heading className="h-xl pf-title" id="pf-title"><Accent text={s.heading} /></Heading>
            {(cta || cv?.url) && (
              <div className="pf-ctas">
                {cta && <Link className={btn(cta.variant, 'btn-dark')} href={cta.url!}>{cta.label} <Icon name="arrow" size={15} /></Link>}
                {cv?.url && <a className="btn btn-soft" href={cv.url} download><Icon name="download" size={15} />Download CV</a>}
              </div>
            )}
          </div>
          <figure className="pf-card">
            <span className="pf-aura" aria-hidden="true" />
            <span className="pf-card-photo">{photo ? <Img media={photo} sizes="(max-width: 760px) 80vw, 380px" preload={first} /> : <span className="pf-card-blank">{site.name}</span>}</span>
            <span className="pf-badge" aria-hidden="true"><Icon name="spark" size={26} /></span>
            <figcaption className="pf-chips">
              {role && <span className="pf-chip is-role" style={hue(1)}>{role}</span>}
              {site.availability && <span className="pf-chip is-open"><i aria-hidden="true" />{site.availability}</span>}
              {site.location && <span className="pf-chip is-place" style={hue(3)}><svg className="pf-pointer" viewBox="0 0 16 16" aria-hidden="true"><path d="M1 1l14 5-6 2-2 6z" /></svg>{site.location}</span>}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── the story ── */}
      {s.body && (
        <section className="wrap pf-story" aria-labelledby="pf-story-title">
          <h2 className="pf-kicker" id="pf-story-title">The story</h2>
          <RichText data={s.body} className="prose pf-prose" />
        </section>
      )}

      {/* ── what I'm good at: a pile of stickers ── */}
      {!!skills.length && (
        <section className="wrap pf-skills" aria-labelledby="pf-skills-title">
          <h2 className="pf-kicker" id="pf-skills-title">What I’m good at</h2>
          <ul className="pf-pile">
            {skills.map((k, i) => (
              <li key={k} className="pf-sticker" style={{ ...hue(i), '--tilt': `${TILT[i % TILT.length]}deg`, '--n': i } as CSSProperties}>{k}</li>
            ))}
          </ul>
        </section>
      )}

      {/* ── tools: notched tags ── */}
      {!!tools.length && (
        <section className="wrap pf-tools" aria-labelledby="pf-tools-title">
          <h2 className="pf-kicker" id="pf-tools-title">Tools of the trade</h2>
          <ul className="pf-tags">
            {tools.map((t, i) => (
              <li key={t} className="pf-tag" style={hue(i + 2)}>
                <span className="pf-tag-mark" aria-hidden="true">{mark(t)}</span>
                <span className="pf-tag-label">{t}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── experience: a dial, the current role in the pill ── */}
      {!!jobs.length && (
        <section className="pf-dial band-dark" aria-labelledby="pf-dial-title">
          <div className="wrap pf-dial-grid">
            <div>
              <h2 className="pf-kicker" id="pf-dial-title">Experience</h2>
              <p className="h-lg pf-dial-line"><Accent text="Doing it *daily*." /></p>
            </div>
            <div className="pf-wheel">
              <span className="pf-ring" aria-hidden="true" /><span className="pf-ring is-2" aria-hidden="true" /><span className="pf-ring is-3" aria-hidden="true" />
              <ol>
                {jobs.map((j, i) => (
                  <li key={j.id ?? i} className={i === 0 ? 'is-now' : undefined} style={{ '--k': i } as CSSProperties}>
                    {j.years && <span className="pf-years">{j.years}</span>}
                    <span className="pf-job"><b>{j.role}</b>{j.company && <span>{j.company}</span>}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
