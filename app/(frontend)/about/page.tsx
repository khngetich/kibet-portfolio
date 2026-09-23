import type { Metadata } from 'next';
import Link from 'next/link';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { asMedia, getAbout } from '@/lib/cms';
import { Img } from '@/components/Img';
import { Icon } from '@/components/Icon';

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAbout();
  return { title: 'About', description: about.short || undefined };
}

export default async function AboutPage() {
  const about = await getAbout();
  const cv = asMedia(about.cv);

  return (
    <section className="page-head-section">
      <div className="wrap about">
        <div className="about-main">
          <p className="kicker">About</p>
          <h1 className="h-xl">{about.headline}</h1>
          {about.body ? <RichText data={about.body} className="prose about-body" /> : about.short && <p className="lede">{about.short}</p>}
          <div className="ctas">
            <Link className="btn btn-dark" href="/#contact">Work with me</Link>
            {cv && <a className="btn btn-soft" href={cv.url!} download><Icon name="download" size={15} />Download CV</a>}
          </div>
        </div>
        <aside className="about-side">
          {asMedia(about.photo) && <div className="about-photo"><Img media={about.photo} sizes="(max-width: 800px) 90vw, 440px" preload /></div>}
          {!!about.experience?.length && (
            <div>
              <p className="kicker">Experience</p>
              <ul className="xp">
                {about.experience.map((x) => (
                  <li key={x.id}><b>{x.role}</b><span>{x.company}</span><small>{x.years}</small></li>
                ))}
              </ul>
            </div>
          )}
          {!!about.skills?.length && <div><p className="kicker">Skills</p><ul className="tags">{about.skills.map((s) => <li key={s}>{s}</li>)}</ul></div>}
          {!!about.tools?.length && <div><p className="kicker">Tools</p><ul className="tags">{about.tools.map((s) => <li key={s}>{s}</li>)}</ul></div>}
        </aside>
      </div>
    </section>
  );
}
