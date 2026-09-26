'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Icon, type IconName } from './Icon';

/**
 * A state icon that cross-fades when it changes (hide → show, collapse → expand): opacity,
 * scale 0.25 → 1 and blur 4px → 0 on a bounce-free spring. `initial={false}` keeps it still on
 * first render. With reduced motion (OS setting) it is a plain opacity cross-fade.
 */
export function IconSwap({ a, b, show, size = 16, weight }: { a: IconName; b: IconName; show: 'a' | 'b'; size?: number; weight?: 'regular' | 'semibold' }) {
  const name = show === 'a' ? a : b;
  const hidden = useReducedMotion() ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: 'blur(4px)' };
  return (
    <span className="ui-swap" aria-hidden="true">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={name}
          initial={hidden}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={hidden}
          transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
        >
          <Icon name={name} size={size} weight={weight} />
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
