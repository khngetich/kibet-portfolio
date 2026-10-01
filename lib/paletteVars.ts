/** A project's cover palette (computed on the server by ./palette). */
export type Palette = { surface: string; accent: string; glow: string; base: string };

/** The palette as CSS custom properties for a card's style attribute (safe in client components). */
export const paletteVars = (p?: Palette | null) =>
  p ? ({ '--pc-surface': p.surface, '--pc-accent': p.accent, '--pc-glow': p.glow, '--pc-base': p.base } as React.CSSProperties) : undefined;
