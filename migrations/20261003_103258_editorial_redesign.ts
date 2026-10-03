import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_inquiries_brand_stage" AS ENUM('new', 'rebrand', 'refresh');
  ALTER TYPE "public"."enum_pages_blocks_about_banner_layout" ADD VALUE 'portrait' BEFORE 'editorial';
  ALTER TYPE "public"."enum__pages_v_blocks_about_banner_layout" ADD VALUE 'portrait' BEFORE 'editorial';
  ALTER TABLE "pages_blocks_about_banner" ADD COLUMN "mood_photo_id" integer;
  ALTER TABLE "pages_blocks_about_banner" ADD COLUMN "caption" varchar;
  ALTER TABLE "pages_blocks_services_items" ADD COLUMN "image_caption" varchar;
  ALTER TABLE "pages_blocks_services_items" ADD COLUMN "featured" boolean;
  ALTER TABLE "pages_blocks_services_items" ADD COLUMN "starter" boolean;
  ALTER TABLE "_pages_v_blocks_about_banner" ADD COLUMN "mood_photo_id" integer;
  ALTER TABLE "_pages_v_blocks_about_banner" ADD COLUMN "caption" varchar;
  ALTER TABLE "_pages_v_blocks_services_items" ADD COLUMN "image_caption" varchar;
  ALTER TABLE "_pages_v_blocks_services_items" ADD COLUMN "featured" boolean;
  ALTER TABLE "_pages_v_blocks_services_items" ADD COLUMN "starter" boolean;
  ALTER TABLE "projects" ADD COLUMN "contribution" varchar;
  ALTER TABLE "_projects_v" ADD COLUMN "version_contribution" varchar;
  ALTER TABLE "inquiries" ADD COLUMN "brand_stage" "enum_inquiries_brand_stage";
  ALTER TABLE "inquiries" ADD COLUMN "whatsapp" varchar;
  ALTER TABLE "inquiries" ADD COLUMN "logo_wording" varchar;
  ALTER TABLE "inquiries" ADD COLUMN "keep" varchar;
  ALTER TABLE "site" ADD COLUMN "tagline" varchar;
  ALTER TABLE "_site_v" ADD COLUMN "version_tagline" varchar;
  ALTER TABLE "pages_blocks_about_banner" ADD CONSTRAINT "pages_blocks_about_banner_mood_photo_id_media_id_fk" FOREIGN KEY ("mood_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_about_banner" ADD CONSTRAINT "_pages_v_blocks_about_banner_mood_photo_id_media_id_fk" FOREIGN KEY ("mood_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_about_banner_mood_photo_idx" ON "pages_blocks_about_banner" USING btree ("mood_photo_id");
  CREATE INDEX "_pages_v_blocks_about_banner_mood_photo_idx" ON "_pages_v_blocks_about_banner" USING btree ("mood_photo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_about_banner" DROP CONSTRAINT "pages_blocks_about_banner_mood_photo_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_about_banner" DROP CONSTRAINT "_pages_v_blocks_about_banner_mood_photo_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_about_banner" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_about_banner" ALTER COLUMN "layout" SET DEFAULT 'editorial'::text;
  DROP TYPE "public"."enum_pages_blocks_about_banner_layout";
  CREATE TYPE "public"."enum_pages_blocks_about_banner_layout" AS ENUM('editorial', 'banner');
  ALTER TABLE "pages_blocks_about_banner" ALTER COLUMN "layout" SET DEFAULT 'editorial'::"public"."enum_pages_blocks_about_banner_layout";
  ALTER TABLE "pages_blocks_about_banner" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_pages_blocks_about_banner_layout" USING "layout"::"public"."enum_pages_blocks_about_banner_layout";
  ALTER TABLE "_pages_v_blocks_about_banner" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_about_banner" ALTER COLUMN "layout" SET DEFAULT 'editorial'::text;
  DROP TYPE "public"."enum__pages_v_blocks_about_banner_layout";
  CREATE TYPE "public"."enum__pages_v_blocks_about_banner_layout" AS ENUM('editorial', 'banner');
  ALTER TABLE "_pages_v_blocks_about_banner" ALTER COLUMN "layout" SET DEFAULT 'editorial'::"public"."enum__pages_v_blocks_about_banner_layout";
  ALTER TABLE "_pages_v_blocks_about_banner" ALTER COLUMN "layout" SET DATA TYPE "public"."enum__pages_v_blocks_about_banner_layout" USING "layout"::"public"."enum__pages_v_blocks_about_banner_layout";
  DROP INDEX "pages_blocks_about_banner_mood_photo_idx";
  DROP INDEX "_pages_v_blocks_about_banner_mood_photo_idx";
  ALTER TABLE "pages_blocks_about_banner" DROP COLUMN "mood_photo_id";
  ALTER TABLE "pages_blocks_about_banner" DROP COLUMN "caption";
  ALTER TABLE "pages_blocks_services_items" DROP COLUMN "image_caption";
  ALTER TABLE "pages_blocks_services_items" DROP COLUMN "featured";
  ALTER TABLE "pages_blocks_services_items" DROP COLUMN "starter";
  ALTER TABLE "_pages_v_blocks_about_banner" DROP COLUMN "mood_photo_id";
  ALTER TABLE "_pages_v_blocks_about_banner" DROP COLUMN "caption";
  ALTER TABLE "_pages_v_blocks_services_items" DROP COLUMN "image_caption";
  ALTER TABLE "_pages_v_blocks_services_items" DROP COLUMN "featured";
  ALTER TABLE "_pages_v_blocks_services_items" DROP COLUMN "starter";
  ALTER TABLE "projects" DROP COLUMN "contribution";
  ALTER TABLE "_projects_v" DROP COLUMN "version_contribution";
  ALTER TABLE "inquiries" DROP COLUMN "brand_stage";
  ALTER TABLE "inquiries" DROP COLUMN "whatsapp";
  ALTER TABLE "inquiries" DROP COLUMN "logo_wording";
  ALTER TABLE "inquiries" DROP COLUMN "keep";
  ALTER TABLE "site" DROP COLUMN "tagline";
  ALTER TABLE "_site_v" DROP COLUMN "version_tagline";
  DROP TYPE "public"."enum_inquiries_brand_stage";`)
}
