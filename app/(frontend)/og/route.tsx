import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getSite } from '@/lib/cms';

/**
 * Share card for any page that has no image of its own and no site default: the page title set
 * large in the studio's type, on the site's black, with its colour bar. Used by the metadata
 * helpers as /og?title=…&kicker=…, so links shared on WhatsApp, LinkedIn or X always preview.
 */

const fonts = (async () => {
  const dir = join(process.cwd(), 'node_modules/geist/dist/fonts');
  const [bold, medium, mono] = await Promise.all([
    readFile(join(dir, 'geist-sans/Geist-Bold.ttf')),
    readFile(join(dir, 'geist-sans/Geist-Medium.ttf')),
    readFile(join(dir, 'geist-mono/GeistMono-Medium.ttf')),
  ]);
  return [
    { name: 'Geist', data: bold, weight: 700 as const, style: 'normal' as const },
    { name: 'Geist', data: medium, weight: 500 as const, style: 'normal' as const },
    { name: 'Geist Mono', data: mono, weight: 500 as const, style: 'normal' as const },
  ];
})();

const BAR = ['#00AEEF', '#EC008C', '#FFF200', '#F5F5F4', '#7A7A7A', '#E8352B'];

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const site = await getSite();
  const title = (q.get('title') || site.role || site.name).slice(0, 90);
  const kicker = (q.get('kicker') || site.studio || '').slice(0, 40);
  const host = (() => { try { return new URL(process.env.NEXT_PUBLIC_SERVER_URL || '').host; } catch { return ''; } })();

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, background: '#0A0A0A', color: '#F5F5F4', fontFamily: 'Geist' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Geist Mono', fontSize: 24, letterSpacing: 3, textTransform: 'uppercase', color: '#A3A3A0' }}>
          <span>{site.name}</span>
          <span>{kicker}</span>
        </div>
        <div style={{ display: 'flex', fontSize: title.length > 48 ? 76 : 96, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3.5, maxWidth: 1000 }}>{title}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 26, fontWeight: 500, color: '#D4D4D2' }}>
            <div style={{ width: 56, height: 8, background: '#E8352B' }} />
            {host || site.role}
          </div>
          <div style={{ display: 'flex' }}>{BAR.map((c) => <div key={c} style={{ width: 34, height: 18, background: c }} />)}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: await fonts, headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' } },
  );
}
