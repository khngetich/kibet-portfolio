import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "theme" ALTER COLUMN "background" SET DEFAULT '#000000';
  ALTER TABLE "theme" ALTER COLUMN "surface" SET DEFAULT '#131313';
  ALTER TABLE "theme" ALTER COLUMN "text" SET DEFAULT '#F5F5F4';
  ALTER TABLE "theme" ALTER COLUMN "accent" SET DEFAULT '#E8352B';
  ALTER TABLE "theme" ALTER COLUMN "accent2" SET DEFAULT '#FF6A2B';
  ALTER TABLE "theme" ALTER COLUMN "light_text" SET DEFAULT '#0A0A0A';
  ALTER TABLE "theme" ALTER COLUMN "button_background" SET DEFAULT '#FFFFFF';
  ALTER TABLE "theme" ALTER COLUMN "button_text" SET DEFAULT '#0A0A0A';
  ALTER TABLE "theme" ALTER COLUMN "button_dark_background" SET DEFAULT '#0A0A0A';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_background" SET DEFAULT '#000000';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_surface" SET DEFAULT '#131313';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_text" SET DEFAULT '#F5F5F4';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_accent" SET DEFAULT '#E8352B';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_accent2" SET DEFAULT '#FF6A2B';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_light_text" SET DEFAULT '#0A0A0A';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_button_background" SET DEFAULT '#FFFFFF';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_button_text" SET DEFAULT '#0A0A0A';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_button_dark_background" SET DEFAULT '#0A0A0A';`)

  // Styles: the original orange-red accent and black, on the dashboard's neutrals. Light and
  // dark mode both stay; the previous values are in Styles → History.
  await payload.updateGlobal({
    slug: 'theme',
    req,
    context: { disableRevalidate: true },
    data: {
      background: '#000000', surface: '#131313', text: '#F5F5F4', mutedText: '#A6A6B0',
      accent: '#E8352B', accent2: '#FF6A2B',
      lightBackground: '#FFFFFF', lightSurface: '#F7F7F5', lightText: '#0A0A0A',
      buttonBackground: '#FFFFFF', buttonText: '#0A0A0A', buttonDarkBackground: '#0A0A0A',
    },
  })
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "theme" ALTER COLUMN "background" SET DEFAULT '#0F0F0F';
  ALTER TABLE "theme" ALTER COLUMN "surface" SET DEFAULT '#1A1A1E';
  ALTER TABLE "theme" ALTER COLUMN "text" SET DEFAULT '#F7F7F5';
  ALTER TABLE "theme" ALTER COLUMN "accent" SET DEFAULT '#0F0F0F';
  ALTER TABLE "theme" ALTER COLUMN "accent2" SET DEFAULT '#5A5A63';
  ALTER TABLE "theme" ALTER COLUMN "light_text" SET DEFAULT '#0F0F0F';
  ALTER TABLE "theme" ALTER COLUMN "button_background" SET DEFAULT '#F7F7F5';
  ALTER TABLE "theme" ALTER COLUMN "button_text" SET DEFAULT '#0F0F0F';
  ALTER TABLE "theme" ALTER COLUMN "button_dark_background" SET DEFAULT '#0F0F0F';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_background" SET DEFAULT '#0F0F0F';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_surface" SET DEFAULT '#1A1A1E';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_text" SET DEFAULT '#F7F7F5';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_accent" SET DEFAULT '#0F0F0F';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_accent2" SET DEFAULT '#5A5A63';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_light_text" SET DEFAULT '#0F0F0F';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_button_background" SET DEFAULT '#F7F7F5';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_button_text" SET DEFAULT '#0F0F0F';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_button_dark_background" SET DEFAULT '#0F0F0F';`)
}
