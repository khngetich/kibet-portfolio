'use client';

import { MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';

/** Applies Styles → Motion: “Off” turns every animation into its end state; otherwise the visitor's own setting wins. */
export function MotionPrefs({ motion, children }: { motion?: string | null; children: ReactNode }) {
  return <MotionConfig reducedMotion={motion === 'off' ? 'always' : 'user'}>{children}</MotionConfig>;
}
