import './contact-page.css';
import type { ReactNode } from 'react';
import type { Site } from '@/payload-types';
import { Accent } from '@/components/Accent';
import { NameCursor } from '@/components/Highlight';
import { Icon } from '@/components/Icon';
import { Reveal } from '@/components/motion/Reveal';
import { SOCIAL_LABEL, socialIcon } from '@/lib/socials';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';

// what happens after someone hits send; the reply time matches the form's own promise
const NEXT = [
  { title: 'You send the brief', text: 'A few lines is plenty: what it is, who it’s for and when it’s due. Rough is fine.' },
  { title: 'I reply within a working day', text: 'With questions, a first idea or two, and an honest “yes, I’m your person” (or who is).' },
  { title: 'We plan it together', text: 'Scope, timeline and price agreed up front, before a single pixel moves.' },
];

/**
 * The contact page: the Contact section when it opens a page. A browser window on a glowing
 * card, as if we're already in a shared file: two cursors ("You" and the designer's name)
 * hover round the headline, whose accent is "selected". Under it, the form beside the quicker
 * ways to reach out, and what happens next as three small folders.
 */
export function ContactPage({ heading, hid, eyebrow, intro, site, form, whatsapp, bookingUrl, bookLabel }: {
  heading?: string | null; hid: string; eyebrow?: string | null; intro?: string | null; site: Site; form: ReactNode;
  whatsapp?: string | null; bookingUrl?: string | null; bookLabel: string;
}) {
  const host = new URL(SERVER_URL).host.replace(/^www\./, '');
  const first = (site.name ?? '').split(' ')[0] || 'Me';
  const initials = (site.name ?? '').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const socials = (site.socials ?? []).filter((s) => s.url);
  return (
    <section className="cpg" aria-labelledby={hid}>
      <div className="wrap">
        <div className="cpg-glow">
          <div className="cpg-win">
            <div className="cpg-bar" aria-hidden="true">
              <span className="cpg-dots"><i /><i /><i /></span>
              <span className="cpg-url"><Icon name="lock" size={12} />{host}/contact</span>
            </div>
            <div className="cpg-canvas">
              <p className="cpg-people" aria-hidden="true">
                <span className="cpg-avatar is-me">{initials}</span>
                <span className="cpg-avatar is-you"><Icon name="plus" size={14} /></span>
              </p>
              {eyebrow && <p className="eyebrow cpg-eyebrow">{eyebrow}</p>}
              <div className="cpg-head">
                <h1 className="h-xl cpg-title" id={hid}><Accent text={heading} highlight /></h1>
                <NameCursor name="You" tone="green" className="cpg-cur is-you" />
                <NameCursor name={first} tone="red" side="left" className="cpg-cur is-me" />
              </div>
            </div>
          </div>
          <div className="cpg-caption">
            {intro && <p className="cpg-intro">{intro}</p>}
            {site.availability && <p className="status cpg-status"><span className="dot" aria-hidden="true" />{site.availability}</p>}
          </div>
        </div>

        <div className="cpg-grid">
          <Reveal className="cpg-form">{form}</Reveal>
          <Reveal className="cpg-aside" delay={0.1}>
            <h2 className="cpg-kicker">Rather skip the form?</h2>
            <ul className="cpg-ways">
              {site.email && (
                <li><a className="cpg-way" href={`mailto:${site.email}`}><span className="cpg-way-ic"><Icon name="mail" size={18} /></span><span><b>Email</b><small>{site.email}</small></span><Icon name="arrow" size={15} /></a></li>
              )}
              {whatsapp && (
                <li><a className="cpg-way is-wa" href={whatsapp} target="_blank" rel="noopener noreferrer"><span className="cpg-way-ic"><Icon name="whatsapp" size={18} /></span><span><b>WhatsApp</b><small>Voice notes welcome</small></span><Icon name="arrow" size={15} /></a></li>
              )}
              {bookingUrl && (
                <li><a className="cpg-way" href={bookingUrl} target="_blank" rel="noopener noreferrer"><span className="cpg-way-ic"><Icon name="calendar" size={18} /></span><span><b>{bookLabel}</b><small>Pick a time that suits you</small></span><Icon name="arrow" size={15} /></a></li>
              )}
            </ul>
            {!!socials.length && (
              <ul className="cpg-socials" aria-label="Social profiles">
                {socials.map((s) => (
                  <li key={s.id ?? s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={SOCIAL_LABEL[s.platform] ?? s.platform}><Icon name={socialIcon(s.platform)} size={18} /></a></li>
                ))}
              </ul>
            )}
            <h2 className="cpg-kicker cpg-next-title">What happens next</h2>
            <ol className="cpg-next">
              {NEXT.map((n, i) => (
                <li key={n.title} className="cpg-step" style={{ '--h': ['#FF6A2B', '#5B8DEF', '#A78BFA'][i] } as React.CSSProperties}>
                  <span className="cpg-step-n">{i + 1}</span>
                  <span><b>{n.title}</b><small>{n.text}</small></span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
