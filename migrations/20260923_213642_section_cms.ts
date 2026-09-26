import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_services_items_currency" AS ENUM('KES', 'USD');
  CREATE TYPE "public"."enum_pages_blocks_rich_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_media_section_width" AS ENUM('wide', 'full');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_services_items_currency" AS ENUM('KES', 'USD');
  CREATE TYPE "public"."enum__pages_v_blocks_rich_text_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_media_section_width" AS ENUM('wide', 'full');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "pages_blocks_hero_clients" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"trusted_text" varchar DEFAULT 'Trusted by {count}+ brands',
  	"headline" varchar,
  	"intro" varchar,
  	"cta_text" varchar DEFAULT 'Have a brief? Tell me about it.',
  	"button_label" varchar,
  	"button_url" varchar DEFAULT '#contact',
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_work_showcase" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Selected work',
  	"intro" varchar,
  	"show_wall" boolean DEFAULT true,
  	"link_label" varchar DEFAULT 'All projects',
  	"link_url" varchar DEFAULT '/work',
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar DEFAULT 'work',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_about_banner_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_about_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"greeting" varchar DEFAULT 'Hi, I’m',
  	"heading" varchar,
  	"photo_id" integer,
  	"big_name" varchar,
  	"link_label" varchar DEFAULT 'More about me',
  	"link_url" varchar DEFAULT '/about',
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar DEFAULT 'about',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_audience" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'This work is for you',
  	"lead" varchar DEFAULT 'if you’re a',
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar DEFAULT 'for-who',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "pages_blocks_process" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'How it works',
  	"heading" varchar DEFAULT 'From first message to finished files in four steps',
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar DEFAULT 'process',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_services_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"price_from" numeric,
  	"currency" "enum_pages_blocks_services_items_currency" DEFAULT 'KES',
  	"unit" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "pages_blocks_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'What I do',
  	"heading" varchar DEFAULT 'What I do',
  	"intro" varchar,
  	"show_whats_app" boolean DEFAULT true,
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar DEFAULT 'services',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"name" varchar,
  	"title" varchar,
  	"photo_id" integer
  );
  
  CREATE TABLE "pages_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Honest words, real results',
  	"heading" varchar DEFAULT 'What clients say',
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Let’s talk',
  	"heading" varchar DEFAULT 'Have a brief? Let’s talk.',
  	"intro" varchar,
  	"show_availability" boolean DEFAULT true,
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar DEFAULT 'contact',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_project_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Work',
  	"intro" varchar,
  	"show_filters" boolean DEFAULT true,
  	"only_featured" boolean DEFAULT false,
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_profile_experience" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"role" varchar,
  	"company" varchar,
  	"years" varchar
  );
  
  CREATE TABLE "pages_blocks_profile" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'About',
  	"heading" varchar,
  	"body" jsonb,
  	"photo_id" integer,
  	"cv_id" integer,
  	"button_label" varchar DEFAULT 'Work with me',
  	"button_url" varchar DEFAULT '/#contact',
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"align" "enum_pages_blocks_rich_text_align" DEFAULT 'left',
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_media_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"width" "enum_pages_blocks_media_section_width" DEFAULT 'wide',
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"text" varchar,
  	"button_label" varchar DEFAULT 'Start a project',
  	"button_url" varchar DEFAULT '/#contact',
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Questions',
  	"heading" varchar DEFAULT 'Good to know',
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "_pages_v_blocks_hero_clients" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"trusted_text" varchar DEFAULT 'Trusted by {count}+ brands',
  	"headline" varchar,
  	"intro" varchar,
  	"cta_text" varchar DEFAULT 'Have a brief? Tell me about it.',
  	"button_label" varchar,
  	"button_url" varchar DEFAULT '#contact',
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_work_showcase" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Selected work',
  	"intro" varchar,
  	"show_wall" boolean DEFAULT true,
  	"link_label" varchar DEFAULT 'All projects',
  	"link_url" varchar DEFAULT '/work',
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar DEFAULT 'work',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_about_banner_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_about_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"greeting" varchar DEFAULT 'Hi, I’m',
  	"heading" varchar,
  	"photo_id" integer,
  	"big_name" varchar,
  	"link_label" varchar DEFAULT 'More about me',
  	"link_url" varchar DEFAULT '/about',
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar DEFAULT 'about',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_audience" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'This work is for you',
  	"lead" varchar DEFAULT 'if you’re a',
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar DEFAULT 'for-who',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_process" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'How it works',
  	"heading" varchar DEFAULT 'From first message to finished files in four steps',
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar DEFAULT 'process',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_services_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"price_from" numeric,
  	"currency" "enum__pages_v_blocks_services_items_currency" DEFAULT 'KES',
  	"unit" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'What I do',
  	"heading" varchar DEFAULT 'What I do',
  	"intro" varchar,
  	"show_whats_app" boolean DEFAULT true,
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar DEFAULT 'services',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"name" varchar,
  	"title" varchar,
  	"photo_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Honest words, real results',
  	"heading" varchar DEFAULT 'What clients say',
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Let’s talk',
  	"heading" varchar DEFAULT 'Have a brief? Let’s talk.',
  	"intro" varchar,
  	"show_availability" boolean DEFAULT true,
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar DEFAULT 'contact',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_project_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Work',
  	"intro" varchar,
  	"show_filters" boolean DEFAULT true,
  	"only_featured" boolean DEFAULT false,
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_profile_experience" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" varchar,
  	"company" varchar,
  	"years" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_profile" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'About',
  	"heading" varchar,
  	"body" jsonb,
  	"photo_id" integer,
  	"cv_id" integer,
  	"button_label" varchar DEFAULT 'Work with me',
  	"button_url" varchar DEFAULT '/#contact',
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"align" "enum__pages_v_blocks_rich_text_align" DEFAULT 'left',
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_media_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"width" "enum__pages_v_blocks_media_section_width" DEFAULT 'wide',
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"text" varchar,
  	"button_label" varchar DEFAULT 'Start a project',
  	"button_url" varchar DEFAULT '/#contact',
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Questions',
  	"heading" varchar DEFAULT 'Good to know',
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_pages_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "header_menu" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "header" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote_button_label" varchar DEFAULT 'Start a project' NOT NULL,
  	"quote_button_url" varchar DEFAULT '/#contact' NOT NULL,
  	"show_availability" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_header_v_version_menu" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_header_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_quote_button_label" varchar DEFAULT 'Start a project' NOT NULL,
  	"version_quote_button_url" varchar DEFAULT '/#contact' NOT NULL,
  	"version_show_availability" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"tagline" varchar,
  	"show_availability" boolean DEFAULT true,
  	"show_socials" boolean DEFAULT true,
  	"contact_show" boolean DEFAULT true,
  	"contact_heading" varchar DEFAULT 'Contact',
  	"contact_show_email" boolean DEFAULT true,
  	"contact_show_phone" boolean DEFAULT true,
  	"contact_show_whats_app" boolean DEFAULT true,
  	"copyright" varchar DEFAULT '© {year} {name}.',
  	"note" varchar DEFAULT 'Some client work is shown under NDA or with permission.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_footer_v_version_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v_version_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_title" varchar,
  	"version_tagline" varchar,
  	"version_show_availability" boolean DEFAULT true,
  	"version_show_socials" boolean DEFAULT true,
  	"version_contact_show" boolean DEFAULT true,
  	"version_contact_heading" varchar DEFAULT 'Contact',
  	"version_contact_show_email" boolean DEFAULT true,
  	"version_contact_show_phone" boolean DEFAULT true,
  	"version_contact_show_whats_app" boolean DEFAULT true,
  	"version_copyright" varchar DEFAULT '© {year} {name}.',
  	"version_note" varchar DEFAULT 'Some client work is shown under NDA or with permission.',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "home_clients" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_process" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v_version_clients" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v_version_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v_version_process" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v_version_services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v_version_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_experience" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_about_v_version_experience" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_about_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_about_v_texts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "home_clients" CASCADE;
  DROP TABLE "home_stats" CASCADE;
  DROP TABLE "home_process" CASCADE;
  DROP TABLE "home_services" CASCADE;
  DROP TABLE "home_testimonials" CASCADE;
  DROP TABLE "home" CASCADE;
  DROP TABLE "home_texts" CASCADE;
  DROP TABLE "home_rels" CASCADE;
  DROP TABLE "_home_v_version_clients" CASCADE;
  DROP TABLE "_home_v_version_stats" CASCADE;
  DROP TABLE "_home_v_version_process" CASCADE;
  DROP TABLE "_home_v_version_services" CASCADE;
  DROP TABLE "_home_v_version_testimonials" CASCADE;
  DROP TABLE "_home_v" CASCADE;
  DROP TABLE "_home_v_texts" CASCADE;
  DROP TABLE "_home_v_rels" CASCADE;
  DROP TABLE "about_experience" CASCADE;
  DROP TABLE "about" CASCADE;
  DROP TABLE "about_texts" CASCADE;
  DROP TABLE "_about_v_version_experience" CASCADE;
  DROP TABLE "_about_v" CASCADE;
  DROP TABLE "_about_v_texts" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "pages_blocks_hero_clients" ADD CONSTRAINT "pages_blocks_hero_clients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_work_showcase" ADD CONSTRAINT "pages_blocks_work_showcase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_about_banner_stats" ADD CONSTRAINT "pages_blocks_about_banner_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_about_banner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_about_banner" ADD CONSTRAINT "pages_blocks_about_banner_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_about_banner" ADD CONSTRAINT "pages_blocks_about_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_audience" ADD CONSTRAINT "pages_blocks_audience_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_process_steps" ADD CONSTRAINT "pages_blocks_process_steps_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_process_steps" ADD CONSTRAINT "pages_blocks_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_process" ADD CONSTRAINT "pages_blocks_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_services_items" ADD CONSTRAINT "pages_blocks_services_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_services_items" ADD CONSTRAINT "pages_blocks_services_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_services" ADD CONSTRAINT "pages_blocks_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials_items" ADD CONSTRAINT "pages_blocks_testimonials_items_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials_items" ADD CONSTRAINT "pages_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials" ADD CONSTRAINT "pages_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact" ADD CONSTRAINT "pages_blocks_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_project_grid" ADD CONSTRAINT "pages_blocks_project_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_profile_experience" ADD CONSTRAINT "pages_blocks_profile_experience_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_profile" ADD CONSTRAINT "pages_blocks_profile_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_profile" ADD CONSTRAINT "pages_blocks_profile_cv_id_media_id_fk" FOREIGN KEY ("cv_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_profile" ADD CONSTRAINT "pages_blocks_profile_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rich_text" ADD CONSTRAINT "pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_section" ADD CONSTRAINT "pages_blocks_media_section_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_section" ADD CONSTRAINT "pages_blocks_media_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_banner" ADD CONSTRAINT "pages_blocks_cta_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_items" ADD CONSTRAINT "pages_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq" ADD CONSTRAINT "pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_texts" ADD CONSTRAINT "pages_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_clients" ADD CONSTRAINT "_pages_v_blocks_hero_clients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_work_showcase" ADD CONSTRAINT "_pages_v_blocks_work_showcase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_about_banner_stats" ADD CONSTRAINT "_pages_v_blocks_about_banner_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_about_banner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_about_banner" ADD CONSTRAINT "_pages_v_blocks_about_banner_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_about_banner" ADD CONSTRAINT "_pages_v_blocks_about_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_audience" ADD CONSTRAINT "_pages_v_blocks_audience_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_process_steps" ADD CONSTRAINT "_pages_v_blocks_process_steps_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_process_steps" ADD CONSTRAINT "_pages_v_blocks_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_process" ADD CONSTRAINT "_pages_v_blocks_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_services_items" ADD CONSTRAINT "_pages_v_blocks_services_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_services_items" ADD CONSTRAINT "_pages_v_blocks_services_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_services" ADD CONSTRAINT "_pages_v_blocks_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials_items" ADD CONSTRAINT "_pages_v_blocks_testimonials_items_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials_items" ADD CONSTRAINT "_pages_v_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact" ADD CONSTRAINT "_pages_v_blocks_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_project_grid" ADD CONSTRAINT "_pages_v_blocks_project_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_profile_experience" ADD CONSTRAINT "_pages_v_blocks_profile_experience_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_profile" ADD CONSTRAINT "_pages_v_blocks_profile_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_profile" ADD CONSTRAINT "_pages_v_blocks_profile_cv_id_media_id_fk" FOREIGN KEY ("cv_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_profile" ADD CONSTRAINT "_pages_v_blocks_profile_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rich_text" ADD CONSTRAINT "_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_section" ADD CONSTRAINT "_pages_v_blocks_media_section_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_section" ADD CONSTRAINT "_pages_v_blocks_media_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_banner" ADD CONSTRAINT "_pages_v_blocks_cta_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_items" ADD CONSTRAINT "_pages_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq" ADD CONSTRAINT "_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_texts" ADD CONSTRAINT "_pages_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_menu" ADD CONSTRAINT "header_menu_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_header_v_version_menu" ADD CONSTRAINT "_header_v_version_menu_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_header_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_links" ADD CONSTRAINT "footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns" ADD CONSTRAINT "footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_columns_links" ADD CONSTRAINT "_footer_v_version_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v_version_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_columns" ADD CONSTRAINT "_footer_v_version_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_hero_clients_order_idx" ON "pages_blocks_hero_clients" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_clients_parent_id_idx" ON "pages_blocks_hero_clients" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_order_idx" ON "pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_work_showcase_order_idx" ON "pages_blocks_work_showcase" USING btree ("_order");
  CREATE INDEX "pages_blocks_work_showcase_parent_id_idx" ON "pages_blocks_work_showcase" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_work_showcase_path_idx" ON "pages_blocks_work_showcase" USING btree ("_path");
  CREATE INDEX "pages_blocks_about_banner_stats_order_idx" ON "pages_blocks_about_banner_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_about_banner_stats_parent_id_idx" ON "pages_blocks_about_banner_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_about_banner_order_idx" ON "pages_blocks_about_banner" USING btree ("_order");
  CREATE INDEX "pages_blocks_about_banner_parent_id_idx" ON "pages_blocks_about_banner" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_about_banner_path_idx" ON "pages_blocks_about_banner" USING btree ("_path");
  CREATE INDEX "pages_blocks_about_banner_photo_idx" ON "pages_blocks_about_banner" USING btree ("photo_id");
  CREATE INDEX "pages_blocks_audience_order_idx" ON "pages_blocks_audience" USING btree ("_order");
  CREATE INDEX "pages_blocks_audience_parent_id_idx" ON "pages_blocks_audience" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_audience_path_idx" ON "pages_blocks_audience" USING btree ("_path");
  CREATE INDEX "pages_blocks_process_steps_order_idx" ON "pages_blocks_process_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_process_steps_parent_id_idx" ON "pages_blocks_process_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_process_steps_image_idx" ON "pages_blocks_process_steps" USING btree ("image_id");
  CREATE INDEX "pages_blocks_process_order_idx" ON "pages_blocks_process" USING btree ("_order");
  CREATE INDEX "pages_blocks_process_parent_id_idx" ON "pages_blocks_process" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_process_path_idx" ON "pages_blocks_process" USING btree ("_path");
  CREATE INDEX "pages_blocks_services_items_order_idx" ON "pages_blocks_services_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_services_items_parent_id_idx" ON "pages_blocks_services_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_services_items_image_idx" ON "pages_blocks_services_items" USING btree ("image_id");
  CREATE INDEX "pages_blocks_services_order_idx" ON "pages_blocks_services" USING btree ("_order");
  CREATE INDEX "pages_blocks_services_parent_id_idx" ON "pages_blocks_services" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_services_path_idx" ON "pages_blocks_services" USING btree ("_path");
  CREATE INDEX "pages_blocks_testimonials_items_order_idx" ON "pages_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_items_parent_id_idx" ON "pages_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_items_photo_idx" ON "pages_blocks_testimonials_items" USING btree ("photo_id");
  CREATE INDEX "pages_blocks_testimonials_order_idx" ON "pages_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_parent_id_idx" ON "pages_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_path_idx" ON "pages_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "pages_blocks_contact_order_idx" ON "pages_blocks_contact" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_parent_id_idx" ON "pages_blocks_contact" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_path_idx" ON "pages_blocks_contact" USING btree ("_path");
  CREATE INDEX "pages_blocks_project_grid_order_idx" ON "pages_blocks_project_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_project_grid_parent_id_idx" ON "pages_blocks_project_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_project_grid_path_idx" ON "pages_blocks_project_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_profile_experience_order_idx" ON "pages_blocks_profile_experience" USING btree ("_order");
  CREATE INDEX "pages_blocks_profile_experience_parent_id_idx" ON "pages_blocks_profile_experience" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_profile_order_idx" ON "pages_blocks_profile" USING btree ("_order");
  CREATE INDEX "pages_blocks_profile_parent_id_idx" ON "pages_blocks_profile" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_profile_path_idx" ON "pages_blocks_profile" USING btree ("_path");
  CREATE INDEX "pages_blocks_profile_photo_idx" ON "pages_blocks_profile" USING btree ("photo_id");
  CREATE INDEX "pages_blocks_profile_cv_idx" ON "pages_blocks_profile" USING btree ("cv_id");
  CREATE INDEX "pages_blocks_rich_text_order_idx" ON "pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_rich_text_parent_id_idx" ON "pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_path_idx" ON "pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_section_order_idx" ON "pages_blocks_media_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_media_section_parent_id_idx" ON "pages_blocks_media_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_media_section_path_idx" ON "pages_blocks_media_section" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_section_media_idx" ON "pages_blocks_media_section" USING btree ("media_id");
  CREATE INDEX "pages_blocks_cta_banner_order_idx" ON "pages_blocks_cta_banner" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_banner_parent_id_idx" ON "pages_blocks_cta_banner" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_banner_path_idx" ON "pages_blocks_cta_banner" USING btree ("_path");
  CREATE INDEX "pages_blocks_faq_items_order_idx" ON "pages_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_items_parent_id_idx" ON "pages_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_order_idx" ON "pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_parent_id_idx" ON "pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_path_idx" ON "pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_texts_order_parent" ON "pages_texts" USING btree ("order","parent_id");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_projects_id_idx" ON "pages_rels" USING btree ("projects_id");
  CREATE INDEX "pages_rels_media_id_idx" ON "pages_rels" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_hero_clients_order_idx" ON "_pages_v_blocks_hero_clients" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_clients_parent_id_idx" ON "_pages_v_blocks_hero_clients" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_order_idx" ON "_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_parent_id_idx" ON "_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_path_idx" ON "_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_work_showcase_order_idx" ON "_pages_v_blocks_work_showcase" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_work_showcase_parent_id_idx" ON "_pages_v_blocks_work_showcase" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_work_showcase_path_idx" ON "_pages_v_blocks_work_showcase" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_about_banner_stats_order_idx" ON "_pages_v_blocks_about_banner_stats" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_about_banner_stats_parent_id_idx" ON "_pages_v_blocks_about_banner_stats" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_about_banner_order_idx" ON "_pages_v_blocks_about_banner" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_about_banner_parent_id_idx" ON "_pages_v_blocks_about_banner" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_about_banner_path_idx" ON "_pages_v_blocks_about_banner" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_about_banner_photo_idx" ON "_pages_v_blocks_about_banner" USING btree ("photo_id");
  CREATE INDEX "_pages_v_blocks_audience_order_idx" ON "_pages_v_blocks_audience" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_audience_parent_id_idx" ON "_pages_v_blocks_audience" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_audience_path_idx" ON "_pages_v_blocks_audience" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_process_steps_order_idx" ON "_pages_v_blocks_process_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_process_steps_parent_id_idx" ON "_pages_v_blocks_process_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_process_steps_image_idx" ON "_pages_v_blocks_process_steps" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_process_order_idx" ON "_pages_v_blocks_process" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_process_parent_id_idx" ON "_pages_v_blocks_process" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_process_path_idx" ON "_pages_v_blocks_process" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_services_items_order_idx" ON "_pages_v_blocks_services_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_services_items_parent_id_idx" ON "_pages_v_blocks_services_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_services_items_image_idx" ON "_pages_v_blocks_services_items" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_services_order_idx" ON "_pages_v_blocks_services" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_services_parent_id_idx" ON "_pages_v_blocks_services" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_services_path_idx" ON "_pages_v_blocks_services" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_testimonials_items_order_idx" ON "_pages_v_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_items_parent_id_idx" ON "_pages_v_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_items_photo_idx" ON "_pages_v_blocks_testimonials_items" USING btree ("photo_id");
  CREATE INDEX "_pages_v_blocks_testimonials_order_idx" ON "_pages_v_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_parent_id_idx" ON "_pages_v_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_path_idx" ON "_pages_v_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contact_order_idx" ON "_pages_v_blocks_contact" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_parent_id_idx" ON "_pages_v_blocks_contact" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_path_idx" ON "_pages_v_blocks_contact" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_project_grid_order_idx" ON "_pages_v_blocks_project_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_project_grid_parent_id_idx" ON "_pages_v_blocks_project_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_project_grid_path_idx" ON "_pages_v_blocks_project_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_profile_experience_order_idx" ON "_pages_v_blocks_profile_experience" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_profile_experience_parent_id_idx" ON "_pages_v_blocks_profile_experience" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_profile_order_idx" ON "_pages_v_blocks_profile" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_profile_parent_id_idx" ON "_pages_v_blocks_profile" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_profile_path_idx" ON "_pages_v_blocks_profile" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_profile_photo_idx" ON "_pages_v_blocks_profile" USING btree ("photo_id");
  CREATE INDEX "_pages_v_blocks_profile_cv_idx" ON "_pages_v_blocks_profile" USING btree ("cv_id");
  CREATE INDEX "_pages_v_blocks_rich_text_order_idx" ON "_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_rich_text_parent_id_idx" ON "_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_path_idx" ON "_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_section_order_idx" ON "_pages_v_blocks_media_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_media_section_parent_id_idx" ON "_pages_v_blocks_media_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_media_section_path_idx" ON "_pages_v_blocks_media_section" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_section_media_idx" ON "_pages_v_blocks_media_section" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_cta_banner_order_idx" ON "_pages_v_blocks_cta_banner" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_banner_parent_id_idx" ON "_pages_v_blocks_cta_banner" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_banner_path_idx" ON "_pages_v_blocks_cta_banner" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_faq_items_order_idx" ON "_pages_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_items_parent_id_idx" ON "_pages_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_order_idx" ON "_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_parent_id_idx" ON "_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_path_idx" ON "_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_texts_order_parent" ON "_pages_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_projects_id_idx" ON "_pages_v_rels" USING btree ("projects_id");
  CREATE INDEX "_pages_v_rels_media_id_idx" ON "_pages_v_rels" USING btree ("media_id");
  CREATE INDEX "header_menu_order_idx" ON "header_menu" USING btree ("_order");
  CREATE INDEX "header_menu_parent_id_idx" ON "header_menu" USING btree ("_parent_id");
  CREATE INDEX "_header_v_version_menu_order_idx" ON "_header_v_version_menu" USING btree ("_order");
  CREATE INDEX "_header_v_version_menu_parent_id_idx" ON "_header_v_version_menu" USING btree ("_parent_id");
  CREATE INDEX "_header_v_created_at_idx" ON "_header_v" USING btree ("created_at");
  CREATE INDEX "_header_v_updated_at_idx" ON "_header_v" USING btree ("updated_at");
  CREATE INDEX "footer_columns_links_order_idx" ON "footer_columns_links" USING btree ("_order");
  CREATE INDEX "footer_columns_links_parent_id_idx" ON "footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "footer_columns_order_idx" ON "footer_columns" USING btree ("_order");
  CREATE INDEX "footer_columns_parent_id_idx" ON "footer_columns" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_columns_links_order_idx" ON "_footer_v_version_columns_links" USING btree ("_order");
  CREATE INDEX "_footer_v_version_columns_links_parent_id_idx" ON "_footer_v_version_columns_links" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_columns_order_idx" ON "_footer_v_version_columns" USING btree ("_order");
  CREATE INDEX "_footer_v_version_columns_parent_id_idx" ON "_footer_v_version_columns" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_created_at_idx" ON "_footer_v" USING btree ("created_at");
  CREATE INDEX "_footer_v_updated_at_idx" ON "_footer_v" USING btree ("updated_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  ALTER TABLE "site" DROP COLUMN "cta_label";
  ALTER TABLE "site" DROP COLUMN "footer_note";
  DROP TYPE "public"."enum_home_services_currency";
  DROP TYPE "public"."enum_home_status";
  DROP TYPE "public"."enum__home_v_version_services_currency";
  DROP TYPE "public"."enum__home_v_version_status";
  DROP TYPE "public"."enum_about_status";
  DROP TYPE "public"."enum__about_v_version_status";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_home_services_currency" AS ENUM('KES', 'USD');
  CREATE TYPE "public"."enum_home_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__home_v_version_services_currency" AS ENUM('KES', 'USD');
  CREATE TYPE "public"."enum__home_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_about_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__about_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "home_clients" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"url" varchar,
  	"logo_id" integer
  );
  
  CREATE TABLE "home_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "home_process" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "home_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"price_from" numeric,
  	"currency" "enum_home_services_currency" DEFAULT 'KES',
  	"unit" varchar
  );
  
  CREATE TABLE "home_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"name" varchar,
  	"title" varchar,
  	"photo_id" integer
  );
  
  CREATE TABLE "home" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"intro" varchar,
  	"hero_cta_text" varchar DEFAULT 'Have a brief? Tell me about it.',
  	"trusted_text" varchar DEFAULT 'Trusted by {count}+ brands',
  	"work_heading" varchar DEFAULT 'Selected work',
  	"work_intro" varchar,
  	"work_link_label" varchar DEFAULT 'All projects',
  	"about_greeting" varchar DEFAULT 'Hi, I’m',
  	"about_link_label" varchar DEFAULT 'More about me',
  	"roles_heading" varchar DEFAULT 'This work is for you',
  	"roles_lead" varchar DEFAULT 'if you’re a',
  	"process_eyebrow" varchar DEFAULT 'How it works',
  	"process_heading" varchar DEFAULT 'From first message to finished files in four steps',
  	"services_eyebrow" varchar DEFAULT 'What I do',
  	"services_heading" varchar DEFAULT 'What I do',
  	"services_intro" varchar,
  	"testimonials_eyebrow" varchar DEFAULT 'Honest words, real results',
  	"testimonials_heading" varchar DEFAULT 'What clients say',
  	"contact_eyebrow" varchar DEFAULT 'Let’s talk',
  	"contact_heading" varchar DEFAULT 'Have a brief? Let’s talk.',
  	"contact_intro" varchar,
  	"_status" "enum_home_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "home_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_home_v_version_clients" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"url" varchar,
  	"logo_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_process" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"price_from" numeric,
  	"currency" "enum__home_v_version_services_currency" DEFAULT 'KES',
  	"unit" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"name" varchar,
  	"title" varchar,
  	"photo_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_headline" varchar,
  	"version_intro" varchar,
  	"version_hero_cta_text" varchar DEFAULT 'Have a brief? Tell me about it.',
  	"version_trusted_text" varchar DEFAULT 'Trusted by {count}+ brands',
  	"version_work_heading" varchar DEFAULT 'Selected work',
  	"version_work_intro" varchar,
  	"version_work_link_label" varchar DEFAULT 'All projects',
  	"version_about_greeting" varchar DEFAULT 'Hi, I’m',
  	"version_about_link_label" varchar DEFAULT 'More about me',
  	"version_roles_heading" varchar DEFAULT 'This work is for you',
  	"version_roles_lead" varchar DEFAULT 'if you’re a',
  	"version_process_eyebrow" varchar DEFAULT 'How it works',
  	"version_process_heading" varchar DEFAULT 'From first message to finished files in four steps',
  	"version_services_eyebrow" varchar DEFAULT 'What I do',
  	"version_services_heading" varchar DEFAULT 'What I do',
  	"version_services_intro" varchar,
  	"version_testimonials_eyebrow" varchar DEFAULT 'Honest words, real results',
  	"version_testimonials_heading" varchar DEFAULT 'What clients say',
  	"version_contact_eyebrow" varchar DEFAULT 'Let’s talk',
  	"version_contact_heading" varchar DEFAULT 'Have a brief? Let’s talk.',
  	"version_contact_intro" varchar,
  	"version__status" "enum__home_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_home_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_home_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "about_experience" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"role" varchar,
  	"company" varchar,
  	"years" varchar
  );
  
  CREATE TABLE "about" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"photo_id" integer,
  	"short" varchar,
  	"body" jsonb,
  	"cv_id" integer,
  	"_status" "enum_about_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "about_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_about_v_version_experience" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" varchar,
  	"company" varchar,
  	"years" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_about_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_headline" varchar,
  	"version_photo_id" integer,
  	"version_short" varchar,
  	"version_body" jsonb,
  	"version_cv_id" integer,
  	"version__status" "enum__about_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_about_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "pages_blocks_hero_clients" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_work_showcase" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_about_banner_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_about_banner" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_audience" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_process_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_process" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_services_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_testimonials_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_contact" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_project_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_profile_experience" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_profile" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_media_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cta_banner" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_hero_clients" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_work_showcase" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_about_banner_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_about_banner" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_audience" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_process_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_process" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_services_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_testimonials_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_contact" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_project_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_profile_experience" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_profile" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_media_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cta_banner" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header_menu" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_header_v_version_menu" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_header_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_columns_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_columns_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_hero_clients" CASCADE;
  DROP TABLE "pages_blocks_hero" CASCADE;
  DROP TABLE "pages_blocks_work_showcase" CASCADE;
  DROP TABLE "pages_blocks_about_banner_stats" CASCADE;
  DROP TABLE "pages_blocks_about_banner" CASCADE;
  DROP TABLE "pages_blocks_audience" CASCADE;
  DROP TABLE "pages_blocks_process_steps" CASCADE;
  DROP TABLE "pages_blocks_process" CASCADE;
  DROP TABLE "pages_blocks_services_items" CASCADE;
  DROP TABLE "pages_blocks_services" CASCADE;
  DROP TABLE "pages_blocks_testimonials_items" CASCADE;
  DROP TABLE "pages_blocks_testimonials" CASCADE;
  DROP TABLE "pages_blocks_contact" CASCADE;
  DROP TABLE "pages_blocks_project_grid" CASCADE;
  DROP TABLE "pages_blocks_profile_experience" CASCADE;
  DROP TABLE "pages_blocks_profile" CASCADE;
  DROP TABLE "pages_blocks_rich_text" CASCADE;
  DROP TABLE "pages_blocks_media_section" CASCADE;
  DROP TABLE "pages_blocks_cta_banner" CASCADE;
  DROP TABLE "pages_blocks_faq_items" CASCADE;
  DROP TABLE "pages_blocks_faq" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_texts" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_clients" CASCADE;
  DROP TABLE "_pages_v_blocks_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_work_showcase" CASCADE;
  DROP TABLE "_pages_v_blocks_about_banner_stats" CASCADE;
  DROP TABLE "_pages_v_blocks_about_banner" CASCADE;
  DROP TABLE "_pages_v_blocks_audience" CASCADE;
  DROP TABLE "_pages_v_blocks_process_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_process" CASCADE;
  DROP TABLE "_pages_v_blocks_services_items" CASCADE;
  DROP TABLE "_pages_v_blocks_services" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials_items" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials" CASCADE;
  DROP TABLE "_pages_v_blocks_contact" CASCADE;
  DROP TABLE "_pages_v_blocks_project_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_profile_experience" CASCADE;
  DROP TABLE "_pages_v_blocks_profile" CASCADE;
  DROP TABLE "_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "_pages_v_blocks_media_section" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_banner" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_items" CASCADE;
  DROP TABLE "_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_texts" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "header_menu" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "_header_v_version_menu" CASCADE;
  DROP TABLE "_header_v" CASCADE;
  DROP TABLE "footer_columns_links" CASCADE;
  DROP TABLE "footer_columns" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "_footer_v_version_columns_links" CASCADE;
  DROP TABLE "_footer_v_version_columns" CASCADE;
  DROP TABLE "_footer_v" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pages_fk";
  
  DROP INDEX "payload_locked_documents_rels_pages_id_idx";
  ALTER TABLE "site" ADD COLUMN "cta_label" varchar DEFAULT 'Start a project';
  ALTER TABLE "site" ADD COLUMN "footer_note" varchar DEFAULT 'Some client work is shown under NDA or with permission.';
  ALTER TABLE "home_clients" ADD CONSTRAINT "home_clients_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_clients" ADD CONSTRAINT "home_clients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_stats" ADD CONSTRAINT "home_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_process" ADD CONSTRAINT "home_process_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_process" ADD CONSTRAINT "home_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_services" ADD CONSTRAINT "home_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_testimonials" ADD CONSTRAINT "home_testimonials_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_testimonials" ADD CONSTRAINT "home_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_texts" ADD CONSTRAINT "home_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_clients" ADD CONSTRAINT "_home_v_version_clients_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_version_clients" ADD CONSTRAINT "_home_v_version_clients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_stats" ADD CONSTRAINT "_home_v_version_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_process" ADD CONSTRAINT "_home_v_version_process_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_version_process" ADD CONSTRAINT "_home_v_version_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_services" ADD CONSTRAINT "_home_v_version_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_testimonials" ADD CONSTRAINT "_home_v_version_testimonials_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_version_testimonials" ADD CONSTRAINT "_home_v_version_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_texts" ADD CONSTRAINT "_home_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_experience" ADD CONSTRAINT "about_experience_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about" ADD CONSTRAINT "about_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about" ADD CONSTRAINT "about_cv_id_media_id_fk" FOREIGN KEY ("cv_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_texts" ADD CONSTRAINT "about_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_v_version_experience" ADD CONSTRAINT "_about_v_version_experience_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_v" ADD CONSTRAINT "_about_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_about_v" ADD CONSTRAINT "_about_v_version_cv_id_media_id_fk" FOREIGN KEY ("version_cv_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_about_v_texts" ADD CONSTRAINT "_about_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_about_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_clients_order_idx" ON "home_clients" USING btree ("_order");
  CREATE INDEX "home_clients_parent_id_idx" ON "home_clients" USING btree ("_parent_id");
  CREATE INDEX "home_clients_logo_idx" ON "home_clients" USING btree ("logo_id");
  CREATE INDEX "home_stats_order_idx" ON "home_stats" USING btree ("_order");
  CREATE INDEX "home_stats_parent_id_idx" ON "home_stats" USING btree ("_parent_id");
  CREATE INDEX "home_process_order_idx" ON "home_process" USING btree ("_order");
  CREATE INDEX "home_process_parent_id_idx" ON "home_process" USING btree ("_parent_id");
  CREATE INDEX "home_process_image_idx" ON "home_process" USING btree ("image_id");
  CREATE INDEX "home_services_order_idx" ON "home_services" USING btree ("_order");
  CREATE INDEX "home_services_parent_id_idx" ON "home_services" USING btree ("_parent_id");
  CREATE INDEX "home_testimonials_order_idx" ON "home_testimonials" USING btree ("_order");
  CREATE INDEX "home_testimonials_parent_id_idx" ON "home_testimonials" USING btree ("_parent_id");
  CREATE INDEX "home_testimonials_photo_idx" ON "home_testimonials" USING btree ("photo_id");
  CREATE INDEX "home__status_idx" ON "home" USING btree ("_status");
  CREATE INDEX "home_texts_order_parent" ON "home_texts" USING btree ("order","parent_id");
  CREATE INDEX "home_rels_order_idx" ON "home_rels" USING btree ("order");
  CREATE INDEX "home_rels_parent_idx" ON "home_rels" USING btree ("parent_id");
  CREATE INDEX "home_rels_path_idx" ON "home_rels" USING btree ("path");
  CREATE INDEX "home_rels_media_id_idx" ON "home_rels" USING btree ("media_id");
  CREATE INDEX "_home_v_version_clients_order_idx" ON "_home_v_version_clients" USING btree ("_order");
  CREATE INDEX "_home_v_version_clients_parent_id_idx" ON "_home_v_version_clients" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_clients_logo_idx" ON "_home_v_version_clients" USING btree ("logo_id");
  CREATE INDEX "_home_v_version_stats_order_idx" ON "_home_v_version_stats" USING btree ("_order");
  CREATE INDEX "_home_v_version_stats_parent_id_idx" ON "_home_v_version_stats" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_process_order_idx" ON "_home_v_version_process" USING btree ("_order");
  CREATE INDEX "_home_v_version_process_parent_id_idx" ON "_home_v_version_process" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_process_image_idx" ON "_home_v_version_process" USING btree ("image_id");
  CREATE INDEX "_home_v_version_services_order_idx" ON "_home_v_version_services" USING btree ("_order");
  CREATE INDEX "_home_v_version_services_parent_id_idx" ON "_home_v_version_services" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_testimonials_order_idx" ON "_home_v_version_testimonials" USING btree ("_order");
  CREATE INDEX "_home_v_version_testimonials_parent_id_idx" ON "_home_v_version_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_testimonials_photo_idx" ON "_home_v_version_testimonials" USING btree ("photo_id");
  CREATE INDEX "_home_v_version_version__status_idx" ON "_home_v" USING btree ("version__status");
  CREATE INDEX "_home_v_created_at_idx" ON "_home_v" USING btree ("created_at");
  CREATE INDEX "_home_v_updated_at_idx" ON "_home_v" USING btree ("updated_at");
  CREATE INDEX "_home_v_latest_idx" ON "_home_v" USING btree ("latest");
  CREATE INDEX "_home_v_autosave_idx" ON "_home_v" USING btree ("autosave");
  CREATE INDEX "_home_v_texts_order_parent" ON "_home_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_home_v_rels_order_idx" ON "_home_v_rels" USING btree ("order");
  CREATE INDEX "_home_v_rels_parent_idx" ON "_home_v_rels" USING btree ("parent_id");
  CREATE INDEX "_home_v_rels_path_idx" ON "_home_v_rels" USING btree ("path");
  CREATE INDEX "_home_v_rels_media_id_idx" ON "_home_v_rels" USING btree ("media_id");
  CREATE INDEX "about_experience_order_idx" ON "about_experience" USING btree ("_order");
  CREATE INDEX "about_experience_parent_id_idx" ON "about_experience" USING btree ("_parent_id");
  CREATE INDEX "about_photo_idx" ON "about" USING btree ("photo_id");
  CREATE INDEX "about_cv_idx" ON "about" USING btree ("cv_id");
  CREATE INDEX "about__status_idx" ON "about" USING btree ("_status");
  CREATE INDEX "about_texts_order_parent" ON "about_texts" USING btree ("order","parent_id");
  CREATE INDEX "_about_v_version_experience_order_idx" ON "_about_v_version_experience" USING btree ("_order");
  CREATE INDEX "_about_v_version_experience_parent_id_idx" ON "_about_v_version_experience" USING btree ("_parent_id");
  CREATE INDEX "_about_v_version_version_photo_idx" ON "_about_v" USING btree ("version_photo_id");
  CREATE INDEX "_about_v_version_version_cv_idx" ON "_about_v" USING btree ("version_cv_id");
  CREATE INDEX "_about_v_version_version__status_idx" ON "_about_v" USING btree ("version__status");
  CREATE INDEX "_about_v_created_at_idx" ON "_about_v" USING btree ("created_at");
  CREATE INDEX "_about_v_updated_at_idx" ON "_about_v" USING btree ("updated_at");
  CREATE INDEX "_about_v_latest_idx" ON "_about_v" USING btree ("latest");
  CREATE INDEX "_about_v_autosave_idx" ON "_about_v" USING btree ("autosave");
  CREATE INDEX "_about_v_texts_order_parent" ON "_about_v_texts" USING btree ("order","parent_id");
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pages_id";
  DROP TYPE "public"."enum_pages_blocks_services_items_currency";
  DROP TYPE "public"."enum_pages_blocks_rich_text_align";
  DROP TYPE "public"."enum_pages_blocks_media_section_width";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_services_items_currency";
  DROP TYPE "public"."enum__pages_v_blocks_rich_text_align";
  DROP TYPE "public"."enum__pages_v_blocks_media_section_width";
  DROP TYPE "public"."enum__pages_v_version_status";`)
}
