import { PageView, pageMetadata } from '@/components/sections/PageView';

/** The homepage is the page with the slug "home" (Website → Pages). */
export const generateMetadata = () => pageMetadata('home');

export default function Home() {
  return <PageView slug="home" />;
}
