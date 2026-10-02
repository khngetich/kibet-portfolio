import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_tools_style_width" AS ENUM('default', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_tools_style_align" AS ENUM('default', 'left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_tools_style_visibility" AS ENUM('all', 'desktop', 'mobile');
  CREATE TYPE "public"."enum_pages_blocks_showreel_style_width" AS ENUM('default', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_showreel_style_align" AS ENUM('default', 'left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_showreel_style_visibility" AS ENUM('all', 'desktop', 'mobile');
  CREATE TYPE "public"."enum_pages_blocks_insights_button_variant" AS ENUM('default', 'light', 'dark', 'accent', 'outline', 'ghost');
  CREATE TYPE "public"."enum_pages_blocks_insights_style_width" AS ENUM('default', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_insights_style_align" AS ENUM('default', 'left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_insights_style_visibility" AS ENUM('all', 'desktop', 'mobile');
  CREATE TYPE "public"."enum__pages_v_blocks_tools_style_width" AS ENUM('default', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_tools_style_align" AS ENUM('default', 'left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_tools_style_visibility" AS ENUM('all', 'desktop', 'mobile');
  CREATE TYPE "public"."enum__pages_v_blocks_showreel_style_width" AS ENUM('default', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_showreel_style_align" AS ENUM('default', 'left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_showreel_style_visibility" AS ENUM('all', 'desktop', 'mobile');
  CREATE TYPE "public"."enum__pages_v_blocks_insights_button_variant" AS ENUM('default', 'light', 'dark', 'accent', 'outline', 'ghost');
  CREATE TYPE "public"."enum__pages_v_blocks_insights_style_width" AS ENUM('default', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_insights_style_align" AS ENUM('default', 'left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_insights_style_visibility" AS ENUM('all', 'desktop', 'mobile');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "pages_blocks_tools" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Tools',
  	"heading" varchar DEFAULT 'Tools I work with',
  	"intro" varchar,
  	"show_counts" boolean DEFAULT true,
  	"style_background" varchar,
  	"style_text" varchar,
  	"style_accent" varchar,
  	"style_padding_top" numeric,
  	"style_padding_bottom" numeric,
  	"style_min_height" numeric,
  	"style_width" "enum_pages_blocks_tools_style_width" DEFAULT 'default',
  	"style_align" "enum_pages_blocks_tools_style_align" DEFAULT 'default',
  	"style_visibility" "enum_pages_blocks_tools_style_visibility" DEFAULT 'all',
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_showreel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Showreel',
  	"heading" varchar DEFAULT 'A quick look at my work',
  	"text" varchar DEFAULT 'A short reel of recent work, from first sketch to final frame.',
  	"video_id" integer,
  	"link" varchar,
  	"poster_id" integer,
  	"button_label" varchar DEFAULT 'Watch the showreel',
  	"style_background" varchar,
  	"style_text" varchar,
  	"style_accent" varchar,
  	"style_padding_top" numeric,
  	"style_padding_bottom" numeric,
  	"style_min_height" numeric,
  	"style_width" "enum_pages_blocks_showreel_style_width" DEFAULT 'default',
  	"style_align" "enum_pages_blocks_showreel_style_align" DEFAULT 'default',
  	"style_visibility" "enum_pages_blocks_showreel_style_visibility" DEFAULT 'all',
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_insights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Insights',
  	"heading" varchar DEFAULT 'Insights & ideas',
  	"count" numeric DEFAULT 3,
  	"button_label" varchar DEFAULT 'Read all insights',
  	"button_url" varchar DEFAULT '/insights',
  	"button_variant" "enum_pages_blocks_insights_button_variant" DEFAULT 'default',
  	"style_background" varchar,
  	"style_text" varchar,
  	"style_accent" varchar,
  	"style_padding_top" numeric,
  	"style_padding_bottom" numeric,
  	"style_min_height" numeric,
  	"style_width" "enum_pages_blocks_insights_style_width" DEFAULT 'default',
  	"style_align" "enum_pages_blocks_insights_style_align" DEFAULT 'default',
  	"style_visibility" "enum_pages_blocks_insights_style_visibility" DEFAULT 'all',
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_tools" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Tools',
  	"heading" varchar DEFAULT 'Tools I work with',
  	"intro" varchar,
  	"show_counts" boolean DEFAULT true,
  	"style_background" varchar,
  	"style_text" varchar,
  	"style_accent" varchar,
  	"style_padding_top" numeric,
  	"style_padding_bottom" numeric,
  	"style_min_height" numeric,
  	"style_width" "enum__pages_v_blocks_tools_style_width" DEFAULT 'default',
  	"style_align" "enum__pages_v_blocks_tools_style_align" DEFAULT 'default',
  	"style_visibility" "enum__pages_v_blocks_tools_style_visibility" DEFAULT 'all',
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_showreel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Showreel',
  	"heading" varchar DEFAULT 'A quick look at my work',
  	"text" varchar DEFAULT 'A short reel of recent work, from first sketch to final frame.',
  	"video_id" integer,
  	"link" varchar,
  	"poster_id" integer,
  	"button_label" varchar DEFAULT 'Watch the showreel',
  	"style_background" varchar,
  	"style_text" varchar,
  	"style_accent" varchar,
  	"style_padding_top" numeric,
  	"style_padding_bottom" numeric,
  	"style_min_height" numeric,
  	"style_width" "enum__pages_v_blocks_showreel_style_width" DEFAULT 'default',
  	"style_align" "enum__pages_v_blocks_showreel_style_align" DEFAULT 'default',
  	"style_visibility" "enum__pages_v_blocks_showreel_style_visibility" DEFAULT 'all',
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_insights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Insights',
  	"heading" varchar DEFAULT 'Insights & ideas',
  	"count" numeric DEFAULT 3,
  	"button_label" varchar DEFAULT 'Read all insights',
  	"button_url" varchar DEFAULT '/insights',
  	"button_variant" "enum__pages_v_blocks_insights_button_variant" DEFAULT 'default',
  	"style_background" varchar,
  	"style_text" varchar,
  	"style_accent" varchar,
  	"style_padding_top" numeric,
  	"style_padding_bottom" numeric,
  	"style_min_height" numeric,
  	"style_width" "enum__pages_v_blocks_insights_style_width" DEFAULT 'default',
  	"style_align" "enum__pages_v_blocks_insights_style_align" DEFAULT 'default',
  	"style_visibility" "enum__pages_v_blocks_insights_style_visibility" DEFAULT 'all',
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"excerpt" varchar,
  	"cover_id" integer,
  	"content" jsonb,
  	"published_at" timestamp(3) with time zone,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"meta_title" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "posts_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_excerpt" varchar,
  	"version_cover_id" integer,
  	"version_content" jsonb,
  	"version_published_at" timestamp(3) with time zone,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_meta_title" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_posts_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "pages_blocks_tools" ADD CONSTRAINT "pages_blocks_tools_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_showreel" ADD CONSTRAINT "pages_blocks_showreel_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_showreel" ADD CONSTRAINT "pages_blocks_showreel_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_showreel" ADD CONSTRAINT "pages_blocks_showreel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_insights" ADD CONSTRAINT "pages_blocks_insights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tools" ADD CONSTRAINT "_pages_v_blocks_tools_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_showreel" ADD CONSTRAINT "_pages_v_blocks_showreel_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_showreel" ADD CONSTRAINT "_pages_v_blocks_showreel_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_showreel" ADD CONSTRAINT "_pages_v_blocks_showreel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_insights" ADD CONSTRAINT "_pages_v_blocks_insights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_texts" ADD CONSTRAINT "posts_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_texts" ADD CONSTRAINT "_posts_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_tools_order_idx" ON "pages_blocks_tools" USING btree ("_order");
  CREATE INDEX "pages_blocks_tools_parent_id_idx" ON "pages_blocks_tools" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_tools_path_idx" ON "pages_blocks_tools" USING btree ("_path");
  CREATE INDEX "pages_blocks_showreel_order_idx" ON "pages_blocks_showreel" USING btree ("_order");
  CREATE INDEX "pages_blocks_showreel_parent_id_idx" ON "pages_blocks_showreel" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_showreel_path_idx" ON "pages_blocks_showreel" USING btree ("_path");
  CREATE INDEX "pages_blocks_showreel_video_idx" ON "pages_blocks_showreel" USING btree ("video_id");
  CREATE INDEX "pages_blocks_showreel_poster_idx" ON "pages_blocks_showreel" USING btree ("poster_id");
  CREATE INDEX "pages_blocks_insights_order_idx" ON "pages_blocks_insights" USING btree ("_order");
  CREATE INDEX "pages_blocks_insights_parent_id_idx" ON "pages_blocks_insights" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_insights_path_idx" ON "pages_blocks_insights" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_tools_order_idx" ON "_pages_v_blocks_tools" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_tools_parent_id_idx" ON "_pages_v_blocks_tools" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_tools_path_idx" ON "_pages_v_blocks_tools" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_showreel_order_idx" ON "_pages_v_blocks_showreel" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_showreel_parent_id_idx" ON "_pages_v_blocks_showreel" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_showreel_path_idx" ON "_pages_v_blocks_showreel" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_showreel_video_idx" ON "_pages_v_blocks_showreel" USING btree ("video_id");
  CREATE INDEX "_pages_v_blocks_showreel_poster_idx" ON "_pages_v_blocks_showreel" USING btree ("poster_id");
  CREATE INDEX "_pages_v_blocks_insights_order_idx" ON "_pages_v_blocks_insights" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_insights_parent_id_idx" ON "_pages_v_blocks_insights" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_insights_path_idx" ON "_pages_v_blocks_insights" USING btree ("_path");
  CREATE INDEX "posts_cover_idx" ON "posts" USING btree ("cover_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "posts_texts_order_parent" ON "posts_texts" USING btree ("order","parent_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_cover_idx" ON "_posts_v" USING btree ("version_cover_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_autosave_idx" ON "_posts_v" USING btree ("autosave");
  CREATE INDEX "_posts_v_texts_order_parent" ON "_posts_v_texts" USING btree ("order","parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_tools" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_showreel" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_insights" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_tools" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_showreel" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_insights" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_texts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_tools" CASCADE;
  DROP TABLE "pages_blocks_showreel" CASCADE;
  DROP TABLE "pages_blocks_insights" CASCADE;
  DROP TABLE "_pages_v_blocks_tools" CASCADE;
  DROP TABLE "_pages_v_blocks_showreel" CASCADE;
  DROP TABLE "_pages_v_blocks_insights" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_texts" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_texts" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_posts_fk";
  
  DROP INDEX "payload_locked_documents_rels_posts_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "posts_id";
  DROP TYPE "public"."enum_pages_blocks_tools_style_width";
  DROP TYPE "public"."enum_pages_blocks_tools_style_align";
  DROP TYPE "public"."enum_pages_blocks_tools_style_visibility";
  DROP TYPE "public"."enum_pages_blocks_showreel_style_width";
  DROP TYPE "public"."enum_pages_blocks_showreel_style_align";
  DROP TYPE "public"."enum_pages_blocks_showreel_style_visibility";
  DROP TYPE "public"."enum_pages_blocks_insights_button_variant";
  DROP TYPE "public"."enum_pages_blocks_insights_style_width";
  DROP TYPE "public"."enum_pages_blocks_insights_style_align";
  DROP TYPE "public"."enum_pages_blocks_insights_style_visibility";
  DROP TYPE "public"."enum__pages_v_blocks_tools_style_width";
  DROP TYPE "public"."enum__pages_v_blocks_tools_style_align";
  DROP TYPE "public"."enum__pages_v_blocks_tools_style_visibility";
  DROP TYPE "public"."enum__pages_v_blocks_showreel_style_width";
  DROP TYPE "public"."enum__pages_v_blocks_showreel_style_align";
  DROP TYPE "public"."enum__pages_v_blocks_showreel_style_visibility";
  DROP TYPE "public"."enum__pages_v_blocks_insights_button_variant";
  DROP TYPE "public"."enum__pages_v_blocks_insights_style_width";
  DROP TYPE "public"."enum__pages_v_blocks_insights_style_align";
  DROP TYPE "public"."enum__pages_v_blocks_insights_style_visibility";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_status";`)
}
