# Site review, 4 October 2026: change log

Every edit from the page-by-page review, with the original wording so anything can be put back.

- **Copy edits** live in the CMS. `scripts/review-content.ts` applies them (`APPLY=1 npm run review-content`), and each one also gets a version in the CMS History.
  - Edits only apply while the text still reads as below.
  - To restore one, paste the original back in the CMS or restore the earlier version from History.
- **Code edits** are in git. Revert the review commit, or the single file, to undo them.

Nothing here changes prices, legal pages (cookies, terms, NDA), the copyright line, or any figure (years, counts, stats). Those are listed under "Flagged" for you to decide.

## 1. Copy edits (CMS, via `scripts/review-content.ts`)

| Where | Original | Now | Why |
|---|---|---|---|
| Home: search title | Humphrey Portfolio | Humphrey Kibet — Graphic & Brand Designer in Kenya | The browser tab and Google result said "Portfolio" and nothing about the work |
| Home: Selected projects intro | Campaigns, brand identities and websites for sports platforms and growing businesses. Start with the featured case study, then browse the rest: each one opens the brief, what I did and what changed. | Campaigns, brand identities and websites for sports platforms and growing businesses. Each case study covers the brief, what I did and what changed. | Instructions on how to scroll added length without information |
| Home: process heading | Our 4-Step Project Process | How a project runs, in *four steps* | Title case, and "Our" on a one-person site |
| Home: About → Overview | I'm Humphrey, a graphic and brand designer in Kenya. I design conversion-driven social content and brand identities that stay consistent everywhere they appear, from matchday posters to complete visual systems. | I design social content that converts and brand identities that stay consistent everywhere they appear, from matchday posters to complete visual systems. | The hero, two sections up, already introduces Humphrey in the same words |
| Home: Services intro (also the /services intro and search description) | Four ways to work together, from a single campaign to a monthly design partner. Open a card to see what's included. | Four ways to work together, from a single campaign to a monthly design partner. | The cards already say "Pick a card to see what's included"; on /services the cards don't open |
| About: headline | I don't just create designs; I craft experiences. | Design that tells *the story.* | Word-for-word the homepage headline |
| About: paragraph 2 | My approach revolves around storytelling and evoking emotional responses. Every project is executed with a pursuit of perfection, so each design communicates its intended message clearly. | My approach revolves around storytelling and the feeling a design should leave. I sweat the details so every piece says exactly what it should. | Wordy |
| About: paragraph 3 | I'm continuously refining my process and efficiency, and I'm dedicated to providing top-notch service to every client I work with. | (removed) | A general promise that tells a visitor nothing specific |
| About: search description | (empty: used the site-wide one, the same as Home and Work) | Humphrey Kibet, graphic and brand designer in Kenya: my approach, experience, skills and tools. | The same description on three pages |
| Work: search description | (empty: the site-wide one) | Case studies by Humphrey Kibet: brand identities, social media campaigns and print, each with the brief, the process and what shipped. | Same as above |
| Résumé: top label | Résumé / Five years, seven teams | Résumé | The Experience heading says "Five years. Seven teams." |
| Résumé: card label | Based in Nairobi · Open to global teams | Availability | The card's heading right under it says "Nairobi-based. Open to the world." |
| Résumé: profile | …leading creative strategy. I translate brand vision into cohesive campaigns across digital and print. | …leading creative strategy. | The same sentence opens the page |
| Résumé: closing card | Kicker "The next chapter", heading "Building a brand? *Let's talk.*", text "Send the role, the challenge and a little about the team behind it. I'm open to full-time, hybrid, remote and contract opportunities.", button "Let's talk about it" | Hidden (heading cleared; the other fields are kept) | Two call-to-action cards in a row with the footer's. Recruiters still have "Discuss an opportunity" on the card and "Discuss a role" in the side menu. To bring it back, put the heading back in the Résumé section. |
| Turkey Golf Tour: title | Turkey Golf TOur | Turkey Golf Tour | Typo |
| Turkey Golf Tour: timeline | 4days | 4 days | Spacing |
| Turkey Golf Tour: approach | …ticket conversions via Mtickets | …ticket conversions via Mtickets. | Missing full stop |
| Graphic Design & Social Assets: summary | Crafting high-impact visuals that engage, align with your brand, and convert views into action. | On-brand visuals that get noticed and turn views into action. | Buzzwords; the other three summaries are short and plain |
| Graphic Design & Social Assets: About this service | High-impact graphic design and digital media assets built to elevate your brand presence and convert views into engagement. From high-converting social media collateral and campaign visuals to marketing materials and print assets, this service provides tailored, consistent visual design that aligns with your strategic goals. | Social media collateral, campaign visuals, marketing materials and print assets, designed to match your brand and turn views into engagement. | Same meaning, about half the length |
| Footer card: heading | Ready to elevate your visual identity? | Got a launch, campaign or *rebrand* coming up? | Generic |
| Footer card: text | Let's partner to create high-impact graphics and social media campaigns that drive growth. | Send a short brief: what it is, who it's for and when you need it. | Generic; now it tells people what to send |
| Footer: site credit (new field) | (none) | Name "Kaptured Creatives", link https://www.instagram.com/kapturedcreatives (the Instagram address already in Site settings → Socials) | The maker's name in the copyright line becomes a link. The copyright text itself is unchanged. |
| Any page: call-to-action band blocks | (none found on the local copy) | Hidden if present (not deleted) | The footer card now closes every page |

