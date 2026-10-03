import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_services_currency" AS ENUM('KES', 'USD');
  CREATE TYPE "public"."enum_services_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_version_currency" AS ENUM('KES', 'USD');
  CREATE TYPE "public"."enum__services_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "services_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "services_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"title" varchar,
  	"description" varchar,
  	"price_from" numeric,
  	"currency" "enum_services_currency" DEFAULT 'KES',
  	"unit" varchar,
  	"image_id" integer,
  	"image_caption" varchar,
  	"featured" boolean,
  	"starter" boolean,
  	"intro" varchar,
  	"timeline" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_services_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "services_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "services_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer
  );
  
  CREATE TABLE "_services_v_version_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_title" varchar,
  	"version_description" varchar,
  	"version_price_from" numeric,
  	"version_currency" "enum__services_v_version_currency" DEFAULT 'KES',
  	"version_unit" varchar,
  	"version_image_id" integer,
  	"version_image_caption" varchar,
  	"version_featured" boolean,
  	"version_starter" boolean,
  	"version_intro" varchar,
  	"version_timeline" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__services_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_services_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_services_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer
  );
  
  ALTER TABLE "footer_columns_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_columns_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_columns" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "footer_columns_links" CASCADE;
  DROP TABLE "footer_columns" CASCADE;
  DROP TABLE "_footer_v_version_columns_links" CASCADE;
  DROP TABLE "_footer_v_version_columns" CASCADE;
  ALTER TABLE "theme" ALTER COLUMN "background" SET DEFAULT '#0F0F0F';
  ALTER TABLE "theme" ALTER COLUMN "surface" SET DEFAULT '#1A1A1E';
  ALTER TABLE "theme" ALTER COLUMN "text" SET DEFAULT '#F7F7F5';
  ALTER TABLE "theme" ALTER COLUMN "muted_text" SET DEFAULT '#A6A6B0';
  ALTER TABLE "theme" ALTER COLUMN "accent" SET DEFAULT '#0F0F0F';
  ALTER TABLE "theme" ALTER COLUMN "accent2" SET DEFAULT '#5A5A63';
  ALTER TABLE "theme" ALTER COLUMN "light_background" SET DEFAULT '#FFFFFF';
  ALTER TABLE "theme" ALTER COLUMN "light_surface" SET DEFAULT '#F7F7F5';
  ALTER TABLE "theme" ALTER COLUMN "light_text" SET DEFAULT '#0F0F0F';
  ALTER TABLE "theme" ALTER COLUMN "glow" SET DEFAULT false;
  ALTER TABLE "theme" ALTER COLUMN "heading_font" SET DEFAULT 'Manrope';
  ALTER TABLE "theme" ALTER COLUMN "body_font" SET DEFAULT 'Manrope';
  ALTER TABLE "theme" ALTER COLUMN "button_background" SET DEFAULT '#F7F7F5';
  ALTER TABLE "theme" ALTER COLUMN "button_text" SET DEFAULT '#0F0F0F';
  ALTER TABLE "theme" ALTER COLUMN "button_dark_background" SET DEFAULT '#0F0F0F';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_background" SET DEFAULT '#0F0F0F';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_surface" SET DEFAULT '#1A1A1E';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_text" SET DEFAULT '#F7F7F5';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_muted_text" SET DEFAULT '#A6A6B0';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_accent" SET DEFAULT '#0F0F0F';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_accent2" SET DEFAULT '#5A5A63';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_light_background" SET DEFAULT '#FFFFFF';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_light_surface" SET DEFAULT '#F7F7F5';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_light_text" SET DEFAULT '#0F0F0F';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_glow" SET DEFAULT false;
  ALTER TABLE "_theme_v" ALTER COLUMN "version_heading_font" SET DEFAULT 'Manrope';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_body_font" SET DEFAULT 'Manrope';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_button_background" SET DEFAULT '#F7F7F5';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_button_text" SET DEFAULT '#0F0F0F';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_button_dark_background" SET DEFAULT '#0F0F0F';
  ALTER TABLE "pages_blocks_services" ADD COLUMN "page_link_label" varchar DEFAULT 'See the service';
  ALTER TABLE "pages_blocks_contact" ADD COLUMN "form_service_label" varchar;
  ALTER TABLE "pages_blocks_contact" ADD COLUMN "form_submit_label" varchar;
  ALTER TABLE "pages_blocks_contact" ADD COLUMN "form_message_placeholder" varchar;
  ALTER TABLE "pages_blocks_contact" ADD COLUMN "form_success_text" varchar;
  ALTER TABLE "pages_blocks_contact" ADD COLUMN "form_privacy_note" varchar DEFAULT 'Your details are only used to reply to you.';
  ALTER TABLE "pages_blocks_contact" ADD COLUMN "form_privacy_url" varchar DEFAULT '/cookies';
  ALTER TABLE "pages_rels" ADD COLUMN "services_id" integer;
  ALTER TABLE "_pages_v_blocks_services" ADD COLUMN "page_link_label" varchar DEFAULT 'See the service';
  ALTER TABLE "_pages_v_blocks_contact" ADD COLUMN "form_service_label" varchar;
  ALTER TABLE "_pages_v_blocks_contact" ADD COLUMN "form_submit_label" varchar;
  ALTER TABLE "_pages_v_blocks_contact" ADD COLUMN "form_message_placeholder" varchar;
  ALTER TABLE "_pages_v_blocks_contact" ADD COLUMN "form_success_text" varchar;
  ALTER TABLE "_pages_v_blocks_contact" ADD COLUMN "form_privacy_note" varchar DEFAULT 'Your details are only used to reply to you.';
  ALTER TABLE "_pages_v_blocks_contact" ADD COLUMN "form_privacy_url" varchar DEFAULT '/cookies';
  ALTER TABLE "_pages_v_rels" ADD COLUMN "services_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "services_id" integer;
  ALTER TABLE "header" ADD COLUMN "quote_button_show" boolean DEFAULT false;
  ALTER TABLE "_header_v" ADD COLUMN "version_quote_button_show" boolean DEFAULT false;
  ALTER TABLE "services_steps" ADD CONSTRAINT "services_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_faqs" ADD CONSTRAINT "services_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_texts" ADD CONSTRAINT "services_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_steps" ADD CONSTRAINT "_services_v_version_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_faqs" ADD CONSTRAINT "_services_v_version_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_parent_id_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_texts" ADD CONSTRAINT "_services_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "services_steps_order_idx" ON "services_steps" USING btree ("_order");
  CREATE INDEX "services_steps_parent_id_idx" ON "services_steps" USING btree ("_parent_id");
  CREATE INDEX "services_faqs_order_idx" ON "services_faqs" USING btree ("_order");
  CREATE INDEX "services_faqs_parent_id_idx" ON "services_faqs" USING btree ("_parent_id");
  CREATE INDEX "services__order_idx" ON "services" USING btree ("_order");
  CREATE INDEX "services_image_idx" ON "services" USING btree ("image_id");
  CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE INDEX "services__status_idx" ON "services" USING btree ("_status");
  CREATE INDEX "services_texts_order_parent" ON "services_texts" USING btree ("order","parent_id");
  CREATE INDEX "services_rels_order_idx" ON "services_rels" USING btree ("order");
  CREATE INDEX "services_rels_parent_idx" ON "services_rels" USING btree ("parent_id");
  CREATE INDEX "services_rels_path_idx" ON "services_rels" USING btree ("path");
  CREATE INDEX "services_rels_projects_id_idx" ON "services_rels" USING btree ("projects_id");
  CREATE INDEX "_services_v_version_steps_order_idx" ON "_services_v_version_steps" USING btree ("_order");
  CREATE INDEX "_services_v_version_steps_parent_id_idx" ON "_services_v_version_steps" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_faqs_order_idx" ON "_services_v_version_faqs" USING btree ("_order");
  CREATE INDEX "_services_v_version_faqs_parent_id_idx" ON "_services_v_version_faqs" USING btree ("_parent_id");
  CREATE INDEX "_services_v_parent_idx" ON "_services_v" USING btree ("parent_id");
  CREATE INDEX "_services_v_version_version__order_idx" ON "_services_v" USING btree ("version__order");
  CREATE INDEX "_services_v_version_version_image_idx" ON "_services_v" USING btree ("version_image_id");
  CREATE INDEX "_services_v_version_version_slug_idx" ON "_services_v" USING btree ("version_slug");
  CREATE INDEX "_services_v_version_version_updated_at_idx" ON "_services_v" USING btree ("version_updated_at");
  CREATE INDEX "_services_v_version_version_created_at_idx" ON "_services_v" USING btree ("version_created_at");
  CREATE INDEX "_services_v_version_version__status_idx" ON "_services_v" USING btree ("version__status");
  CREATE INDEX "_services_v_created_at_idx" ON "_services_v" USING btree ("created_at");
  CREATE INDEX "_services_v_updated_at_idx" ON "_services_v" USING btree ("updated_at");
  CREATE INDEX "_services_v_latest_idx" ON "_services_v" USING btree ("latest");
  CREATE INDEX "_services_v_autosave_idx" ON "_services_v" USING btree ("autosave");
  CREATE INDEX "_services_v_texts_order_parent" ON "_services_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_services_v_rels_order_idx" ON "_services_v_rels" USING btree ("order");
  CREATE INDEX "_services_v_rels_parent_idx" ON "_services_v_rels" USING btree ("parent_id");
  CREATE INDEX "_services_v_rels_path_idx" ON "_services_v_rels" USING btree ("path");
  CREATE INDEX "_services_v_rels_projects_id_idx" ON "_services_v_rels" USING btree ("projects_id");
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rels_services_id_idx" ON "pages_rels" USING btree ("services_id");
  CREATE INDEX "_pages_v_rels_services_id_idx" ON "_pages_v_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  ALTER TABLE "footer" DROP COLUMN "contact_show";
  ALTER TABLE "footer" DROP COLUMN "contact_heading";
  ALTER TABLE "footer" DROP COLUMN "contact_show_email";
  ALTER TABLE "footer" DROP COLUMN "contact_show_phone";
  ALTER TABLE "footer" DROP COLUMN "contact_show_whats_app";
  ALTER TABLE "_footer_v" DROP COLUMN "version_contact_show";
  ALTER TABLE "_footer_v" DROP COLUMN "version_contact_heading";
  ALTER TABLE "_footer_v" DROP COLUMN "version_contact_show_email";
  ALTER TABLE "_footer_v" DROP COLUMN "version_contact_show_phone";
  ALTER TABLE "_footer_v" DROP COLUMN "version_contact_show_whats_app";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
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
  
  ALTER TABLE "services_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "services_steps" CASCADE;
  DROP TABLE "services_faqs" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "services_texts" CASCADE;
  DROP TABLE "services_rels" CASCADE;
  DROP TABLE "_services_v_version_steps" CASCADE;
  DROP TABLE "_services_v_version_faqs" CASCADE;
  DROP TABLE "_services_v" CASCADE;
  DROP TABLE "_services_v_texts" CASCADE;
  DROP TABLE "_services_v_rels" CASCADE;
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_services_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_services_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_services_fk";
  
  DROP INDEX "pages_rels_services_id_idx";
  DROP INDEX "_pages_v_rels_services_id_idx";
  DROP INDEX "payload_locked_documents_rels_services_id_idx";
  ALTER TABLE "theme" ALTER COLUMN "background" SET DEFAULT '#000000';
  ALTER TABLE "theme" ALTER COLUMN "surface" SET DEFAULT '#131313';
  ALTER TABLE "theme" ALTER COLUMN "text" SET DEFAULT '#F5F5F4';
  ALTER TABLE "theme" ALTER COLUMN "muted_text" SET DEFAULT '#E2E8F0';
  ALTER TABLE "theme" ALTER COLUMN "accent" SET DEFAULT '#E8352B';
  ALTER TABLE "theme" ALTER COLUMN "accent2" SET DEFAULT '#FF6A2B';
  ALTER TABLE "theme" ALTER COLUMN "light_background" SET DEFAULT '#F2F2F1';
  ALTER TABLE "theme" ALTER COLUMN "light_surface" SET DEFAULT '#FFFFFF';
  ALTER TABLE "theme" ALTER COLUMN "light_text" SET DEFAULT '#0A0A0A';
  ALTER TABLE "theme" ALTER COLUMN "glow" SET DEFAULT true;
  ALTER TABLE "theme" ALTER COLUMN "heading_font" SET DEFAULT 'Geist';
  ALTER TABLE "theme" ALTER COLUMN "body_font" SET DEFAULT 'Geist';
  ALTER TABLE "theme" ALTER COLUMN "button_background" SET DEFAULT '#FFFFFF';
  ALTER TABLE "theme" ALTER COLUMN "button_text" SET DEFAULT '#0A0A0A';
  ALTER TABLE "theme" ALTER COLUMN "button_dark_background" SET DEFAULT '#0A0A0A';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_background" SET DEFAULT '#000000';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_surface" SET DEFAULT '#131313';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_text" SET DEFAULT '#F5F5F4';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_muted_text" SET DEFAULT '#E2E8F0';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_accent" SET DEFAULT '#E8352B';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_accent2" SET DEFAULT '#FF6A2B';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_light_background" SET DEFAULT '#F2F2F1';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_light_surface" SET DEFAULT '#FFFFFF';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_light_text" SET DEFAULT '#0A0A0A';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_glow" SET DEFAULT true;
  ALTER TABLE "_theme_v" ALTER COLUMN "version_heading_font" SET DEFAULT 'Geist';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_body_font" SET DEFAULT 'Geist';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_button_background" SET DEFAULT '#FFFFFF';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_button_text" SET DEFAULT '#0A0A0A';
  ALTER TABLE "_theme_v" ALTER COLUMN "version_button_dark_background" SET DEFAULT '#0A0A0A';
  ALTER TABLE "footer" ADD COLUMN "contact_show" boolean DEFAULT true;
  ALTER TABLE "footer" ADD COLUMN "contact_heading" varchar DEFAULT 'Contact';
  ALTER TABLE "footer" ADD COLUMN "contact_show_email" boolean DEFAULT true;
  ALTER TABLE "footer" ADD COLUMN "contact_show_phone" boolean DEFAULT true;
  ALTER TABLE "footer" ADD COLUMN "contact_show_whats_app" boolean DEFAULT true;
  ALTER TABLE "_footer_v" ADD COLUMN "version_contact_show" boolean DEFAULT true;
  ALTER TABLE "_footer_v" ADD COLUMN "version_contact_heading" varchar DEFAULT 'Contact';
  ALTER TABLE "_footer_v" ADD COLUMN "version_contact_show_email" boolean DEFAULT true;
  ALTER TABLE "_footer_v" ADD COLUMN "version_contact_show_phone" boolean DEFAULT true;
  ALTER TABLE "_footer_v" ADD COLUMN "version_contact_show_whats_app" boolean DEFAULT true;
  ALTER TABLE "footer_columns_links" ADD CONSTRAINT "footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns" ADD CONSTRAINT "footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_columns_links" ADD CONSTRAINT "_footer_v_version_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v_version_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_columns" ADD CONSTRAINT "_footer_v_version_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "footer_columns_links_order_idx" ON "footer_columns_links" USING btree ("_order");
  CREATE INDEX "footer_columns_links_parent_id_idx" ON "footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "footer_columns_order_idx" ON "footer_columns" USING btree ("_order");
  CREATE INDEX "footer_columns_parent_id_idx" ON "footer_columns" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_columns_links_order_idx" ON "_footer_v_version_columns_links" USING btree ("_order");
  CREATE INDEX "_footer_v_version_columns_links_parent_id_idx" ON "_footer_v_version_columns_links" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_columns_order_idx" ON "_footer_v_version_columns" USING btree ("_order");
  CREATE INDEX "_footer_v_version_columns_parent_id_idx" ON "_footer_v_version_columns" USING btree ("_parent_id");
  ALTER TABLE "pages_blocks_services" DROP COLUMN "page_link_label";
  ALTER TABLE "pages_blocks_contact" DROP COLUMN "form_service_label";
  ALTER TABLE "pages_blocks_contact" DROP COLUMN "form_submit_label";
  ALTER TABLE "pages_blocks_contact" DROP COLUMN "form_message_placeholder";
  ALTER TABLE "pages_blocks_contact" DROP COLUMN "form_success_text";
  ALTER TABLE "pages_blocks_contact" DROP COLUMN "form_privacy_note";
  ALTER TABLE "pages_blocks_contact" DROP COLUMN "form_privacy_url";
  ALTER TABLE "pages_rels" DROP COLUMN "services_id";
  ALTER TABLE "_pages_v_blocks_services" DROP COLUMN "page_link_label";
  ALTER TABLE "_pages_v_blocks_contact" DROP COLUMN "form_service_label";
  ALTER TABLE "_pages_v_blocks_contact" DROP COLUMN "form_submit_label";
  ALTER TABLE "_pages_v_blocks_contact" DROP COLUMN "form_message_placeholder";
  ALTER TABLE "_pages_v_blocks_contact" DROP COLUMN "form_success_text";
  ALTER TABLE "_pages_v_blocks_contact" DROP COLUMN "form_privacy_note";
  ALTER TABLE "_pages_v_blocks_contact" DROP COLUMN "form_privacy_url";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "services_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "services_id";
  ALTER TABLE "header" DROP COLUMN "quote_button_show";
  ALTER TABLE "_header_v" DROP COLUMN "version_quote_button_show";
  DROP TYPE "public"."enum_services_currency";
  DROP TYPE "public"."enum_services_status";
  DROP TYPE "public"."enum__services_v_version_currency";
  DROP TYPE "public"."enum__services_v_version_status";`)
}
