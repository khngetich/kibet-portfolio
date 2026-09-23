import { RichText } from '@payloadcms/richtext-lexical/react';
import type { Project } from '@/payload-types';
import { asMedia } from '@/lib/cms';
import { Img } from './Img';
import { BeforeAfter } from './BeforeAfter';

type Block = NonNullable<Project['layout']>[number];

const SIZES = { contained: '(max-width: 800px) 100vw, 760px', wide: '(max-width: 1240px) 100vw, 1200px', full: '100vw' } as const;
const width = (w?: string | null) => (w === 'full' || w === 'contained' ? w : 'wide');

function embedURL(url: string) {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

function Caption({ text }: { text?: string | null }) {
  return text ? <figcaption>{text}</figcaption> : null;
}

function BlockView({ block }: { block: Block }) {
  switch (block.blockType) {
    case 'image': {
      const w = width(block.width);
      return (
        <figure className={`blk blk-${w} reveal`} style={block.background ? { background: block.background } : undefined}>
          <Img media={block.image} sizes={SIZES[w]} fill={false} />
          <Caption text={block.caption} />
        </figure>
      );
    }
    case 'gallery': {
      const w = width(block.width), cols = Number(block.columns) || 2, fixed = block.aspect && block.aspect !== 'auto';
      return (
        <figure className={`blk blk-${w}`}>
          <div className={`gallery gallery-${cols}${fixed ? ` ar-${block.aspect}` : ''}`}>
            {(block.images ?? []).map((m, i) => (
              <div className="gallery-item reveal" key={asMedia(m)?.id ?? i}>
                <Img media={m} sizes={`(max-width: 700px) 100vw, ${Math.round(1200 / cols)}px`} fill={Boolean(fixed)} />
              </div>
            ))}
          </div>
          <Caption text={block.caption} />
        </figure>
      );
    }
    case 'text':
      return (
        <section className="blk blk-contained blk-text reveal">
          {block.heading && <h2>{block.heading}</h2>}
          <RichText data={block.body} className="prose" />
        </section>
      );
    case 'beforeAfter':
      return (
        <figure className="blk blk-wide reveal">
          <BeforeAfter before={<Img media={block.before} sizes={SIZES.wide} />} after={<Img media={block.after} sizes={SIZES.wide} />} />
          <Caption text={block.caption} />
        </figure>
      );
    case 'palette':
      return (
        <section className="blk blk-wide reveal">
          {block.heading && <h2 className="blk-heading">{block.heading}</h2>}
          <ul className="palette">
            {(block.colours ?? []).map((c, i) => (
              <li key={c.id ?? i}>
                <span className="swatch" style={{ background: c.hex }} />
                <b>{c.name || c.hex}</b>
                <small>{c.hex.toUpperCase()}{c.note ? ` · ${c.note}` : ''}</small>
              </li>
            ))}
          </ul>
        </section>
      );
    case 'typography':
      return (
        <section className="blk blk-wide reveal">
          {block.heading && <h2 className="blk-heading">{block.heading}</h2>}
          <ul className="type-list">
            {(block.fonts ?? []).map((f, i) => (
              <li key={f.id ?? i}>
                <div>
                  <b>{f.family}</b>
                  {f.usage && <small>{f.usage}</small>}
                </div>
                {asMedia(f.specimen) && <div className="type-specimen"><Img media={f.specimen} sizes="(max-width: 800px) 100vw, 700px" fill={false} /></div>}
              </li>
            ))}
          </ul>
        </section>
      );
    case 'video': {
      const w = width(block.width), src = block.embed ? embedURL(block.embed) : null;
      return (
        <figure className={`blk blk-${w} reveal`}>
          {asMedia(block.file) ? (
            <Img media={block.file} sizes={SIZES[w]} fill={false} />
          ) : src ? (
            <div className="embed"><iframe src={src} title={block.caption || 'Project video'} loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /></div>
          ) : null}
          <Caption text={block.caption} />
        </figure>
      );
    }
    case 'quote':
      return (
        <figure className="blk blk-contained quote reveal">
          <blockquote>&ldquo;{block.quote}&rdquo;</blockquote>
          {(block.name || block.title) && <figcaption><b>{block.name}</b>{block.title ? `, ${block.title}` : ''}</figcaption>}
        </figure>
      );
    case 'stats':
      return (
        <section className="blk blk-wide reveal">
          {block.heading && <h2 className="blk-heading">{block.heading}</h2>}
          <dl className="stats">
            {(block.items ?? []).map((s, i) => (
              <div key={s.id ?? i}><dt>{s.label}</dt><dd>{s.value}</dd></div>
            ))}
          </dl>
        </section>
      );
    default:
      return null;
  }
}

export function RenderBlocks({ blocks }: { blocks?: Project['layout'] }) {
  if (!blocks?.length) return null;
  return <div className="blocks">{blocks.map((b, i) => <BlockView block={b} key={b.id ?? i} />)}</div>;
}