## 2. Code edits (git)

| File | Change | Why |
|---|---|---|
| `components/Footer.tsx`, `app/(frontend)/globals.css` | Footer redesign: a new card layout (heading left; text, button and "Or chat on WhatsApp" right); the maker's name links out, with a hover effect (the name rolls up to an accent copy, an underline draws in and an arrow appears); the name is set across the full width as a sign-off, and its letters lift in a wave on hover. | Requested |
| `app/(frontend)/globals.css` | The footer card now shows on every page. On pages that end with the contact form, its button is replaced by "Or chat on WhatsApp", so it doesn't point back up at the form. Removed: `body:has(main #contact) .fx-cta { display: none; }` and the three rules that went with it. | "Maintain the CTA card before the footer in all pages" |
| `globals/Footer.ts`, `migrations/20261004_113105_footer_credit.ts` | New "Site credit" group (name and link) in Website → Footer | For the credit link |
| `app/(frontend)/services/page.tsx`, `sections.css` | Removed the closing card on /services (original: "Not sure which fits? Tell me what you're working on and I'll suggest one." with "Start a project" and "Or chat on WhatsApp"). The sentence is now a line under the intro, linking to the contact form. | Duplicated the footer card directly below it |
| `components/sections/RenderSections.tsx` | On a page with the contact form, the Process and Services sections no longer add their own "Start a project" button. | The homepage had four "Start a project" buttons above the form they all led to |
| `components/sections/RenderSections.tsx` | The contact section no longer repeats the "if you're a startup founder, sports platform…" list when the "This work is for you" section (the same list) is directly above it. | Duplicate list, back to back |
| `components/sections/RenderSections.tsx` | Chapter numbers skip sections that show no number. | The homepage went 01, 02, 03, 04, 06 |
| `components/sections/RenderSections.tsx`, `CaseStudies.tsx`, `EditorialProject.tsx` | The selected-projects section shows one link to /work, not two ("All projects" at the top and "All work" at the bottom). | Duplicate link |
| `app/(frontend)/work/[slug]/page.tsx` | The case-study "Details" panel no longer repeats the timeline; it's already in the facts under the title. | Shown twice on every case study |
| `components/motion/HeroCards.tsx` | Hero project cards are announced as "Triad Brands. View the case study" instead of the cover image's description. | Accessibility: the link's name described the picture, not where it goes |
| `components/motion/service-row.css`, `globals.css` | Bigger tap areas on the service titles (23px → 43px) and the header logo (22px → 44px), with no visual change. | Under the 24px minimum on phones |
| `next.config.ts`, `.gitignore`, `.claude/launch.json`, `tsconfig.json` | `NEXT_DIST_DIR` lets the local preview build into `.next-preview`. | Another `next build` writing to `.next` broke the preview's styles mid-review |

## 3. Flagged for you (not changed)

These are claims, figures or legal wording, so they're yours to decide.

1. **Years of experience disagree.**
   - Hero: "over five years".
   - Résumé: "5+".
   - Home About → Overview tab heading: "5+ years of experience". That tab's figures say "3+ years of experience".
   - /about: "over three years", and "3+ years" at Kaptured Creatives.
2. **Brand counts disagree.** The hero says "Trusted by 7+ brands" while About says "32+ brands launched" (earlier it was 50+).
3. **"On-time delivery 64%"** in the homepage About figures reads as "a third of projects are late". Consider removing it or using a different figure.
4. **Job titles vary**:
   - "Graphic and Brand designer" (hero, footer);
   - "Senior Graphic & Brand Designer" (home About);
   - "Brand & Visual Design Specialist" (résumé);
   - "Graphic designer & social media manager" (site description, /about).

   Pick one for the public site.
5. **Kaptured Creatives** appears on /about as a 3+ year role, but not in the résumé's experience list.
6. **Cookies page** says the work page view is "grid or list"; the switch is labelled "Grid / Proof sheet". It's legal text, so it's left for you.
7. **Thin pages.**
   - Brand Identity & Systems, Design on Demand / Retainers and Creative Direction have no "About this service", steps, questions or price.
   - The Triad Brands and Ngepe Tickets case studies have little or no brief, approach or outcome.
   - Ngepe's three samples are all captioned "Ngepe Logo".
8. **Footer tagline differs between pages** on the live site ("A little logic. A lot of imagination." on some, "Graphic and Brand designer · Kenya" on others). It's an old cached copy on some pages, and it clears on the next deploy once the database connection works.
