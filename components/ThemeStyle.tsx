import type { Theme } from '@/payload-types';

/**
 * Turns the Styles global (Website → Styles) into CSS variables on :root. The stylesheets
 * read these variables, with today's design as the fallback, so an empty or partial Styles
 * document leaves the site exactly as designed.
 *
 * Colours feed the two themes (globals.css): the "dark" fields become --dark-*, the "light"
 * fields --light-*, and each theme maps them onto the working tokens. Manrope and Geist are
 * self-hosted by next/font (app/(frontend)/layout.tsx); other choices load from Google Fonts.
 */

const GOOGLE: Record<string, string> = {
  Inter: 'Inter:wght@300..700',
  Manrope: 'Manrope:wght@300..700',
  'DM Sans': 'DM+Sans:wght@300..700',
  'Space Grotesk': 'Space+Grotesk:wght@300..700',
  'Plus Jakarta Sans': 'Plus+Jakarta+Sans:wght@300..700',
  Sora: 'Sora:wght@300..700',
  Outfit: 'Outfit:wght@300..700',
  'Instrument Serif': 'Instrument+Serif',
  'Playfair Display': 'Playfair+Display:wght@400..700',
  Fraunces: 'Fraunces:wght@300..700',
  'DM Serif Display': 'DM+Serif+Display',
};

const SELF_HOSTED: Record<string, string> = { Geist: 'var(--font-geist-sans)', Manrope: 'var(--font-manrope)' };
const stack = (f?: string | null) => (!f ? undefined : SELF_HOSTED[f] ? `${SELF_HOSTED[f]}, "${f}", "Helvetica Neue", Helvetica, Arial, sans-serif` : `"${f}", var(--font-manrope), sans-serif`);
const radius = { pill: '999px', rounded: '12px', square: '4px' } as const;

export function themeVars(t: Partial<Theme>): Record<string, string> {
  const v: Record<string, string | undefined> = {
    '--dark-bg': t.background ?? undefined,
    '--dark-surface': t.surface ?? undefined,
    '--dark-ink': t.text ?? undefined,
    '--dark-ink-2': t.mutedText ?? undefined,
    '--red': t.accent ?? undefined,
    '--red-2': t.accent2 ?? undefined,
    '--light-bg': t.lightBackground ?? undefined,
    '--light-surface': t.lightSurface ?? undefined,
    '--light-ink': t.lightText ?? undefined,
    '--glow': t.glow === false ? '0' : undefined,
    '--font': stack(t.bodyFont),
    '--font-heading': stack(t.headingFont),
    '--heading-weight': t.headingWeight ?? undefined,
    '--heading-tracking': t.headingTracking != null ? `${t.headingTracking / 100}em` : undefined,
    '--base-scale': t.baseSize ? String(t.baseSize / 16) : undefined,
    // primary buttons: "button background/text" on the dark theme, "dark button" on the light one
    '--btn-light-bg': t.buttonBackground ?? undefined,
    '--btn-light-ink': t.buttonText ?? undefined,
    '--btn-dark-bg': t.buttonDarkBackground ?? undefined,
    '--btn-radius': t.buttonShape ? radius[t.buttonShape] : undefined,
    '--btn-h': t.buttonHeight ? `${t.buttonHeight}px` : undefined,
    '--radius-scale': t.radius != null ? String(t.radius / 100) : undefined,
    '--space': t.spacing != null ? String(t.spacing / 100) : undefined,
    '--container': t.container ? `${t.container}px` : undefined,
  };
  return Object.fromEntries(Object.entries(v).filter((e): e is [string, string] => e[1] != null && e[1] !== ''));
}

export function ThemeStyle({ theme }: { theme: Partial<Theme> }) {
  const vars = themeVars(theme);
  const css = `:root{${Object.entries(vars).map(([k, val]) => `${k}:${val}`).join(';')}}`;
  const fonts = [...new Set<string | null | undefined>([theme.headingFont, theme.bodyFont])].filter((f): f is string => !!f && f in GOOGLE && !(f in SELF_HOSTED));
  return (
    <>
      {fonts.length > 0 && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link rel="stylesheet" precedence="default" href={`https://fonts.googleapis.com/css2?${fonts.map((f) => `family=${GOOGLE[f]}`).join('&')}&display=swap`} />
        </>
      )}
      <style id="theme-vars" dangerouslySetInnerHTML={{ __html: css }} />
    </>
  );
}
