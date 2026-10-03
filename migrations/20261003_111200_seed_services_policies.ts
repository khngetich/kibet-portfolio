import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

/**
 * Content for the October 2026 update (the schema came in 20261003_111048):
 *  - Services: the cards that lived inside the Services section become Service documents
 *    (each gets its own page at /services/<slug>). Skipped if any service exists already.
 *  - Policy pages: Cookies & privacy, Terms and Confidentiality & NDA, as ordinary Pages with
 *    one Text section, so they're edited like any other page. Skipped for slugs that exist.
 *  - Footer: links to those pages, if the footer has no policy links yet.
 *  - Styles: the dashboard's neutral palette (white, #F7F7F5, ink #0F0F0F) and Manrope.
 *    The previous values stay in Styles → History.
 * Everything goes through Payload in the migration's transaction, so it all lands or none does.
 */

const UPDATED = '3 October 2026'

/* ── a tiny writer for Lexical rich text: '## ' is a heading, '- ' a bullet, [label](url) a link ── */
type Node = Record<string, unknown>
const base = { direction: 'ltr', format: '', indent: 0, version: 1 }
const text = (t: string): Node => ({ type: 'text', text: t, format: 0, detail: 0, mode: 'normal', style: '', version: 1 })
const inline = (s: string): Node[] =>
  s.split(/(\[[^\]]+\]\([^)]+\))/).filter(Boolean).map((part) => {
    const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    return m ? { ...base, type: 'link', version: 3, fields: { url: m[2], newTab: false, linkType: 'custom' }, children: [text(m[1])] } : text(part)
  })
function richText(lines: string[]) {
  const children: Node[] = []
  for (const line of lines) {
    if (line.startsWith('## ')) children.push({ ...base, type: 'heading', tag: 'h2', children: inline(line.slice(3)) })
    else if (line.startsWith('- ')) {
      const last = children[children.length - 1]
      const item = { ...base, type: 'listitem', value: 1, children: inline(line.slice(2)) }
      if (last?.type === 'list') { const items = last.children as Node[]; items.push({ ...item, value: items.length + 1 }) }
      else children.push({ ...base, type: 'list', listType: 'bullet', start: 1, tag: 'ul', children: [item] })
    } else children.push({ ...base, type: 'paragraph', textFormat: 0, textStyle: '', children: inline(line) })
  }
  return { root: { ...base, type: 'root', children } }
}

const slugify = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

