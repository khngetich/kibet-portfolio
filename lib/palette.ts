import sharp from 'sharp';
import type { Palette } from './paletteVars';

export type { Palette };

/**
 * Colour adaptation: a project card takes its colours from its own cover. Every image already
 * carries a 16px blurred preview (Media → blurDataURL), so the palette is read from that on the
 * server: no extra upload step, no migration, and it works for every existing image.
 *
 *   surface  the folder panel and tab: the cover's hue, kept deep (OKLCH L 0.24) so white text
 *            stays well above 4.5:1
 *   accent   the cover's most vivid colour, lifted to L 0.74 so it reads on the dark panel
 *            (hover glow, rim, case-study accents)
 *   base     the cover's average colour, shown while the image loads
 * A project's own Accent field (hex) overrides the picked hue. Greyscale covers stay neutral.
 * Server only (sharp); the CSS-variable helper for components is in ./paletteVars.
 */


type Lab = { L: number; a: number; b: number };
const lin = (c: number) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
function oklab(r: number, g: number, b: number): Lab {
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return { L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s };
}
const chroma = (p: Lab) => Math.hypot(p.a, p.b);
const hue = (p: Lab) => ((Math.atan2(p.b, p.a) * 180) / Math.PI + 360) % 360;
const f = (n: number, d = 3) => Number(n.toFixed(d));

function fromHex(hex: string): Lab | null {
  const m = hex.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1];
  return oklab(parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16));
}

function build(avg: Lab, vivid: Lab | null): Palette {
  const base = `oklch(${f(avg.L)} ${f(chroma(avg))} ${f(hue(avg), 1)})`;
  // too little colour to adapt to: keep the site's neutral folder and red glow
  if (!vivid || chroma(vivid) < 0.035) return { surface: 'oklch(0.24 0 0)', accent: 'oklch(0.66 0.2 28)', glow: 'oklch(0.66 0.2 28 / .5)', base };
  const h = f(hue(vivid), 1);
  const c = chroma(vivid);
  return {
    surface: `oklch(0.24 ${f(Math.min(c * 0.45, 0.06))} ${h})`,
    accent: `oklch(0.74 ${f(Math.min(Math.max(c, 0.09), 0.17))} ${h})`,
    glow: `oklch(0.7 ${f(Math.min(Math.max(c, 0.1), 0.2))} ${h} / .55)`,
    base,
  };
}

const memo = new Map<string, Promise<Palette | null>>();

/** The palette of a media document (or null without a preview), optionally pinned to a hex accent. */
export function paletteOf(media: unknown, accent?: string | null): Promise<Palette | null> {
  const blur = (media as { blurDataURL?: string | null } | null)?.blurDataURL;
  const pinned = accent ? fromHex(accent) : null;
  const key = `${blur ?? ''}|${accent ?? ''}`;
  if (!blur && !pinned) return Promise.resolve(null);
  if (!memo.has(key)) {
    memo.set(key, (async () => {
      if (!blur) return build(pinned!, pinned);
      try {
        const { data, info } = await sharp(Buffer.from(blur.split(',')[1] ?? '', 'base64')).removeAlpha().raw().toBuffer({ resolveWithObject: true });
        const px: Lab[] = [];
        for (let i = 0; i < data.length; i += info.channels) px.push(oklab(data[i], data[i + 1], data[i + 2]));
        if (!px.length) return null;
        const avg = px.reduce((s, p) => ({ L: s.L + p.L / px.length, a: s.a + p.a / px.length, b: s.b + p.b / px.length }), { L: 0, a: 0, b: 0 });
        // The hue that covers the most of the cover, weighted by how vivid each pixel is (a
        // small logo mark shouldn't outvote a navy background); then that hue's most vivid pixel,
        // favouring mid lightness over highlights and deep shadow.
        const score = (p: Lab) => chroma(p) * (1 - Math.abs(p.L - 0.6));
        const buckets = new Map<number, { weight: number; best: Lab }>();
        for (const p of px) {
          if (chroma(p) < 0.03) continue;
          const k = Math.round(hue(p) / 30) % 12;
          const b = buckets.get(k) ?? { weight: 0, best: p };
          b.weight += chroma(p);
          if (score(p) > score(b.best)) b.best = p;
          buckets.set(k, b);
        }
        const top = [...buckets.values()].sort((x, y) => y.weight - x.weight)[0];
        const vivid = top?.best ?? null;
        return build(avg, pinned ?? vivid);
      } catch {
        return pinned ? build(pinned, pinned) : null;
      }
    })());
    if (memo.size > 2000) memo.delete(memo.keys().next().value!);
  }
  return memo.get(key)!;
}
