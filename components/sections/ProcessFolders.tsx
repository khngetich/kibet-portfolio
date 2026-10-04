import './process.css';
import type { CSSProperties } from 'react';
import localFont from 'next/font/local';
import type { Media } from '@/payload-types';
import { Icon, type IconName } from '@/components/Icon';
import { Img } from '@/components/Img';
import { Reveal } from '@/components/motion/Reveal';

// the handwriting for the margin notes: Caveat Medium (SIL Open Font License), cut down to basic
// Latin and a few punctuation marks (17 KB instead of Google's 50 KB), and not preloaded, so it
// only downloads where a note shows
const hand = localFont({ src: './fonts/caveat-500-latin.woff2', weight: '500', variable: '--font-hand', display: 'swap', preload: false });

export type FolderStep = { id?: string | null; title: string; description?: string | null; points?: string[] | null; duration?: string | null; icon?: string | null; image?: Media | null };

// a hue per step, as on the reference's pastel folders; the text takes the hue deepened towards ink
const HUES = ['#FF6A2B', '#5B8DEF', '#A78BFA', '#E8352B', '#2BB673', '#F5B83D'];
const ICONS: IconName[] = ['compass', 'pen', 'chat', 'rocket'];
// the scribbled arrow points towards the card, so the left column's notes point right and vice versa
const TILT = [-6, 5, -4, 6, -5, 4];

/**
 * The process as folder cards: each step is a white card with "Step 1" in the corner, a tilted
 * print of real work with the step's icon pinned to it, and a pastel folder (tab, title, a rule,
 * the description) in front. How long the step takes is scribbled in the margin beside the card
 * with a hand-drawn arrow, as on a printed proof someone's annotated. Two to a row on wide
 * screens; on phones the note sits above its card.
 */
export function ProcessFolders({ steps }: { steps: FolderStep[] }) {
  return (
    <ol className={`pfx ${hand.variable}`}>
      {steps.map((step, i) => (
        <li key={step.id ?? i} className={`pfx-step${i % 2 ? ' is-right' : ''}`} style={{ '--h': HUES[i % HUES.length], '--t': `${TILT[i % TILT.length]}deg` } as CSSProperties}>
          <Reveal y={18} delay={(i % 2) * 0.1}>
            {step.duration && (
              <p className="pfx-note">
                <span className="sr-only">Takes </span>{step.duration}
                <svg className="pfx-squiggle" viewBox="0 0 40 20" aria-hidden="true" focusable="false"><path d="M2 14C8 4 18 2 26 8s8 8 12 3M31 6l7 5-8 2" /></svg>
              </p>
            )}
            <div className="pfx-card">
              <p className="pfx-num">Step {i + 1}</p>
              <div className="pfx-art" aria-hidden="true">
                {step.image && <span className="pfx-print"><Img media={step.image} sizes="220px" /></span>}
                <span className="pfx-badge"><Icon name={(step.icon as IconName) || ICONS[i % ICONS.length]} size={20} /></span>
              </div>
              <div className="pfx-folder">
                <svg className="pfx-tab" viewBox="0 0 200 28" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 28V12Q0 0 12 0H120C134 0 140 6 147 14S160 28 176 28Z" /></svg>
                <h3 className="pfx-title">{step.title}</h3>
                {step.description && <p className="pfx-desc">{step.description}</p>}
                {!!step.points?.length && <ul className="pfx-points">{step.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>}
              </div>
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