function policies(name: string, email?: string | null) {
  const mail = email ? `[${email}](mailto:${email})` : 'the contact form on the homepage'
  return [
    {
      slug: 'cookies',
      title: 'Cookies & privacy',
      description: 'What this site stores, what it doesn’t track, and what happens to the details you send.',
      body: [
        'The short version: this site doesn’t use analytics, advertising or tracking cookies. It remembers two display preferences in your own browser, and keeps what you send through the contact form so I can reply.',
        '## What your browser keeps',
        'Two preferences are saved in your browser’s local storage, on your device only. They are never sent to me and you can clear them at any time in your browser settings:',
        '- Light or dark mode, so the site looks the way you left it.',
        '- How you last viewed the work page (grid or list).',
        '## Cookies',
        'Visitors get no cookies from this site. Cookies are only set for editors who sign in to manage the site; they are needed for signing in and do nothing else.',
        'Some project pages embed YouTube or Vimeo videos. Those services may set their own cookies when you play a video, under their own privacy policies.',
        '## Analytics',
        'None. I don’t use Google Analytics or any similar tool, and I don’t build profiles of visitors. If that changes, this page will be updated first and, where the law requires it, you’ll be asked before anything is collected.',
        '## What you send me',
        'When you use the contact form I receive your name, email address, the service you picked and your message. I use them only to reply to you and, if we work together, to run the project. I don’t sell them or use them for marketing.',
        'Messages are stored in the site’s database, hosted by Supabase in the European Union. The site itself is hosted by Vercel. Both act on my behalf and keep standard, short-lived server logs (for example IP addresses) for security.',
        'To stop spam, the form briefly checks your IP address in memory. It is not saved with your message.',
        'I keep enquiries for as long as they are useful for the conversation or project, and delete them sooner if you ask.',
        '## Your rights',
        'Under Kenya’s Data Protection Act, 2019 you can ask what I hold about you, ask me to correct it, or ask me to delete it. Email ' + mail + ' and I’ll respond as soon as I can.',
        '## Contact',
        `This site is run by ${name}. Questions about this page: ${mail}.`,
      ],
    },
    {
      slug: 'terms',
      title: 'Terms',
      description: 'The terms for using this site and for working together.',
      body: [
        'These terms cover using this website and working with me. For a specific project, the written quote or agreement we both accept comes first wherever it says something different.',
        '## Using this site',
        'The designs, images and text on this site belong to me or to the clients they were made for. They are shown as a portfolio. Please don’t copy or reuse them without permission.',
        '## Quotes and scope',
        'Every project starts with a written quote that sets out the scope, deliverables, price, timeline and payment schedule. Work outside that scope is quoted separately, and only starts once you agree to it.',
        '## Payment',
        'Payments are made as set out in the quote. If a payment is overdue, work may pause until it is settled.',
        '## Feedback and revisions',
        'The quote says how many rounds of changes are included. Clear, timely feedback keeps the project on schedule; long delays can move the delivery date.',
        '## Your materials',
        'You confirm that you have the right to use anything you give me for the project, such as logos, photos, text and fonts.',
        '## Ownership',
        'Once the project is paid in full, you own the final approved files and can use them for the purpose agreed. Working files and unused concepts stay with me unless we agree otherwise. Third-party items such as stock images or fonts are covered by their own licences, and I’ll tell you about any costs before buying them.',
        'I may show finished work in my portfolio unless we agree otherwise; see [Confidentiality & NDA](/nda).',
        '## Ending a project',
        'Either of us can end a project with written notice. You pay for the work done up to that point, and I hand over what has been completed and paid for.',
        '## Liability',
        'I work with care, but I can’t be responsible for indirect losses, such as lost profits, from using the work. My total liability for a project is limited to the fees paid for it.',
        '## Changes and law',
        'I may update these terms; the date at the top shows when. These terms are governed by the laws of Kenya.',
        '## Contact',
        `Questions about these terms: ${mail}.`,
      ],
    },
    {
      slug: 'nda',
      title: 'Confidentiality & NDA',
      description: 'How project details stay private, and how to put an NDA in place.',
      body: [
        'The short version: your project details stay private. I’m happy to sign your non-disclosure agreement (NDA) before we talk details, or to send you a mutual one.',
        '## What I keep confidential',
        '- Your brief, plans and anything about unreleased products or campaigns.',
        '- Business information you share, such as figures, strategy and customer details.',
        '- Files you send me, and the work in progress before it is published.',
        '## How it’s handled',
        'Your information is used only for your project. It is shared only with people who need it to do the work (for example a printer), and only on the same terms. Files are kept in secure, password-protected accounts, and I’ll return or delete them when the project ends if you ask.',
        '## My portfolio',
        'I only show work publicly once it has been launched and you’re happy for it to be shown. If we have an NDA, I won’t show the work at all, or I’ll show only what we agree (for example without the client’s name, or with details hidden).',
        '## Putting an NDA in place',
        'Send me your NDA before you share the details, or ask for my mutual NDA. It covers information that is marked confidential or would reasonably be understood to be. It doesn’t cover anything that is already public, that I already knew, or that the law requires me to disclose. It lasts for the period written in the agreement.',
        '## Contact',
        `To arrange an NDA: ${mail}.`,
      ],
    },
  ]
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const context = { disableRevalidate: true }
  const site = await payload.findGlobal({ slug: 'site', depth: 0, req })

  // 1. Services: from the cards inside Services sections
  const { totalDocs: services } = await payload.count({ collection: 'services', req })
  if (!services) {
    const { docs: pages } = await payload.find({ collection: 'pages', depth: 0, pagination: false, req })
    const seen = new Set<string>()
    for (const page of pages) {
      for (const section of page.sections ?? []) {
        if (section.blockType !== 'services') continue
        for (const item of section.items ?? []) {
          if (!item.title || seen.has(item.title)) continue
          seen.add(item.title)
          await payload.create({
            collection: 'services',
            req,
            context,
            data: {
              title: item.title,
              slug: slugify(item.title),
              description: item.description,
              deliverables: item.deliverables,
              priceFrom: item.priceFrom,
              currency: item.currency,
              unit: item.unit,
              image: typeof item.image === 'object' && item.image ? item.image.id : item.image,
              imageCaption: item.imageCaption,
              featured: item.featured,
              starter: item.starter,
              _status: 'published',
            },
          })
        }
      }
    }
    payload.logger.info(`Services: created ${seen.size} from the Services section`)
  }

  // 2. Policy pages
  for (const p of policies(site.name || 'the site owner', site.email)) {
    const { totalDocs } = await payload.count({ collection: 'pages', where: { slug: { equals: p.slug } }, req })
    if (totalDocs) continue
    await payload.create({
      collection: 'pages',
      req,
      context,
      data: {
        title: p.title,
        slug: p.slug,
        _status: 'published',
        meta: { title: p.title, description: p.description },
        sections: [{ blockType: 'richText', eyebrow: `Last updated ${UPDATED}`, heading: p.title, align: 'left', body: richText(p.body) as never }],
      },
    })
    payload.logger.info(`Pages: created /${p.slug}`)
  }

  // 3. Footer policy links
  const footer = await payload.findGlobal({ slug: 'footer', depth: 0, req })
  if (!footer.legal?.length) {
    await payload.updateGlobal({
      slug: 'footer',
      req,
      context,
      data: { legal: [{ label: 'Cookies & privacy', url: '/cookies' }, { label: 'Terms', url: '/terms' }, { label: 'NDA', url: '/nda' }] },
    })
  }

  // 4. Styles: the dashboard's palette
  await payload.updateGlobal({
    slug: 'theme',
    req,
    context,
    data: {
      background: '#0F0F0F', surface: '#1A1A1E', text: '#F7F7F5', mutedText: '#A6A6B0',
      accent: '#0F0F0F', accent2: '#5A5A63',
      lightBackground: '#FFFFFF', lightSurface: '#F7F7F5', lightText: '#0F0F0F',
      buttonBackground: '#F7F7F5', buttonText: '#0F0F0F', buttonDarkBackground: '#0F0F0F',
      headingFont: 'Manrope', bodyFont: 'Manrope', glow: false,
    },
  })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // Content only. Nothing is undone automatically: the pages and services may have been edited
  // since, and Styles → History has the previous colours.
}
