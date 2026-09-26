import Image from 'next/image';
import type { Media } from '@/payload-types';
import { asMedia } from '@/lib/media';
import { InViewVideo } from './InViewVideo';

type Props = {
  media: unknown;
  sizes: string;
  /** Fill the parent box (which sets the aspect ratio) instead of using the image's own size. */
  fill?: boolean;
  preload?: boolean;
  className?: string;
};

/** Renders a Payload media document: responsive image with blur-up, or a muted clip that plays while on screen. */
export function Img({ media, sizes, fill = true, preload, className }: Props) {
  const m = asMedia(media) as Media | null;
  if (!m?.url) return null;

  if (m.mimeType?.startsWith('video/')) {
    return <InViewVideo className={className} src={m.url} label={m.alt} style={fill ? { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } : undefined} />;
  }

  const position = m.focalX != null && m.focalY != null ? `${m.focalX}% ${m.focalY}%` : 'center';
  const common = {
    src: m.url,
    alt: m.alt,
    sizes,
    className,
    preload,
    placeholder: m.blurDataURL ? ('blur' as const) : undefined,
    blurDataURL: m.blurDataURL || undefined,
  };

  return fill ? (
    <Image {...common} alt={m.alt} fill style={{ objectFit: 'cover', objectPosition: position }} />
  ) : (
    <Image {...common} alt={m.alt} width={m.width || 1600} height={m.height || 1000} style={{ width: '100%', height: 'auto' }} />
  );
}
