import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { asMedia, getPage, getSite, isStudioCanvas } from '@/lib/cms';
import { RenderSections } from './RenderSections';

/** Search/share metadata for a page, from its Page settings tab, falling back to Site settings. */
export async function pageMetadata(slug: string): Promise<Metadata> {
  const [page, site] = await Promise.all([getPage(slug), getSite()]);
  if (!page) return {};
  const title = page.meta?.title || (slug === 'home' ? undefined : page.title);
  const description = page.meta?.description || site.metaDescription || undefined;
  const image = asMedia(page.meta?.image) ?? asMedia(site.ogImage);
  return {
    ...(title ? { title: slug === 'home' ? { absolute: title } : title } : {}),
    description,
    openGraph: image?.url ? { images: [{ url: image.url, width: image.width ?? undefined, height: image.height ?? undefined }] } : undefined,
  };
}

export async function PageView({ slug }: { slug: string }) {
  const [page, studio] = await Promise.all([getPage(slug), isStudioCanvas()]);
  if (!page) notFound();
  if (studio && !page.sections?.length) return <div className="studio-empty" data-section-empty="">This page has no sections yet. Add one from the navigator.</div>;
  return <RenderSections sections={page.sections} studio={studio} title={page.title} />;
}
