import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_about_banner_layout" AS ENUM('editorial', 'banner');
  CREATE TYPE "public"."enum__pages_v_blocks_about_banner_layout" AS ENUM('editorial', 'banner');
  CREATE TABLE "pages_blocks_about_banner_tabs_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_about_banner_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"heading" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_about_banner_tabs_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_about_banner_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"heading" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "footer_legal" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "_footer_v_version_legal" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  ALTER TABLE "footer" ALTER COLUMN "copyright" SET DEFAULT '© {year} {name}. All rights reserved.';
  ALTER TABLE "_footer_v" ALTER COLUMN "version_copyright" SET DEFAULT '© {year} {name}. All rights reserved.';
  ALTER TABLE "pages_blocks_about_banner" ADD COLUMN "layout" "enum_pages_blocks_about_banner_layout" DEFAULT 'editorial';
  ALTER TABLE "pages_blocks_about_banner" ADD COLUMN "role" varchar DEFAULT 'Senior Graphic & Brand Designer';
  ALTER TABLE "_pages_v_blocks_about_banner" ADD COLUMN "layout" "enum__pages_v_blocks_about_banner_layout" DEFAULT 'editorial';
  ALTER TABLE "_pages_v_blocks_about_banner" ADD COLUMN "role" varchar DEFAULT 'Senior Graphic & Brand Designer';
  ALTER TABLE "footer" ADD COLUMN "cta_show" boolean DEFAULT true;
  ALTER TABLE "footer" ADD COLUMN "cta_heading" varchar DEFAULT 'Ready to elevate your visual identity?';
  ALTER TABLE "footer" ADD COLUMN "cta_text" varchar DEFAULT 'Let’s partner to create high-impact graphics and social media campaigns that drive growth.';
  ALTER TABLE "footer" ADD COLUMN "cta_button_label" varchar DEFAULT 'Book a Strategy Call';
  ALTER TABLE "footer" ADD COLUMN "cta_button_url" varchar DEFAULT '/#contact';
  ALTER TABLE "_footer_v" ADD COLUMN "version_cta_show" boolean DEFAULT true;
  ALTER TABLE "_footer_v" ADD COLUMN "version_cta_heading" varchar DEFAULT 'Ready to elevate your visual identity?';
  ALTER TABLE "_footer_v" ADD COLUMN "version_cta_text" varchar DEFAULT 'Let’s partner to create high-impact graphics and social media campaigns that drive growth.';
  ALTER TABLE "_footer_v" ADD COLUMN "version_cta_button_label" varchar DEFAULT 'Book a Strategy Call';
  ALTER TABLE "_footer_v" ADD COLUMN "version_cta_button_url" varchar DEFAULT '/#contact';
  ALTER TABLE "pages_blocks_about_banner_tabs_rows" ADD CONSTRAINT "pages_blocks_about_banner_tabs_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_about_banner_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_about_banner_tabs" ADD CONSTRAINT "pages_blocks_about_banner_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_about_banner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_about_banner_tabs_rows" ADD CONSTRAINT "_pages_v_blocks_about_banner_tabs_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_about_banner_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_about_banner_tabs" ADD CONSTRAINT "_pages_v_blocks_about_banner_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_about_banner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_legal" ADD CONSTRAINT "footer_legal_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_legal" ADD CONSTRAINT "_footer_v_version_legal_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_about_banner_tabs_rows_order_idx" ON "pages_blocks_about_banner_tabs_rows" USING btree ("_order");
  CREATE INDEX "pages_blocks_about_banner_tabs_rows_parent_id_idx" ON "pages_blocks_about_banner_tabs_rows" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_about_banner_tabs_order_idx" ON "pages_blocks_about_banner_tabs" USING btree ("_order");
  CREATE INDEX "pages_blocks_about_banner_tabs_parent_id_idx" ON "pages_blocks_about_banner_tabs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_about_banner_tabs_rows_order_idx" ON "_pages_v_blocks_about_banner_tabs_rows" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_about_banner_tabs_rows_parent_id_idx" ON "_pages_v_blocks_about_banner_tabs_rows" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_about_banner_tabs_order_idx" ON "_pages_v_blocks_about_banner_tabs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_about_banner_tabs_parent_id_idx" ON "_pages_v_blocks_about_banner_tabs" USING btree ("_parent_id");
  CREATE INDEX "footer_legal_order_idx" ON "footer_legal" USING btree ("_order");
  CREATE INDEX "footer_legal_parent_id_idx" ON "footer_legal" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_legal_order_idx" ON "_footer_v_version_legal" USING btree ("_order");
  CREATE INDEX "_footer_v_version_legal_parent_id_idx" ON "_footer_v_version_legal" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_about_banner_tabs_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_about_banner_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_about_banner_tabs_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_about_banner_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_legal" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_legal" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_about_banner_tabs_rows" CASCADE;
  DROP TABLE "pages_blocks_about_banner_tabs" CASCADE;
  DROP TABLE "_pages_v_blocks_about_banner_tabs_rows" CASCADE;
  DROP TABLE "_pages_v_blocks_about_banner_tabs" CASCADE;
  DROP TABLE "footer_legal" CASCADE;
  DROP TABLE "_footer_v_version_legal" CASCADE;
  ALTER TABLE "footer" ALTER COLUMN "copyright" SET DEFAULT '© {year} {name}.';
  ALTER TABLE "_footer_v" ALTER COLUMN "version_copyright" SET DEFAULT '© {year} {name}.';
  ALTER TABLE "pages_blocks_about_banner" DROP COLUMN "layout";
  ALTER TABLE "pages_blocks_about_banner" DROP COLUMN "role";
  ALTER TABLE "_pages_v_blocks_about_banner" DROP COLUMN "layout";
  ALTER TABLE "_pages_v_blocks_about_banner" DROP COLUMN "role";
  ALTER TABLE "footer" DROP COLUMN "cta_show";
  ALTER TABLE "footer" DROP COLUMN "cta_heading";
  ALTER TABLE "footer" DROP COLUMN "cta_text";
  ALTER TABLE "footer" DROP COLUMN "cta_button_label";
  ALTER TABLE "footer" DROP COLUMN "cta_button_url";
  ALTER TABLE "_footer_v" DROP COLUMN "version_cta_show";
  ALTER TABLE "_footer_v" DROP COLUMN "version_cta_heading";
  ALTER TABLE "_footer_v" DROP COLUMN "version_cta_text";
  ALTER TABLE "_footer_v" DROP COLUMN "version_cta_button_label";
  ALTER TABLE "_footer_v" DROP COLUMN "version_cta_button_url";
  DROP TYPE "public"."enum_pages_blocks_about_banner_layout";
  DROP TYPE "public"."enum__pages_v_blocks_about_banner_layout";`)
}
