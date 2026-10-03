import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

/**
 * The /resume page (the schema came in 20261003_153100): one Résumé section filled from
 * Humphrey's CV (October 2026). Skipped if a page with the slug "resume" exists already, so
 * edits made in the Studio are never overwritten. The CV PDF itself is picked in the section's
 * Intro tab (CV file), since a migration can't rely on the file being on the server.
 */

const SECTION = {
  blockType: 'resume' as const,
  eyebrow: 'Résumé / Five years, seven teams',
  name: 'Humphrey *Kibet.*',
  role: 'Brand & Visual Design Specialist',
  intro: 'I translate brand vision into cohesive campaigns across digital and print, and make the work myself.',
  currentLead: 'Currently',
  current: 'Design Lead Specialist at BrighterMonday Kenya',
  cvLabel: 'Download résumé',
  card: {
    kicker: 'Based in Nairobi · Open to global teams',
    heading: 'Nairobi-based. *Open to the world.*',
    text: 'I work best with teams that treat brand as a business tool, and want it to look and feel the same everywhere it shows up.',
    topicsLabel: 'Let’s talk about',
    topics: ['Design leadership', 'Brand identity', 'Campaign direction', 'Photo & video'],
    workTypes: ['Full-time', 'Hybrid', 'Remote', 'Contract'],
    place: 'Nairobi, Kenya · UTC+3',
  },
  cardLink: { label: 'Discuss an opportunity', url: '/#contact', variant: 'default' as const },
  stats: [
    { value: '5+', label: 'years in brand & visual design' },
    { value: '15%', label: 'uplift in platform engagement from the Future of Work campaign' },
    { value: '50%+', label: 'growth in social video views' },
    { value: '300%', label: 'more interactions per post at Ananas' },
  ],
  profileHeading: 'Brand thinking. *Hands-on craft.*',
  profile: [
    'Brand & Visual Design Specialist with 5+ years’ experience, progressing from foundational design roles into a senior position leading creative strategy. I translate brand vision into cohesive campaigns across digital and print.',
    'My career has been built on a practical, hands-on approach across organisations spanning tech, marketing and consumer services, focused on measurable engagement, brand consistency and visual impact at scale.',
  ].join('\n\n'),
  pillars: [
    { title: 'A brand that holds together.', text: 'Brand audits, identity guides and clear rules that keep every touchpoint consistent, on screen and in print.' },
    { title: 'Campaigns built to travel.', text: 'One idea carried from social posts to brochures, banners, websites and video, without losing its shape.' },
    { title: 'Made in-house, end to end.', text: 'Concept, design, photography and video, so the idea survives all the way to the final file.' },
  ],
  xpHeading: 'Five years. *Seven teams.*',
  jobs: [
    {
      role: 'Design Lead Specialist', company: 'BrighterMonday Kenya', dates: 'Aug 2025 – Present', place: 'Westlands, Nairobi', mode: 'Hybrid',
      about: 'Career and recruitment platform',
      summary: 'Leading creative direction, brand and in-house production.',
      points: [
        'Spearheaded end-to-end creative direction for the “Future of Work” campaign, producing all visual assets and driving a 15% uplift in platform engagement.',
        'Led a comprehensive brand audit and launched a unified visual identity guide, achieving 100% brand consistency across all digital touchpoints.',
        'Directed and produced all in-house photography and videography, growing social media video views by over 50%.',
      ],
    },
    {
      role: 'Creative Designer', company: 'Solami Limited', dates: 'Oct 2024 – Jul 2025', place: 'Parklands, Nairobi', mode: 'On-site',
      points: [
        'Led design concept development and delivery of client-facing visual materials, strengthening brand presence across campaigns.',
        'Produced brochures, logos, social media graphics and website visuals, consistent with each client’s brand guidelines.',
        'Partnered with cross-functional teams to deliver cohesive multi-platform campaigns, including promotional video content.',
      ],
    },
    {
      role: 'Social Media Manager & Graphic Designer', company: 'Prime Marketing Concepts', dates: 'Dec 2022 – Jan 2025', place: 'Houston, Texas', mode: 'Part-time · Remote',
      points: [
        'Designed and executed print and digital marketing collateral, including brochures, flyers, posters and banners.',
        'Built and maintained a consistent brand identity across all client materials and digital platforms.',
        'Designed and launched a website for a car rental client, improving its online presence and user experience.',
      ],
    },
    {
      role: 'Social Media Executive & Graphic Designer', company: 'Behind The Scenes Marketing', dates: 'Jun 2024 – Sep 2024', place: 'Westlands, Nairobi', mode: 'Hybrid',
      points: [
        'Developed and executed social media strategies that boosted brand awareness and engagement for clients and the agency.',
        'Managed content creation and performance analysis across platforms, reporting on key metrics to guide strategy.',
        'Supported branding, graphic design and email marketing projects alongside the Marketing Director.',
      ],
    },
    {
      role: 'Digital Marketer & Design Assistant', company: 'Shupav LLP', dates: 'Oct 2022 – May 2024', place: 'Applewood Adams, Nairobi', mode: 'Hybrid',
      points: [
        'Created, curated and managed content across social media platforms for clients and the agency.',
        'Developed and executed social media strategy across Facebook, Twitter, Instagram and LinkedIn in line with marketing objectives.',
        'Designed marketing collateral, social media graphics, email newsletters and website graphics.',
        'Assisted the Marketing Director with branding, graphic design and website projects, and created newsletters, imagery and copy for email marketing.',
      ],
    },
    {
      role: 'Graphic Designer & Social Media Manager', company: 'Hisia Psychology Consultants', dates: 'Oct 2022 – May 2024', place: 'Westlands, Nairobi', mode: 'Hybrid',
      points: [
        'Created and managed paid social media advertising campaigns, tracking performance and reporting to the marketing team.',
        'Designed marketing materials including brochures, flyers, posters, email newsletters and signage.',
        'Managed content creation for all social media channels (Facebook, Twitter, Instagram, LinkedIn).',
      ],
    },
    {
      role: 'Social Media Manager, Photographer & Graphic Designer', company: 'Ananas Consolidated Group', dates: 'Nov 2020 – Oct 2022', place: 'Westlands, Nairobi', mode: 'On-site',
      about: 'Ananas Food Court and Melanin Club',
      points: [
        'Designed all creative assets for social media and on-site promotions, contributing to a consistent increase in foot traffic and event attendance.',
        'Led daily social media management and community engagement, driving a 300% increase in average post interactions.',
        'Managed IT hardware and software setup and inventory alongside creative responsibilities.',
      ],
    },
  ],
  workHeading: 'Selected work. *Up close.*',
  workIntro: 'A few projects from across these roles. Each one opens the full case study.',
  workLink: { label: 'See all work', url: '/work', variant: 'ghost' as const },
  skillsHeading: 'From the brief *to the final file.*',
  skillGroups: [
    { label: 'Design & creative software', items: ['Adobe Illustrator', 'Adobe Photoshop', 'Adobe InDesign', 'Adobe Premiere Pro', 'Adobe After Effects', 'Figma', 'Canva', 'MS Office'] },
    { label: 'Core competencies', items: ['Graphic design', 'Brand identity', 'Videography & photography', 'Content creation'] },
    { label: 'Marketing & management', items: ['Social media management', 'Digital marketing', 'Project coordination', 'Team leadership & mentorship'] },
  ],
  eduHeading: 'Learned on the job. *Still learning.*',
  schools: [
    { qualification: 'Certificate & Diploma, Information Communication Technology', school: 'East Africa Institute of Certified Studies', place: 'Nairobi, Kenya', note: 'On hold: paused to pursue accelerated, hands-on industry experience.' },
    { qualification: 'Certificate of Secondary Education', years: '2014 – 2017', school: 'Longisa Boys High School', place: 'Bomet, Kenya' },
  ],
  certs: [
    { title: 'Team Essentials for Designing AI Solutions', issuer: 'IBM SkillsBuild', year: '2026', note: 'Human-centred AI design: defining AI team roles, framing real-world problems, mitigating algorithmic bias and setting ethical guidelines.' },
    { title: 'AI Literacy', issuer: 'IBM SkillsBuild', year: '2026', note: 'Key AI concepts, machine learning basics, generative AI applications and the ethics of putting AI to work.' },
    { title: 'Fundamentals of Digital Marketing', issuer: 'Google Digital Skills for Africa', year: '2019', note: 'SEO, SEM, social media marketing and analytics, applied to grow website traffic and online engagement for clients.' },
  ],
  closingKicker: 'The next chapter',
  closingHeading: 'Building a brand? *Let’s talk.*',
  closingText: 'Send the role, the challenge and a little about the team behind it. I’m open to full-time, hybrid, remote and contract opportunities.',
  closingLink: { label: 'Let’s talk about it', url: '/#contact', variant: 'default' as const },
  showEmail: true,
  showLinkedIn: true,
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const { totalDocs } = await payload.count({ collection: 'pages', where: { slug: { equals: 'resume' } }, req })
  if (totalDocs) {
    payload.logger.info('Pages: /resume exists already, left as it is')
    return
  }
  await payload.create({
    collection: 'pages',
    req,
    data: {
      title: 'Résumé',
      slug: 'resume',
      _status: 'published',
      sections: [SECTION],
      meta: {
        title: 'Résumé',
        description: 'Humphrey Kibet, Brand & Visual Design Specialist in Nairobi: experience, skills, selected work and a downloadable CV.',
      },
    },
  })
  payload.logger.info('Pages: created /resume')
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  // The page may have been edited since; it's removed only when asked to roll back.
  await payload.delete({ collection: 'pages', where: { slug: { equals: 'resume' } }, req })
}
