'use client';

import type { ComponentProps, PointerEvent } from 'react';

/**
 * A list whose cards light up under the pointer: it writes the pointer's position inside the
 * card it's over as --mx / --my, and the card's CSS draws a soft spotlight there. Mouse only; on
 * touch and with nothing hovered the cards simply show without it.
 */
export function Spotlight({ children, ...props }: ComponentProps<'ul'>) {
  const move = (e: PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== 'mouse') return;
    const card = (e.target as HTMLElement).closest<HTMLElement>('.svb-card');
    if (!card || !e.currentTarget.contains(card)) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return <ul {...props} onPointerMove={move}>{children}</ul>;
}
