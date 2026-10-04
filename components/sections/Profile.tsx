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
// "Brief first, pixels second" → ["Brief first,", "pixels second"]: the title's first half in ink, the rest muted
const split = (title: string): [string, string] => {
  const at = title.search(/[,:;.–—]\s/);
  if (at > 0) return [title.slice(0, at + 1), title.slice(at + 2)];
  const words = title.split(' ');
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(' '), words.slice(half).join(' ')];
};
const mark = (tool: string) => MARKS[tool.trim().toLowerCase()] ?? tool.replace(/[^A-Za-z]/g, '').slice(0, 2).replace(/^./, (c) => c.toUpperCase());

/**
 * The About page, as a hello. A portrait card on grid paper; the story; how I like to work; what you're good
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
  const principles = (s.principles ?? []).filter((p) => p.title);
  const jobs = s.experience ?? [];
  const cta = s.button?.label && s.button?.url ? s.button : null;

  return (
    <div className="pf" id={id}>
      {/* ── hello: headline and portrait card ── */}
      <section className="pf-hello" aria-labelledby="pf-title">
        <div className="wrap pf-hello-grid">
          <div className="pf-hello-copy">
            {s.eyebrow && <p className="eyebrow">{s.eyebrow}</p>}
            <Heading className="h-xl pf-title" id="pf-title"><Accent text={s.heading} highlight={first} /></Heading>
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

      {/* ── how I work: cards with a two-tone title (the first half in ink, the rest muted) ── */}
      {!!principles.length && (
        <section className="wrap pf-ways" aria-labelledby="pf-ways-title">
          <h2 className="h-lg pf-ways-title" id="pf-ways-title"><Accent text={s.principlesHeading || 'How I like to *work*'} /></h2>
          <ol className="pf-ways-grid">
            {principles.map((p, i) => {
              const [lead, rest] = split(p.title);
              return (
                <li key={p.id ?? i} className="pf-way">
                  <span className="pf-way-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="pf-way-title">{lead}{rest && <> <span>{rest}</span></>}</h3>
                  {p.text && <p className="pf-way-text">{p.text}</p>}
                </li>
              );
            })}
          </ol>
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
            <div className="pf-wheel" style={{ '--n': jobs.length } as CSSProperties}>
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
