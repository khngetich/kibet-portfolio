import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_work_showcase_layout" AS ENUM('feature', 'carousel');
  CREATE TYPE "public"."enum_pages_blocks_about_banner_cta_variant" AS ENUM('default', 'light', 'dark', 'accent', 'outline', 'ghost');
  CREATE TYPE "public"."enum_pages_blocks_process_steps_icon" AS ENUM('compass', 'pen', 'chat', 'rocket', 'layers', 'spark');
  CREATE TYPE "public"."enum_pages_blocks_process_layout" AS ENUM('steps', 'stack');
  CREATE TYPE "public"."enum__pages_v_blocks_work_showcase_layout" AS ENUM('feature', 'carousel');
  CREATE TYPE "public"."enum__pages_v_blocks_about_banner_cta_variant" AS ENUM('default', 'light', 'dark', 'accent', 'outline', 'ghost');
  CREATE TYPE "public"."enum__pages_v_blocks_process_steps_icon" AS ENUM('compass', 'pen', 'chat', 'rocket', 'layers', 'spark');
  CREATE TYPE "public"."enum__pages_v_blocks_process_layout" AS ENUM('steps', 'stack');
  CREATE TABLE "pages_blocks_about_banner_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_about_banner_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "pages_blocks_work_showcase" ALTER COLUMN "show_wall" SET DEFAULT false;
  ALTER TABLE "_pages_v_blocks_work_showcase" ALTER COLUMN "show_wall" SET DEFAULT false;
  ALTER TABLE "theme" ALTER COLUMN "muted_text" SET DEFAULT '#E2E8F0';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_muted_text" SET DEFAULT '#E2E8F0';
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "clients_label" varchar DEFAULT 'A few trusted partners';
  ALTER TABLE "pages_blocks_work_showcase" ADD COLUMN "eyebrow" varchar DEFAULT 'Selected projects';
  ALTER TABLE "pages_blocks_work_showcase" ADD COLUMN "layout" "enum_pages_blocks_work_showcase_layout" DEFAULT 'feature';
  ALTER TABLE "pages_blocks_about_banner" ADD COLUMN "eyebrow" varchar DEFAULT 'About & services';
  ALTER TABLE "pages_blocks_about_banner" ADD COLUMN "intro" varchar DEFAULT 'a designer specialising in';
  ALTER TABLE "pages_blocks_about_banner" ADD COLUMN "services_heading" varchar DEFAULT 'What I do';
  ALTER TABLE "pages_blocks_about_banner" ADD COLUMN "cta_label" varchar DEFAULT 'Let’s talk about your brand';
  ALTER TABLE "pages_blocks_about_banner" ADD COLUMN "cta_url" varchar DEFAULT '/#contact';
  ALTER TABLE "pages_blocks_about_banner" ADD COLUMN "cta_variant" "enum_pages_blocks_about_banner_cta_variant" DEFAULT 'default';
  ALTER TABLE "pages_blocks_process_steps" ADD COLUMN "icon" "enum_pages_blocks_process_steps_icon" DEFAULT 'compass';
  ALTER TABLE "pages_blocks_process" ADD COLUMN "lead" varchar;
  ALTER TABLE "pages_blocks_process" ADD COLUMN "layout" "enum_pages_blocks_process_layout" DEFAULT 'steps';
  ALTER TABLE "pages_blocks_testimonials_items" ADD COLUMN "highlight" varchar;
  ALTER TABLE "pages_blocks_testimonials_items" ADD COLUMN "company" varchar;
  ALTER TABLE "pages_blocks_testimonials_items" ADD COLUMN "logo_id" integer;
  ALTER TABLE "pages_blocks_contact" ADD COLUMN "roles_lead" varchar DEFAULT 'Made for you if you’re a';
  ALTER TABLE "pages_blocks_contact" ADD COLUMN "show_socials" boolean DEFAULT true;
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "clients_label" varchar DEFAULT 'A few trusted partners';
  ALTER TABLE "_pages_v_blocks_work_showcase" ADD COLUMN "eyebrow" varchar DEFAULT 'Selected projects';
  ALTER TABLE "_pages_v_blocks_work_showcase" ADD COLUMN "layout" "enum__pages_v_blocks_work_showcase_layout" DEFAULT 'feature';
  ALTER TABLE "_pages_v_blocks_about_banner" ADD COLUMN "eyebrow" varchar DEFAULT 'About & services';
  ALTER TABLE "_pages_v_blocks_about_banner" ADD COLUMN "intro" varchar DEFAULT 'a designer specialising in';
  ALTER TABLE "_pages_v_blocks_about_banner" ADD COLUMN "services_heading" varchar DEFAULT 'What I do';
  ALTER TABLE "_pages_v_blocks_about_banner" ADD COLUMN "cta_label" varchar DEFAULT 'Let’s talk about your brand';
  ALTER TABLE "_pages_v_blocks_about_banner" ADD COLUMN "cta_url" varchar DEFAULT '/#contact';
  ALTER TABLE "_pages_v_blocks_about_banner" ADD COLUMN "cta_variant" "enum__pages_v_blocks_about_banner_cta_variant" DEFAULT 'default';
  ALTER TABLE "_pages_v_blocks_process_steps" ADD COLUMN "icon" "enum__pages_v_blocks_process_steps_icon" DEFAULT 'compass';
  ALTER TABLE "_pages_v_blocks_process" ADD COLUMN "lead" varchar;
  ALTER TABLE "_pages_v_blocks_process" ADD COLUMN "layout" "enum__pages_v_blocks_process_layout" DEFAULT 'steps';
  ALTER TABLE "_pages_v_blocks_testimonials_items" ADD COLUMN "highlight" varchar;
  ALTER TABLE "_pages_v_blocks_testimonials_items" ADD COLUMN "company" varchar;
  ALTER TABLE "_pages_v_blocks_testimonials_items" ADD COLUMN "logo_id" integer;
  ALTER TABLE "_pages_v_blocks_contact" ADD COLUMN "roles_lead" varchar DEFAULT 'Made for you if you’re a';
  ALTER TABLE "_pages_v_blocks_contact" ADD COLUMN "show_socials" boolean DEFAULT true;
  ALTER TABLE "pages_blocks_about_banner_services" ADD CONSTRAINT "pages_blocks_about_banner_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_about_banner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_about_banner_services" ADD CONSTRAINT "_pages_v_blocks_about_banner_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_about_banner"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_about_banner_services_order_idx" ON "pages_blocks_about_banner_services" USING btree ("_order");
  CREATE INDEX "pages_blocks_about_banner_services_parent_id_idx" ON "pages_blocks_about_banner_services" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_about_banner_services_order_idx" ON "_pages_v_blocks_about_banner_services" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_about_banner_services_parent_id_idx" ON "_pages_v_blocks_about_banner_services" USING btree ("_parent_id");
  ALTER TABLE "pages_blocks_testimonials_items" ADD CONSTRAINT "pages_blocks_testimonials_items_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials_items" ADD CONSTRAINT "_pages_v_blocks_testimonials_items_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_testimonials_items_logo_idx" ON "pages_blocks_testimonials_items" USING btree ("logo_id");
  CREATE INDEX "_pages_v_blocks_testimonials_items_logo_idx" ON "_pages_v_blocks_testimonials_items" USING btree ("logo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_about_banner_services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_about_banner_services" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_about_banner_services" CASCADE;
  DROP TABLE "_pages_v_blocks_about_banner_services" CASCADE;
  ALTER TABLE "pages_blocks_testimonials_items" DROP CONSTRAINT "pages_blocks_testimonials_items_logo_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_testimonials_items" DROP CONSTRAINT "_pages_v_blocks_testimonials_items_logo_id_media_id_fk";
  
  DROP INDEX "pages_blocks_testimonials_items_logo_idx";
  DROP INDEX "_pages_v_blocks_testimonials_items_logo_idx";
  ALTER TABLE "pages_blocks_work_showcase" ALTER COLUMN "show_wall" SET DEFAULT true;
  ALTER TABLE "_pages_v_blocks_work_showcase" ALTER COLUMN "show_wall" SET DEFAULT true;
  ALTER TABLE "theme" ALTER COLUMN "muted_text" SET DEFAULT '#A8A8A6';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_muted_text" SET DEFAULT '#A8A8A6';
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "clients_label";
  ALTER TABLE "pages_blocks_work_showcase" DROP COLUMN "eyebrow";
  ALTER TABLE "pages_blocks_work_showcase" DROP COLUMN "layout";
  ALTER TABLE "pages_blocks_about_banner" DROP COLUMN "eyebrow";
  ALTER TABLE "pages_blocks_about_banner" DROP COLUMN "intro";
  ALTER TABLE "pages_blocks_about_banner" DROP COLUMN "services_heading";
  ALTER TABLE "pages_blocks_about_banner" DROP COLUMN "cta_label";
  ALTER TABLE "pages_blocks_about_banner" DROP COLUMN "cta_url";
  ALTER TABLE "pages_blocks_about_banner" DROP COLUMN "cta_variant";
  ALTER TABLE "pages_blocks_process_steps" DROP COLUMN "icon";
  ALTER TABLE "pages_blocks_process" DROP COLUMN "lead";
  ALTER TABLE "pages_blocks_process" DROP COLUMN "layout";
  ALTER TABLE "pages_blocks_testimonials_items" DROP COLUMN "highlight";
  ALTER TABLE "pages_blocks_testimonials_items" DROP COLUMN "company";
  ALTER TABLE "pages_blocks_testimonials_items" DROP COLUMN "logo_id";
  ALTER TABLE "pages_blocks_contact" DROP COLUMN "roles_lead";
  ALTER TABLE "pages_blocks_contact" DROP COLUMN "show_socials";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "clients_label";
  ALTER TABLE "_pages_v_blocks_work_showcase" DROP COLUMN "eyebrow";
  ALTER TABLE "_pages_v_blocks_work_showcase" DROP COLUMN "layout";
  ALTER TABLE "_pages_v_blocks_about_banner" DROP COLUMN "eyebrow";
  ALTER TABLE "_pages_v_blocks_about_banner" DROP COLUMN "intro";
  ALTER TABLE "_pages_v_blocks_about_banner" DROP COLUMN "services_heading";
  ALTER TABLE "_pages_v_blocks_about_banner" DROP COLUMN "cta_label";
  ALTER TABLE "_pages_v_blocks_about_banner" DROP COLUMN "cta_url";
  ALTER TABLE "_pages_v_blocks_about_banner" DROP COLUMN "cta_variant";
  ALTER TABLE "_pages_v_blocks_process_steps" DROP COLUMN "icon";
  ALTER TABLE "_pages_v_blocks_process" DROP COLUMN "lead";
  ALTER TABLE "_pages_v_blocks_process" DROP COLUMN "layout";
  ALTER TABLE "_pages_v_blocks_testimonials_items" DROP COLUMN "highlight";
  ALTER TABLE "_pages_v_blocks_testimonials_items" DROP COLUMN "company";
  ALTER TABLE "_pages_v_blocks_testimonials_items" DROP COLUMN "logo_id";
  ALTER TABLE "_pages_v_blocks_contact" DROP COLUMN "roles_lead";
  ALTER TABLE "_pages_v_blocks_contact" DROP COLUMN "show_socials";
  DROP TYPE "public"."enum_pages_blocks_work_showcase_layout";
  DROP TYPE "public"."enum_pages_blocks_about_banner_cta_variant";
  DROP TYPE "public"."enum_pages_blocks_process_steps_icon";
  DROP TYPE "public"."enum_pages_blocks_process_layout";
  DROP TYPE "public"."enum__pages_v_blocks_work_showcase_layout";
  DROP TYPE "public"."enum__pages_v_blocks_about_banner_cta_variant";
  DROP TYPE "public"."enum__pages_v_blocks_process_steps_icon";
  DROP TYPE "public"."enum__pages_v_blocks_process_layout";`)
}
