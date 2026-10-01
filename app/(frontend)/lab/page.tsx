import type { Metadata } from 'next';
import { getSite } from '@/lib/cms';
import { PosterLab } from '@/components/PosterLab';

const host = () => { try { return new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost').host; } catch { return ''; } };

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: 'Poster Lab',
    description: `Type a line and set it as a poster in one of ${site.name}’s layouts. Free to download.`,
    alternates: { canonical: '/lab' },
  };
}

/** A small interactive: visitors set their own line in the studio's poster layouts (components/PosterLab.tsx). */
export default async function LabPage() {
  const site = await getSite();
  return (
    <section className="page-head-section lab-section">
      <div className="wrap">
        <header className="page-head">
          <p className="eyebrow">Poster Lab</p>
          <h1 className="h-xl">Set your words like a poster.</h1>
          <p className="lede">Type a line, pick a layout and the inks. It’s set on the spot, the way I’d start a campaign poster, and you can keep it.</p>
        </header>
        <PosterLab studio={site.name} host={host()} />
      </div>
    </section>
  );
}
