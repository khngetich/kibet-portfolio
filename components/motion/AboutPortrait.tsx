'use client';

import { useInView } from 'motion/react';
import { useRef, useState, type ReactNode } from 'react';
import { Icon } from '@/components/Icon';
import { AboutFolder, AboutHead, ProofPrint, type AboutTab } from './AboutEditorial';

/**
 * About, as a portrait with personality, on the proof-sheet look: the photo is a tilted print
 * (crop marks, colour bar, "Proof" label) with sticker labels stuck on its edges, and (with a
 * second photo) a "Change the mood" switch that cross-fades between the two. Beside the print:
 * the label, a two-line heading with the accent, a short intro and a link; below both, across the
 * full width, the folder with the section's tabs (figures, a numbered list, stamped notes). The
 * stickers are plain text, so they read in order for screen readers.
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
        <AboutHead chapter={chapter} headingId={headingId} heading={heading} intro={intro} link={link} />
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
        {!!tabs.length && <div className="about-ed-folder"><AboutFolder tabs={tabs} seen={seen} /></div>}
      </div>
    </section>
  );
}
