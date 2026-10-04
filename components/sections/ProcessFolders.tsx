import './process.css';
import type { CSSProperties } from 'react';
import localFont from 'next/font/local';
import { Reveal } from '@/components/motion/Reveal';
import { ProcessArt } from './ProcessArt';

// the handwriting for the margin notes: Caveat Medium (SIL Open Font License), cut down to basic
// Latin and a few punctuation marks (17 KB instead of Google's 50 KB), and not preloaded, so it
// only downloads where a note shows
const hand = localFont({ src: './fonts/caveat-500-latin.woff2', weight: '500', variable: '--font-hand', display: 'swap', preload: false });

export type FolderStep = { id?: string | null; title: string; description?: string | null; points?: string[] | null; duration?: string | null; };

// a hue per step, as on the reference's pastel folders; the text takes the hue deepened towards ink
const HUES = ['#FF6A2B', '#5B8DEF', '#A78BFA', '#E8352B', '#2BB673', '#F5B83D'];
// the scribbled arrow points towards the card, so the left column's notes point right and vice versa
const TILT = [-6, 5, -4, 6, -5, 4];

/**
 * The process as folder cards: each step is a white card with "Step 1" in the corner, a vector
 * scene of what happens in that step (components/sections/ProcessArt.tsx) rising out of a folder
 * in the step's hue, and a frosted glass front (tab, title, a rule,
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
              <span className="pfx-back" aria-hidden="true" />
              <div className="pfx-art" aria-hidden="true">
                <ProcessArt index={i} />
              </div>
              <div className="pfx-folder">
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
