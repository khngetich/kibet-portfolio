import { getPageSlugs } from '@/lib/cms';
import { PageView, pageMetadata } from '@/components/sections/PageView';

type Props = { params: Promise<{ slug: string }> };

/** Every other page built from sections (About, and any page added in the CMS). */
export async function generateStaticParams() {
  // "home" is the root and "work" has its own route (with case studies beneath it).
  return (await getPageSlugs()).filter((slug) => slug !== 'home' && slug !== 'work').map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  return pageMetadata((await params).slug);
}

export default async function Page({ params }: Props) {
  return <PageView slug={(await params).slug} />;
}
