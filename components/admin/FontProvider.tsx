import type { ReactNode } from 'react';
import { Manrope } from 'next/font/google';

const manrope = Manrope({ subsets: ['latin'], display: 'swap' });

/**
 * The public site's type in the admin: Manrope for everything (the same next/font load as
 * app/(frontend)/layout.tsx, self-hosted at build time). Payload owns the admin's <html>, so the
 * family is handed to the stylesheet as --font-manrope on :root, where pop-ups and drawers
 * rendered outside this tree still see it. The serif accent (Georgia) is a system font.
 */
export function FontProvider({ children }: { children?: ReactNode }) {
  return (
    <>
      <style href="cms-font" precedence="default">{`:root{--font-manrope:${manrope.style.fontFamily}}`}</style>
      {children}
    </>
  );
}
