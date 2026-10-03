import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_resume_card_link_variant" AS ENUM('default', 'light', 'dark', 'accent', 'outline', 'ghost');
  CREATE TYPE "public"."enum_pages_blocks_resume_work_link_variant" AS ENUM('default', 'light', 'dark', 'accent', 'outline', 'ghost');
  CREATE TYPE "public"."enum_pages_blocks_resume_closing_link_variant" AS ENUM('default', 'light', 'dark', 'accent', 'outline', 'ghost');
  CREATE TYPE "public"."enum_pages_blocks_resume_style_width" AS ENUM('default', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_resume_style_align" AS ENUM('default', 'left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_resume_style_visibility" AS ENUM('all', 'desktop', 'mobile');
  CREATE TYPE "public"."enum__pages_v_blocks_resume_card_link_variant" AS ENUM('default', 'light', 'dark', 'accent', 'outline', 'ghost');
  CREATE TYPE "public"."enum__pages_v_blocks_resume_work_link_variant" AS ENUM('default', 'light', 'dark', 'accent', 'outline', 'ghost');
  CREATE TYPE "public"."enum__pages_v_blocks_resume_closing_link_variant" AS ENUM('default', 'light', 'dark', 'accent', 'outline', 'ghost');
  CREATE TYPE "public"."enum__pages_v_blocks_resume_style_width" AS ENUM('default', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_resume_style_align" AS ENUM('default', 'left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_resume_style_visibility" AS ENUM('all', 'desktop', 'mobile');
  CREATE TABLE "pages_blocks_resume_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_resume_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_resume_jobs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"role" varchar,
  	"company" varchar,
  	"dates" varchar,
  	"place" varchar,
  	"mode" varchar,
  	"about" varchar,
  	"summary" varchar,
  	"link_label" varchar,
  	"link_url" varchar
  );
  
  CREATE TABLE "pages_blocks_resume_skill_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_resume_schools" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"qualification" varchar,
  	"years" varchar,
  	"school" varchar,
  	"place" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "pages_blocks_resume_certs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"year" varchar,
  	"issuer" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "pages_blocks_resume" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Résumé / The experience behind the ideas',
  	"name" varchar,
  	"role" varchar,
  	"intro" varchar,
  	"current_lead" varchar DEFAULT 'Currently',
  	"current" varchar,
  	"cv_id" integer,
  	"cv_label" varchar DEFAULT 'Download résumé',
  	"card_kicker" varchar,
  	"card_heading" varchar,
  	"card_text" varchar,
  	"card_topics_label" varchar DEFAULT 'Let’s talk about',
  	"card_place" varchar,
  	"card_link_label" varchar DEFAULT 'Discuss an opportunity',
  	"card_link_url" varchar DEFAULT '/#contact',
  	"card_link_variant" "enum_pages_blocks_resume_card_link_variant" DEFAULT 'default',
  	"profile_heading" varchar DEFAULT 'Profile. *In short.*',
  	"profile" varchar,
  	"quote" varchar,
  	"xp_heading" varchar DEFAULT 'Experience. *Hands on.*',
  	"work_heading" varchar DEFAULT 'The work, *made visible.*',
  	"work_intro" varchar,
  	"work_link_label" varchar DEFAULT 'See all work',
  	"work_link_url" varchar DEFAULT '/work',
  	"work_link_variant" "enum_pages_blocks_resume_work_link_variant" DEFAULT 'default',
  	"skills_heading" varchar DEFAULT 'Skills. *And the tools.*',
  	"edu_heading" varchar DEFAULT 'Education. *Still learning.*',
  	"closing_kicker" varchar DEFAULT 'The next chapter',
  	"closing_heading" varchar DEFAULT 'Building a brand? *Let’s talk.*',
  	"closing_text" varchar,
  	"closing_link_label" varchar DEFAULT 'Let’s talk about it',
  	"closing_link_url" varchar DEFAULT '/#contact',
  	"closing_link_variant" "enum_pages_blocks_resume_closing_link_variant" DEFAULT 'default',
  	"show_email" boolean DEFAULT true,
  	"show_linked_in" boolean DEFAULT true,
  	"style_background" varchar,
  	"style_text" varchar,
  	"style_accent" varchar,
  	"style_padding_top" numeric,
  	"style_padding_bottom" numeric,
  	"style_min_height" numeric,
  	"style_width" "enum_pages_blocks_resume_style_width" DEFAULT 'default',
  	"style_align" "enum_pages_blocks_resume_style_align" DEFAULT 'default',
  	"style_visibility" "enum_pages_blocks_resume_style_visibility" DEFAULT 'all',
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_resume_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_resume_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_resume_jobs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" varchar,
  	"company" varchar,
  	"dates" varchar,
  	"place" varchar,
  	"mode" varchar,
  	"about" varchar,
  	"summary" varchar,
  	"link_label" varchar,
  	"link_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_resume_skill_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_resume_schools" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"qualification" varchar,
  	"years" varchar,
  	"school" varchar,
  	"place" varchar,
  	"note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_resume_certs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"year" varchar,
  	"issuer" varchar,
  	"note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_resume" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Résumé / The experience behind the ideas',
  	"name" varchar,
  	"role" varchar,
  	"intro" varchar,
  	"current_lead" varchar DEFAULT 'Currently',
  	"current" varchar,
  	"cv_id" integer,
  	"cv_label" varchar DEFAULT 'Download résumé',
  	"card_kicker" varchar,
  	"card_heading" varchar,
  	"card_text" varchar,
  	"card_topics_label" varchar DEFAULT 'Let’s talk about',
  	"card_place" varchar,
  	"card_link_label" varchar DEFAULT 'Discuss an opportunity',
  	"card_link_url" varchar DEFAULT '/#contact',
  	"card_link_variant" "enum__pages_v_blocks_resume_card_link_variant" DEFAULT 'default',
  	"profile_heading" varchar DEFAULT 'Profile. *In short.*',
  	"profile" varchar,
  	"quote" varchar,
  	"xp_heading" varchar DEFAULT 'Experience. *Hands on.*',
  	"work_heading" varchar DEFAULT 'The work, *made visible.*',
  	"work_intro" varchar,
  	"work_link_label" varchar DEFAULT 'See all work',
  	"work_link_url" varchar DEFAULT '/work',
  	"work_link_variant" "enum__pages_v_blocks_resume_work_link_variant" DEFAULT 'default',
  	"skills_heading" varchar DEFAULT 'Skills. *And the tools.*',
  	"edu_heading" varchar DEFAULT 'Education. *Still learning.*',
  	"closing_kicker" varchar DEFAULT 'The next chapter',
  	"closing_heading" varchar DEFAULT 'Building a brand? *Let’s talk.*',
  	"closing_text" varchar,
  	"closing_link_label" varchar DEFAULT 'Let’s talk about it',
  	"closing_link_url" varchar DEFAULT '/#contact',
  	"closing_link_variant" "enum__pages_v_blocks_resume_closing_link_variant" DEFAULT 'default',
  	"show_email" boolean DEFAULT true,
  	"show_linked_in" boolean DEFAULT true,
  	"style_background" varchar,
  	"style_text" varchar,
  	"style_accent" varchar,
  	"style_padding_top" numeric,
  	"style_padding_bottom" numeric,
  	"style_min_height" numeric,
  	"style_width" "enum__pages_v_blocks_resume_style_width" DEFAULT 'default',
  	"style_align" "enum__pages_v_blocks_resume_style_align" DEFAULT 'default',
  	"style_visibility" "enum__pages_v_blocks_resume_style_visibility" DEFAULT 'all',
  	"hidden" boolean DEFAULT false,
  	"anchor" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_resume_stats" ADD CONSTRAINT "pages_blocks_resume_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_resume"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_resume_pillars" ADD CONSTRAINT "pages_blocks_resume_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_resume"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_resume_jobs" ADD CONSTRAINT "pages_blocks_resume_jobs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_resume"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_resume_skill_groups" ADD CONSTRAINT "pages_blocks_resume_skill_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_resume"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_resume_schools" ADD CONSTRAINT "pages_blocks_resume_schools_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_resume"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_resume_certs" ADD CONSTRAINT "pages_blocks_resume_certs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_resume"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_resume" ADD CONSTRAINT "pages_blocks_resume_cv_id_media_id_fk" FOREIGN KEY ("cv_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_resume" ADD CONSTRAINT "pages_blocks_resume_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_resume_stats" ADD CONSTRAINT "_pages_v_blocks_resume_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_resume"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_resume_pillars" ADD CONSTRAINT "_pages_v_blocks_resume_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_resume"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_resume_jobs" ADD CONSTRAINT "_pages_v_blocks_resume_jobs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_resume"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_resume_skill_groups" ADD CONSTRAINT "_pages_v_blocks_resume_skill_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_resume"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_resume_schools" ADD CONSTRAINT "_pages_v_blocks_resume_schools_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_resume"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_resume_certs" ADD CONSTRAINT "_pages_v_blocks_resume_certs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_resume"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_resume" ADD CONSTRAINT "_pages_v_blocks_resume_cv_id_media_id_fk" FOREIGN KEY ("cv_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_resume" ADD CONSTRAINT "_pages_v_blocks_resume_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_resume_stats_order_idx" ON "pages_blocks_resume_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_resume_stats_parent_id_idx" ON "pages_blocks_resume_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_resume_pillars_order_idx" ON "pages_blocks_resume_pillars" USING btree ("_order");
  CREATE INDEX "pages_blocks_resume_pillars_parent_id_idx" ON "pages_blocks_resume_pillars" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_resume_jobs_order_idx" ON "pages_blocks_resume_jobs" USING btree ("_order");
  CREATE INDEX "pages_blocks_resume_jobs_parent_id_idx" ON "pages_blocks_resume_jobs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_resume_skill_groups_order_idx" ON "pages_blocks_resume_skill_groups" USING btree ("_order");
  CREATE INDEX "pages_blocks_resume_skill_groups_parent_id_idx" ON "pages_blocks_resume_skill_groups" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_resume_schools_order_idx" ON "pages_blocks_resume_schools" USING btree ("_order");
  CREATE INDEX "pages_blocks_resume_schools_parent_id_idx" ON "pages_blocks_resume_schools" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_resume_certs_order_idx" ON "pages_blocks_resume_certs" USING btree ("_order");
  CREATE INDEX "pages_blocks_resume_certs_parent_id_idx" ON "pages_blocks_resume_certs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_resume_order_idx" ON "pages_blocks_resume" USING btree ("_order");
  CREATE INDEX "pages_blocks_resume_parent_id_idx" ON "pages_blocks_resume" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_resume_path_idx" ON "pages_blocks_resume" USING btree ("_path");
  CREATE INDEX "pages_blocks_resume_cv_idx" ON "pages_blocks_resume" USING btree ("cv_id");
  CREATE INDEX "_pages_v_blocks_resume_stats_order_idx" ON "_pages_v_blocks_resume_stats" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_resume_stats_parent_id_idx" ON "_pages_v_blocks_resume_stats" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_resume_pillars_order_idx" ON "_pages_v_blocks_resume_pillars" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_resume_pillars_parent_id_idx" ON "_pages_v_blocks_resume_pillars" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_resume_jobs_order_idx" ON "_pages_v_blocks_resume_jobs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_resume_jobs_parent_id_idx" ON "_pages_v_blocks_resume_jobs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_resume_skill_groups_order_idx" ON "_pages_v_blocks_resume_skill_groups" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_resume_skill_groups_parent_id_idx" ON "_pages_v_blocks_resume_skill_groups" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_resume_schools_order_idx" ON "_pages_v_blocks_resume_schools" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_resume_schools_parent_id_idx" ON "_pages_v_blocks_resume_schools" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_resume_certs_order_idx" ON "_pages_v_blocks_resume_certs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_resume_certs_parent_id_idx" ON "_pages_v_blocks_resume_certs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_resume_order_idx" ON "_pages_v_blocks_resume" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_resume_parent_id_idx" ON "_pages_v_blocks_resume" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_resume_path_idx" ON "_pages_v_blocks_resume" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_resume_cv_idx" ON "_pages_v_blocks_resume" USING btree ("cv_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_resume_stats" CASCADE;
  DROP TABLE "pages_blocks_resume_pillars" CASCADE;
  DROP TABLE "pages_blocks_resume_jobs" CASCADE;
  DROP TABLE "pages_blocks_resume_skill_groups" CASCADE;
  DROP TABLE "pages_blocks_resume_schools" CASCADE;
  DROP TABLE "pages_blocks_resume_certs" CASCADE;
  DROP TABLE "pages_blocks_resume" CASCADE;
  DROP TABLE "_pages_v_blocks_resume_stats" CASCADE;
  DROP TABLE "_pages_v_blocks_resume_pillars" CASCADE;
  DROP TABLE "_pages_v_blocks_resume_jobs" CASCADE;
  DROP TABLE "_pages_v_blocks_resume_skill_groups" CASCADE;
  DROP TABLE "_pages_v_blocks_resume_schools" CASCADE;
  DROP TABLE "_pages_v_blocks_resume_certs" CASCADE;
  DROP TABLE "_pages_v_blocks_resume" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_resume_card_link_variant";
  DROP TYPE "public"."enum_pages_blocks_resume_work_link_variant";
  DROP TYPE "public"."enum_pages_blocks_resume_closing_link_variant";
  DROP TYPE "public"."enum_pages_blocks_resume_style_width";
  DROP TYPE "public"."enum_pages_blocks_resume_style_align";
  DROP TYPE "public"."enum_pages_blocks_resume_style_visibility";
  DROP TYPE "public"."enum__pages_v_blocks_resume_card_link_variant";
  DROP TYPE "public"."enum__pages_v_blocks_resume_work_link_variant";
  DROP TYPE "public"."enum__pages_v_blocks_resume_closing_link_variant";
  DROP TYPE "public"."enum__pages_v_blocks_resume_style_width";
  DROP TYPE "public"."enum__pages_v_blocks_resume_style_align";
  DROP TYPE "public"."enum__pages_v_blocks_resume_style_visibility";`)
}
