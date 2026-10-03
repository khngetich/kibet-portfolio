'use client';

import { useReducedMotionConfig } from 'motion/react';
import { useSyncExternalStore } from 'react';

const noop = () => () => {};

/**
 * True when motion should stop (the visitor's reduced-motion setting, or Styles → Motion off via
 * MotionConfig), but only after hydration. The server can't know the setting, so the first browser
 * render must match it; branching on the raw value during that render breaks hydration.
 */
export function useStill() {
  const reduce = useReducedMotionConfig();
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  return hydrated && !!reduce;
}
