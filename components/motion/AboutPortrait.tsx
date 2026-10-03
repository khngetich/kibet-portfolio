'use client';

import Link from 'next/link';
import { useInView } from 'motion/react';
import { useRef, useState, type ReactNode } from 'react';
import { Icon } from '@/components/Icon';
import { AboutFolder, ProofPrint, type AboutTab } from './AboutEditorial';

/**
 * About, as a portrait with personality, on the proof-sheet look: the photo is a tilted print
 * (crop marks, colour bar, "Proof" label) with sticker labels stuck on its edges, and (with a
 * second photo) a "Change the mood" switch that cross-fades between the two. On the right: the
 * label, a two-line heading with the accent, a short intro and a link, then the folder with the
 * section's tabs (figures, a numbered list, stamped notes). The stickers are plain text, so they
 * read in order for screen readers.
 */
export function AboutPortrait({ id, headingId, chapter, heading, intro, photo, moodPhoto, stickers, caption, link, name, tabs }: {
  id?: string; headingId: string; chapter?: ReactNode; heading: ReactNode; intro?: string | null;
  photo: unknown; moodPhoto?: unknown; stickers: string[]; caption?: string | null; link?: { label: string; url: string } | null;
  name: string; tabs: AboutTab[];
}) {
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { once: true, margin: '0px 0px -20% 0px' });
  const [mood, setMood] = useState(false);
  const [top, ...rest] = stickers;
  return (
    <section ref={ref} className={`about-pt about-ed${seen ? ' is-seen' : ''}`} id={id} aria-labelledby={headingId}>
      <div className="wrap about-ed-grid">
        <div className="about-proof">
          <ProofPrint photo={photo} moodPhoto={moodPhoto} mood={mood} name={name}>
            {top && <span className="about-sticker is-top"><Icon name="spark" size={13} />{top}</span>}
            {rest.map((s, i) => <span key={s} className={`about-sticker is-${i === 0 ? 'bottom' : 'side'}`}>{s}</span>)}
          </ProofPrint>
          {!!moodPhoto && (
            <button type="button" className="about-mood" aria-pressed={mood} onClick={() => setMood((v) => !v)}>
              <span className="about-mood-switch" aria-hidden="true"><i /></span>
              Change the mood
            </button>
          )}
          {caption && <p className="about-pt-caption">{caption}</p>}
        </div>
        <div className="about-ed-right">
          {chapter}
          <h2 className="h-xl about-pt-heading" id={headingId}>{heading}</h2>
          {/* the intro is written to follow "Hi, I'm Name," (the banner layout); here it stands alone */}
          {intro && <p className="lede">{intro.charAt(0).toUpperCase() + intro.slice(1)}</p>}
          {link && <Link className="link-under" href={link.url}>{link.label} <Icon name="arrow" size={14} /></Link>}
          {!!tabs.length && <AboutFolder tabs={tabs} seen={seen} />}
        </div>
      </div>
    </section>
  );
}
