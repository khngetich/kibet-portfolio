import { PageView, pageMetadata } from '@/components/sections/PageView';

/** The work index is the page with the slug "work"; case studies live at /work/[slug]. */
export const generateMetadata = () => pageMetadata('work');

export default function WorkIndex() {
  return <PageView slug="work" />;
}
