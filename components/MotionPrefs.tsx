'use client';

import { LazyMotion, MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';

const features = () => import('./motion/features').then((mod) => mod.default);

/**
 * Applies Styles → Motion: “Off” turns every animation into its end state; otherwise the visitor's
 * own setting wins.
 *
 * Also loads the animation engine lazily: components use the light `m` elements (imported as
 * `import { m as motion } from 'motion/react'`), and the engine arrives after the page. `strict`
 * makes a stray full `motion` import inside the site throw in development, so the bundle stays lean.
 */
export function MotionPrefs({ motion, children }: { motion?: string | null; children: ReactNode }) {
  return (
    <LazyMotion features={features} strict>
      <MotionConfig reducedMotion={motion === 'off' ? 'always' : 'user'}>{children}</MotionConfig>
    </LazyMotion>
  );
}
