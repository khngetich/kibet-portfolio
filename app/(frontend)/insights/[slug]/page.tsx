import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { asMedia, getPost, getPosts, getPostSlugs } from '@/lib/cms';
import { Img } from '@/components/Img';
import { Icon } from '@/components/Icon';
import { PostCard, postDate } from '@/components/PostCard';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPostSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  const og = asMedia(post.cover);
  return {
    title: post.metaTitle || post.title,
    description: post.excerpt,
    openGraph: { type: 'article', title: post.metaTitle || post.title, description: post.excerpt, publishedTime: post.publishedAt ?? undefined, images: og?.url ? [{ url: og.url, width: og.width ?? undefined, height: og.height ?? undefined, alt: og.alt }] : undefined },
  };
}

/** One insight: title, date and tags, the cover, the article, then two more to read. */
export default async function InsightPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const more = (await getPosts(4)).filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <article className="post dark">
      <div className="wrap post-wrap">
        <Link className="post-back" href="/insights"><Icon name="left" size={14} /> All insights</Link>
        <header className="post-head">
          <p className="post-meta">
            {post.publishedAt && <time dateTime={post.publishedAt}>{postDate(post.publishedAt)}</time>}
            {post.tags?.map((t) => <span key={t}>{t}</span>)}
          </p>
          <h1 className="h-xl">{post.title}</h1>
          <p className="lede">{post.excerpt}</p>
        </header>
        {asMedia(post.cover) && <figure className="post-hero"><Img media={post.cover} sizes="(max-width: 900px) 100vw, 900px" preload /></figure>}
        <RichText data={post.content} className="prose post-content" />
      </div>
      {more.length > 0 && (
        <section className="wrap post-more-list" aria-labelledby="post-more-title">
          <h2 className="h-md" id="post-more-title">Keep reading</h2>
          <ul className="post-grid">{more.map((p) => <li key={p.id}><PostCard post={p} /></li>)}</ul>
        </section>
      )}
    </article>
  );
}
