import type { Metadata } from 'next';
import { getPosts, getSite } from '@/lib/cms';
import { PostCard } from '@/components/PostCard';

/** Every published insight, newest first. Single articles live at /insights/[slug]. */

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return { title: 'Insights', description: `Design notes and ideas from ${site.name}.` };
}

export default async function InsightsIndex() {
  const posts = await getPosts();
  return (
    <section className="insights-index dark" aria-labelledby="insights-title">
      <div className="wrap">
        <header className="insights-index-head">
          <p className="eyebrow">Insights</p>
          <h1 className="h-xl" id="insights-title">Insights &amp; ideas</h1>
          <p className="lede">Notes on design, branding and how the work gets made.</p>
        </header>
        {posts.length ? (
          <ul className="post-grid">
            {posts.map((p) => <li key={p.id}><PostCard post={p} headingLevel={2} /></li>)}
          </ul>
        ) : (
          <p className="insights-empty">The first article is on its way.</p>
        )}
      </div>
    </section>
  );
}
