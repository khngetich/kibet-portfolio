import Link from 'next/link';
import { Img } from '@/components/Img';
import { Icon } from '@/components/Icon';
import type { Post } from '@/payload-types';

type Card = Pick<Post, 'title' | 'slug' | 'excerpt' | 'cover' | 'publishedAt' | 'tags'>;

export const postDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

/**
 * An insight as a card: cover (or, without one, the title set large on an accent panel), date,
 * title, excerpt and "Read more". Used by the Insights section and the /insights index.
 */
export function PostCard({ post, headingLevel = 3 }: { post: Card; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <Link className="post-card" href={`/insights/${post.slug}`}>
      <span className="post-cover">
        {post.cover ? <Img media={post.cover} sizes="(max-width: 760px) 100vw, 400px" /> : <span className="post-cover-type" aria-hidden="true">{post.title}</span>}
        {!!post.tags?.length && <span className="post-tag">{post.tags[0]}</span>}
      </span>
      <span className="post-body">
        {post.publishedAt && <time dateTime={post.publishedAt}>{postDate(post.publishedAt)}</time>}
        <H className="post-title">{post.title}</H>
        <span className="post-excerpt">{post.excerpt}</span>
        <span className="post-more">Read more <Icon name="arrow" size={14} /></span>
      </span>
    </Link>
  );
}
